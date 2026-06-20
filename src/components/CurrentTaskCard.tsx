"use client";

import {motion} from "framer-motion";
import type {EmotionProfile} from "@/lib/emotions";
import type {MicroTask} from "@/types/tasks";

type CurrentTaskCardProps = {
  goal: string;
  task: MicroTask;
  currentNumber: number;
  totalTasks: number;
  emotionProfile: EmotionProfile;
  progress: number;
  onStart: () => void;
  onComplete: () => void;
};

export function CurrentTaskCard({
  goal,
  task,
  currentNumber,
  totalTasks,
  emotionProfile,
  progress,
  onStart,
  onComplete,
}: CurrentTaskCardProps) {
  const started = task.status === "started";
  const progressPercent = Math.round(progress * 100);

  return (
    <article className="rounded-[2rem] border border-white/60 bg-white/70 p-6 shadow-2xl shadow-violet-200/50 backdrop-blur-xl sm:p-10">
      <div className="flex flex-wrap items-center gap-3">
        <span className="rounded-full bg-slate-950 px-4 py-2 text-sm font-black text-white">
          {currentNumber}/{totalTasks}
        </span>
        <span className="rounded-full bg-white/80 px-4 py-2 text-sm font-black text-slate-700">
          {emotionProfile.emoji} {emotionProfile.label}
        </span>
        <span className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-black text-emerald-800">
          2분이면 돼요
        </span>
      </div>

      <p className="mt-8 text-sm font-bold uppercase tracking-[0.25em] text-slate-500">
        지금 할 일
      </p>
      <h2 className="mt-3 text-4xl font-black tracking-tight sm:text-6xl">
        {task.title}
      </h2>
      <p className="mt-6 rounded-[1.5rem] bg-white/80 p-5 text-xl font-black leading-9 text-slate-800 shadow-inner shadow-violet-100/50">
        {task.twoMinuteAction}
      </p>

      <div className="mt-7 grid gap-3">
        <div className="flex items-center justify-between text-sm font-black text-slate-600">
          <span>목표: {goal}</span>
          <span>{progressPercent}%</span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-white/70">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-violet-500 via-cyan-400 to-emerald-400"
            initial={false}
            animate={{width: `${progressPercent}%`}}
          />
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onStart}
          disabled={started}
          className="rounded-full bg-violet-600 px-6 py-4 text-base font-black text-white shadow-lg shadow-violet-500/25 transition hover:-translate-y-0.5 hover:bg-violet-700 disabled:cursor-default disabled:bg-violet-200 disabled:text-violet-700"
        >
          {started ? "시작했어요" : "시작!"}
        </button>
        <button
          type="button"
          onClick={onComplete}
          className="rounded-full bg-slate-950 px-6 py-4 text-base font-black text-white shadow-lg shadow-slate-950/20 transition hover:-translate-y-0.5 hover:bg-slate-800"
        >
          완료했어요
        </button>
      </div>
      <p className="mt-5 text-sm font-semibold leading-6 text-slate-600">
        {emotionProfile.description}
      </p>
    </article>
  );
}
