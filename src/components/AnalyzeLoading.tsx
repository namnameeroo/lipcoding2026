"use client";

import {motion} from "framer-motion";

type AnalyzeLoadingProps = {
  goalLabel: string;
};

export function AnalyzeLoading({goalLabel}: AnalyzeLoadingProps) {
  return (
    <motion.section
      initial={{opacity: 0, y: 18}}
      animate={{opacity: 1, y: 0}}
      exit={{opacity: 0, y: -18}}
      className="w-full max-w-xl rounded-[2rem] border border-white/60 bg-white/65 p-8 text-center shadow-2xl shadow-cyan-200/50 backdrop-blur-xl"
      aria-live="polite"
    >
      <div className="mx-auto flex h-28 w-28 items-center justify-center">
        {[0, 1, 2, 3].map((index) => (
          <motion.span
            key={index}
            className="mx-1 block h-5 w-5 rounded-full bg-gradient-to-br from-violet-400 to-cyan-300"
            animate={{y: [0, -22, 0], scale: [1, 0.75, 1]}}
            transition={{
              duration: 0.9,
              delay: index * 0.12,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
      <h2 className="mt-5 text-2xl font-black">{goalLabel}</h2>
      <p className="mt-3 text-sm font-semibold leading-6 text-slate-600">
        감정 태그 하나와 5~10개의 아주 작은 행동을 고르고 있어요.
      </p>
    </motion.section>
  );
}
