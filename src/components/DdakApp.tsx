"use client";

import {useEffect, useMemo, useState} from "react";
import {AnimatePresence, motion} from "framer-motion";
import {AnalyzeLoading} from "@/components/AnalyzeLoading";
import {CurrentTaskCard} from "@/components/CurrentTaskCard";
import {GoalInput} from "@/components/GoalInput";
import {MoodCheck} from "@/components/MoodCheck";
import {ResumePrompt} from "@/components/ResumePrompt";
import {TaskQueuePreview} from "@/components/TaskQueuePreview";
import {EmotionVisual} from "@/components/visuals/EmotionVisual";
import {ParticleBurst} from "@/components/visuals/ParticleBurst";
import {getEmotionProfile} from "@/lib/emotions";
import {analyzeGoalResultSchema} from "@/lib/task-session-schema";
import {useTaskSessionStore} from "@/store/taskSessionStore";

type ApiErrorBody = {
  error?: string;
};

function getErrorMessage(body: unknown): string {
  if (body && typeof body === "object" && "error" in body) {
    const error = (body as ApiErrorBody).error;

    if (typeof error === "string" && error.trim()) {
      return error;
    }
  }

  return "목표를 분석하지 못했어요. 다시 시도해 주세요.";
}

export function DdakApp() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const {
    session,
    pendingResumeSession,
    storageState,
    storageError,
    moodTaskId,
    burstKey,
    hydrateFromStorage,
    continueStoredSession,
    discardSession,
    createSession,
    startCurrentTask,
    completeCurrentTask,
    finishMoodCheck,
  } = useTaskSessionStore();

  useEffect(() => {
    hydrateFromStorage();
  }, [hydrateFromStorage]);

  const progress = useMemo(() => {
    if (!session) {
      return 0;
    }

    return session.tasks.filter((task) => task.status === "done").length / session.tasks.length;
  }, [session]);

  const visualTag = session?.emotionTag ?? pendingResumeSession?.emotionTag ?? "new";
  const profile = getEmotionProfile(visualTag);
  const currentTask = session?.tasks[session.currentIndex] ?? null;
  const moodTask =
    session?.tasks.find((task) => task.id === moodTaskId) ?? currentTask;
  const nonBlockingStorageError = storageState === "invalid" ? null : storageError;

  async function handleGoalSubmit(goal: string) {
    const normalizedGoal = goal.trim();

    if (normalizedGoal.length < 1 || normalizedGoal.length > 300) {
      setError("목표는 1자 이상 300자 이하로 입력해 주세요.");
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({goal: normalizedGoal}),
      });
      const body: unknown = await response.json();

      if (!response.ok) {
        setError(getErrorMessage(body));
        return;
      }

      const parsed = analyzeGoalResultSchema.safeParse(body);

      if (!parsed.success) {
        setError("분석 결과 형식이 올바르지 않아요. 다시 시도해 주세요.");
        return;
      }

      createSession(parsed.data);
    } catch (requestError) {
      console.error("Failed to request goal analysis", requestError);
      setError("네트워크 요청에 실패했어요. 연결을 확인하고 다시 시도해 주세요.");
    } finally {
      setIsAnalyzing(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f8f1ff] text-slate-950">
      <EmotionVisual
        emotionTag={visualTag}
        progress={progress}
        completed={Boolean(session?.completedAt)}
      />
      <ParticleBurst burstKey={burstKey} colors={profile.colors} />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 py-6 sm:px-8 lg:px-10">
        <header className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.35em] text-violet-700/80">
              Ddak
            </p>
            <h1 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">
              딱 2분, 딱 이것만
            </h1>
          </div>
          {session ? (
            <button
              type="button"
              onClick={discardSession}
              className="rounded-full border border-white/50 bg-white/50 px-4 py-2 text-sm font-bold text-slate-700 shadow-sm backdrop-blur transition hover:bg-white/80"
            >
              새로 시작
            </button>
          ) : null}
        </header>

        {nonBlockingStorageError ? (
          <motion.div
            initial={{opacity: 0, y: -8}}
            animate={{opacity: 1, y: 0}}
            role="status"
            className="mt-5 rounded-3xl border border-amber-200/80 bg-amber-50/80 px-5 py-3 text-sm font-semibold leading-6 text-amber-900 shadow-lg shadow-amber-100/50 backdrop-blur"
          >
            {nonBlockingStorageError}
          </motion.div>
        ) : null}

        <div className="grid flex-1 place-items-center py-8">
          <AnimatePresence mode="wait">
            {storageState === "unknown" ? (
              <motion.section
                key="boot"
                initial={{opacity: 0, y: 12}}
                animate={{opacity: 1, y: 0}}
                exit={{opacity: 0, y: -12}}
                className="rounded-[2rem] border border-white/60 bg-white/55 p-8 text-center shadow-2xl shadow-violet-200/40 backdrop-blur-xl"
              >
                <p className="text-lg font-bold">진행 상태를 확인하고 있어요.</p>
              </motion.section>
            ) : storageState === "invalid" ? (
              <ResumePrompt
                key="invalid-storage"
                title="저장된 진행 상태를 불러올 수 없어요"
                description={storageError ?? "저장된 데이터 형식이 올바르지 않아요."}
                primaryLabel="초기화하고 새로 시작"
                secondaryLabel="그대로 두기"
                onPrimary={discardSession}
                onSecondary={() => setError("초기화하지 않으면 새 목표를 시작할 수 없어요.")}
              />
            ) : pendingResumeSession ? (
              <ResumePrompt
                key="resume"
                title="하던 일을 이어갈까요?"
                description={`"${pendingResumeSession.goal}" 목표에서 ${
                  pendingResumeSession.currentIndex + 1
                }번째 2분 행동을 준비해 두었어요.`}
                primaryLabel="계속할래요"
                secondaryLabel="새로 시작"
                onPrimary={continueStoredSession}
                onSecondary={discardSession}
              />
            ) : isAnalyzing ? (
              <AnalyzeLoading key="loading" goalLabel="목표를 2분 행동으로 쪼개는 중" />
            ) : session?.completedAt ? (
              <motion.section
                key="completed"
                initial={{opacity: 0, scale: 0.96}}
                animate={{opacity: 1, scale: 1}}
                exit={{opacity: 0, scale: 0.96}}
                className="w-full max-w-3xl rounded-[2rem] border border-white/60 bg-white/65 p-8 text-center shadow-2xl shadow-emerald-200/50 backdrop-blur-xl sm:p-12"
              >
                <p className="text-5xl">🎉</p>
                <h2 className="mt-5 text-3xl font-black tracking-tight sm:text-5xl">
                  시작을 끝까지 이어냈어요
                </h2>
                <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-slate-700">
                  {session.tasks.length}개의 2분 행동을 모두 완료했어요. 완성보다
                  어려운 첫 시작을 이미 해냈습니다.
                </p>
                <button
                  type="button"
                  onClick={discardSession}
                  className="mt-8 rounded-full bg-slate-950 px-6 py-3 text-sm font-black text-white shadow-lg shadow-slate-950/20 transition hover:-translate-y-0.5 hover:bg-slate-800"
                >
                  다른 목표 시작하기
                </button>
              </motion.section>
            ) : moodTaskId && moodTask ? (
              <MoodCheck
                key="mood"
                taskTitle={moodTask.title}
                onSelect={finishMoodCheck}
                onSkip={() => finishMoodCheck()}
              />
            ) : session && currentTask ? (
              <motion.section
                key="task"
                initial={{opacity: 0, y: 18}}
                animate={{opacity: 1, y: 0}}
                exit={{opacity: 0, y: -18}}
                className="grid w-full items-start gap-5 lg:grid-cols-[minmax(0,1fr)_320px]"
              >
                <CurrentTaskCard
                  goal={session.goal}
                  task={currentTask}
                  currentNumber={session.currentIndex + 1}
                  totalTasks={session.tasks.length}
                  emotionProfile={profile}
                  progress={progress}
                  onStart={startCurrentTask}
                  onComplete={completeCurrentTask}
                />
                <TaskQueuePreview
                  tasks={session.tasks}
                  currentIndex={session.currentIndex}
                />
              </motion.section>
            ) : (
              <GoalInput
                key="input"
                error={error}
                isSubmitting={isAnalyzing}
                onSubmit={handleGoalSubmit}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}
