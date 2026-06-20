"use client";

import {motion} from "framer-motion";
import {moodOptions} from "@/lib/emotions";
import type {MoodEmoji} from "@/types/tasks";

type MoodCheckProps = {
  taskTitle: string;
  onSelect: (mood: MoodEmoji) => void;
  onSkip: () => void;
};

export function MoodCheck({taskTitle, onSelect, onSkip}: MoodCheckProps) {
  return (
    <motion.section
      initial={{opacity: 0, scale: 0.96}}
      animate={{opacity: 1, scale: 1}}
      exit={{opacity: 0, scale: 0.96}}
      className="w-full max-w-2xl rounded-[2rem] border border-white/60 bg-white/70 p-6 text-center shadow-2xl shadow-emerald-200/50 backdrop-blur-xl sm:p-10"
    >
      <p className="text-sm font-black uppercase tracking-[0.25em] text-emerald-700">
        완료 기록
      </p>
      <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">
        방금 어땠나요?
      </h2>
      <p className="mt-4 text-base font-semibold leading-7 text-slate-700">
        <span>&quot;{taskTitle}&quot;</span>을 끝냈어요. 이 선택은 기록만 하고 다음 문구를 바꾸지는
        않아요.
      </p>
      <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {moodOptions.map((option) => (
          <button
            key={option.mood}
            type="button"
            onClick={() => onSelect(option.mood)}
            className="rounded-3xl border border-white/70 bg-white/75 px-3 py-4 text-center shadow-sm transition hover:-translate-y-1 hover:bg-emerald-50 focus:outline-none focus:ring-4 focus:ring-emerald-200"
          >
            <span className="block text-3xl">{option.emoji}</span>
            <span className="mt-2 block text-xs font-black text-slate-700">
              {option.label}
            </span>
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={onSkip}
        className="mt-6 rounded-full px-5 py-3 text-sm font-black text-slate-600 transition hover:bg-white/70"
      >
        건너뛰고 다음으로
      </button>
    </motion.section>
  );
}
