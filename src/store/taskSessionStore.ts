"use client";

import {create} from "zustand";
import {persistedTaskSessionSchema} from "@/lib/task-session-schema";
import type {
  AnalyzeGoalResult,
  MoodEmoji,
  PersistedTaskSession,
  TaskSession,
} from "@/types/tasks";

const storageKey = "ddak.task-session.v1";

type StorageState = "unknown" | "ready" | "invalid";

type TaskSessionStore = {
  session: TaskSession | null;
  pendingResumeSession: TaskSession | null;
  storageState: StorageState;
  storageError: string | null;
  moodTaskId: string | null;
  burstKey: number;
  hydrateFromStorage: () => void;
  continueStoredSession: () => void;
  discardSession: () => void;
  createSession: (result: AnalyzeGoalResult) => void;
  startCurrentTask: () => void;
  completeCurrentTask: () => void;
  finishMoodCheck: (mood?: MoodEmoji) => void;
};

function createId(prefix: string): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function persistSession(session: TaskSession | null) {
  if (typeof window === "undefined") {
    return;
  }

  if (!session) {
    window.localStorage.removeItem(storageKey);
    return;
  }

  const payload: PersistedTaskSession = {
    schemaVersion: 1,
    session,
  };

  window.localStorage.setItem(storageKey, JSON.stringify(payload));
}

function getFirstOpenIndex(session: TaskSession): number | null {
  const index = session.tasks.findIndex((task) => task.status !== "done");
  return index >= 0 ? index : null;
}

function normalizeSession(session: TaskSession): TaskSession {
  const openIndex = getFirstOpenIndex(session);

  if (openIndex === null) {
    return {
      ...session,
      currentIndex: Math.max(0, session.tasks.length - 1),
      completedAt: session.completedAt ?? new Date().toISOString(),
    };
  }

  return {
    ...session,
    currentIndex: openIndex,
  };
}

function buildSession(result: AnalyzeGoalResult): TaskSession {
  const now = new Date().toISOString();

  return {
    id: createId("session"),
    goal: result.goal,
    emotionTag: result.emotionTag,
    currentIndex: 0,
    createdAt: now,
    updatedAt: now,
    tasks: result.tasks.map((task, index) => ({
      ...task,
      id: createId(`task-${index + 1}`),
      status: "pending",
    })),
  };
}

export const useTaskSessionStore = create<TaskSessionStore>((set, get) => ({
  session: null,
  pendingResumeSession: null,
  storageState: "unknown",
  storageError: null,
  moodTaskId: null,
  burstKey: 0,

  hydrateFromStorage: () => {
    if (typeof window === "undefined") {
      return;
    }

    const raw = window.localStorage.getItem(storageKey);

    if (!raw) {
      set({storageState: "ready", storageError: null});
      return;
    }

    let parsedJson: unknown;

    try {
      parsedJson = JSON.parse(raw);
    } catch {
      set({
        storageState: "invalid",
        storageError: "저장된 진행 상태의 JSON 형식이 올바르지 않아요.",
        pendingResumeSession: null,
        session: null,
      });
      return;
    }

    const parsed = persistedTaskSessionSchema.safeParse(parsedJson);

    if (!parsed.success) {
      set({
        storageState: "invalid",
        storageError: "저장된 진행 상태가 현재 앱 버전과 맞지 않아요.",
        pendingResumeSession: null,
        session: null,
      });
      return;
    }

    const session = normalizeSession(parsed.data.session);

    if (session.completedAt) {
      set({
        session,
        pendingResumeSession: null,
        storageState: "ready",
        storageError: null,
      });
      return;
    }

    set({
      session: null,
      pendingResumeSession: session,
      storageState: "ready",
      storageError: null,
    });
  },

  continueStoredSession: () => {
    const pendingResumeSession = get().pendingResumeSession;

    if (!pendingResumeSession) {
      return;
    }

    set({
      session: pendingResumeSession,
      pendingResumeSession: null,
      storageState: "ready",
      storageError: null,
    });
  },

  discardSession: () => {
    persistSession(null);
    set({
      session: null,
      pendingResumeSession: null,
      storageState: "ready",
      storageError: null,
      moodTaskId: null,
    });
  },

  createSession: (result) => {
    const session = buildSession(result);
    persistSession(session);
    set({
      session,
      pendingResumeSession: null,
      storageState: "ready",
      storageError: null,
      moodTaskId: null,
      burstKey: get().burstKey + 1,
    });
  },

  startCurrentTask: () => {
    const session = get().session;

    if (!session || session.completedAt) {
      return;
    }

    const now = new Date().toISOString();
    const tasks = session.tasks.map((task, index) =>
      index === session.currentIndex && task.status === "pending"
        ? {...task, status: "started" as const}
        : task,
    );
    const updatedSession = {...session, tasks, updatedAt: now};

    persistSession(updatedSession);
    set({
      session: updatedSession,
      burstKey: get().burstKey + 1,
    });
  },

  completeCurrentTask: () => {
    const session = get().session;

    if (!session || session.completedAt) {
      return;
    }

    const currentTask = session.tasks[session.currentIndex];

    if (!currentTask) {
      return;
    }

    const now = new Date().toISOString();
    const tasks = session.tasks.map((task, index) =>
      index === session.currentIndex
        ? {...task, status: "done" as const, completedAt: now}
        : task,
    );
    const updatedSession = {...session, tasks, updatedAt: now};

    persistSession(updatedSession);
    set({
      session: updatedSession,
      moodTaskId: currentTask.id,
      burstKey: get().burstKey + 1,
    });
  },

  finishMoodCheck: (mood) => {
    const session = get().session;
    const moodTaskId = get().moodTaskId;

    if (!session || !moodTaskId) {
      return;
    }

    const now = new Date().toISOString();
    const tasks = session.tasks.map((task) =>
      task.id === moodTaskId && mood
        ? {...task, mood, status: "done" as const}
        : task,
    );
    const nextIndex = tasks.findIndex((task) => task.status !== "done");
    const completedAt = nextIndex === -1 ? now : undefined;
    const updatedSession: TaskSession = {
      ...session,
      tasks,
      currentIndex: nextIndex === -1 ? Math.max(0, tasks.length - 1) : nextIndex,
      updatedAt: now,
      completedAt,
    };

    persistSession(updatedSession);
    set({
      session: updatedSession,
      moodTaskId: null,
    });
  },
}));
