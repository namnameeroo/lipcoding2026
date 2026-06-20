"use client";

import {motion} from "framer-motion";

type ResumePromptProps = {
  title: string;
  description: string;
  primaryLabel: string;
  secondaryLabel: string;
  onPrimary: () => void;
  onSecondary: () => void;
};

export function ResumePrompt({
  title,
  description,
  primaryLabel,
  secondaryLabel,
  onPrimary,
  onSecondary,
}: ResumePromptProps) {
  return (
    <motion.section
      initial={{opacity: 0, y: 18}}
      animate={{opacity: 1, y: 0}}
      exit={{opacity: 0, y: -18}}
      className="w-full max-w-2xl rounded-[2rem] border border-white/60 bg-white/70 p-6 text-center shadow-2xl shadow-violet-200/50 backdrop-blur-xl sm:p-10"
    >
      <p className="text-4xl">✨</p>
      <h2 className="mt-5 text-3xl font-black tracking-tight sm:text-5xl">
        {title}
      </h2>
      <p className="mx-auto mt-4 max-w-xl text-base font-semibold leading-7 text-slate-700">
        {description}
      </p>
      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onPrimary}
          className="rounded-full bg-slate-950 px-6 py-3 text-sm font-black text-white shadow-lg shadow-slate-950/20 transition hover:-translate-y-0.5 hover:bg-slate-800"
        >
          {primaryLabel}
        </button>
        <button
          type="button"
          onClick={onSecondary}
          className="rounded-full border border-white/70 bg-white/70 px-6 py-3 text-sm font-black text-slate-700 transition hover:bg-white"
        >
          {secondaryLabel}
        </button>
      </div>
    </motion.section>
  );
}
