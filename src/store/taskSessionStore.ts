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
const storageReadErrorMessage =
  "브라우저 저장소를 읽을 수 없어 이전 진행 상태를 복구하지 못했어요.";
const storageWriteErrorMessage =
  "브라우저 저장소를 사용할 수 없어 이번 진행 상태는 새로고침 후 복구되지 않을 수 있어요.";
const storageClearErrorMessage =
  "브라우저 저장소를 지우지 못했어요. 이번 화면에서는 새로 시작할 수 있지만 새로고침 후 이전 상태가 다시 보일 수 있어요.";

type StorageState = "unknown" | "ready" | "invalid";

type StorageReadResult =
  | {status: "empty"}
  | {status: "value"; raw: string}
  | {status: "unavailable"; message: string};

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

function readPersistedSession(): StorageReadResult {
  if (typeof window === "undefined") {
    return {status: "empty"};
  }

  try {
    const raw = window.localStorage.getItem(storageKey);

    if (!raw) {
      return {status: "empty"};
    }

    return {status: "value", raw};
  } catch (error) {
    console.warn("Failed to read task session storage", error);
    return {status: "unavailable", message: storageReadErrorMessage};
  }
}

function persistSession(session: TaskSession | null): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    if (!session) {
      window.localStorage.removeItem(storageKey);
      return null;
    }

    const payload: PersistedTaskSession = {
      schemaVersion: 1,
      session,
    };

    window.localStorage.setItem(storageKey, JSON.stringify(payload));
    return null;
  } catch (error) {
    console.warn("Failed to persist task session storage", error);
    return session ? storageWriteErrorMessage : storageClearErrorMessage;
  }
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

    const storedSession = readPersistedSession();

    if (storedSession.status === "unavailable") {
      set({
        session: null,
        pendingResumeSession: null,
        storageState: "ready",
        storageError: storedSession.message,
      });
      return;
    }

    if (storedSession.status === "empty") {
      set({storageState: "ready", storageError: null});
      return;
    }

    let parsedJson: unknown;

    try {
      parsedJson = JSON.parse(storedSession.raw);
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
    const storageError = persistSession(null);

    set({
      session: null,
      pendingResumeSession: null,
      storageState: "ready",
      storageError,
      moodTaskId: null,
    });
  },

  createSession: (result) => {
    const session = buildSession(result);
    const storageError = persistSession(session);

    set({
      session,
      pendingResumeSession: null,
      storageState: "ready",
      storageError,
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
    const storageError = persistSession(updatedSession);

    set({
      session: updatedSession,
      storageError,
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
    const storageError = persistSession(updatedSession);

    set({
      session: updatedSession,
      storageError,
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
    const storageError = persistSession(updatedSession);

    set({
      session: updatedSession,
      storageError,
      moodTaskId: null,
    });
  },
}));
