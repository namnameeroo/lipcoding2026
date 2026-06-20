"use client";

import {motion, useReducedMotion} from "framer-motion";

type AnalyzeLoadingProps = {
  goalLabel: string;
};

const blobPath =
  "M86 13 C121 18 148 47 146 83 C144 122 108 150 69 142 C31 134 10 101 18 62 C25 27 51 8 86 13 Z";

const fragmentPaths = [
  {
    d: "M23 6 C37 3 50 14 48 29 C46 43 31 52 17 46 C4 39 -1 23 7 12 C11 8 16 7 23 6 Z",
    fill: "url(#ddak-analyze-piece-a)",
    x: [0, -18, -50],
    y: [0, -16, -28],
    rotate: [0, -18, -42],
    delay: 0,
  },
  {
    d: "M18 4 C31 -1 46 8 47 23 C48 38 35 49 20 47 C6 45 -2 31 4 17 C7 10 11 6 18 4 Z",
    fill: "url(#ddak-analyze-piece-b)",
    x: [0, 22, 58],
    y: [0, -20, -38],
    rotate: [0, 16, 48],
    delay: 0.16,
  },
  {
    d: "M21 5 C35 6 45 19 41 34 C37 48 20 54 8 45 C-3 36 0 17 12 9 C15 7 18 5 21 5 Z",
    fill: "url(#ddak-analyze-piece-c)",
    x: [0, -8, -24],
    y: [0, 22, 54],
    rotate: [0, 12, 34],
    delay: 0.32,
  },
  {
    d: "M20 3 C33 1 44 12 42 25 C40 39 25 48 12 43 C1 38 -3 22 5 11 C9 6 14 4 20 3 Z",
    fill: "url(#ddak-analyze-piece-d)",
    x: [0, 20, 46],
    y: [0, 18, 48],
    rotate: [0, -14, -36],
    delay: 0.48,
  },
];

export function AnalyzeLoading({goalLabel}: AnalyzeLoadingProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.section
      initial={{opacity: 0, y: 18}}
      animate={{opacity: 1, y: 0}}
      exit={{opacity: 0, y: -18}}
      className="w-full max-w-sm rounded-[2rem] border border-white/60 bg-white/70 p-7 text-center shadow-2xl shadow-cyan-200/50 backdrop-blur-xl sm:p-8"
      aria-live="polite"
      aria-busy="true"
      role="status"
    >
      <div className="relative mx-auto h-44 w-44">
        <div className="absolute inset-8 rounded-full bg-cyan-200/50 blur-2xl" />
        <svg
          viewBox="-16 -16 192 192"
          className="relative h-full w-full overflow-visible drop-shadow-2xl"
          aria-hidden="true"
        >
          <defs>
            <linearGradient
              id="ddak-analyze-fill"
              x1="16"
              x2="142"
              y1="18"
              y2="136"
            >
              <stop stopColor="#8b5cf6" />
              <stop offset="0.58" stopColor="#22d3ee" />
              <stop offset="1" stopColor="#a7f3d0" />
            </linearGradient>
            <linearGradient
              id="ddak-analyze-piece-a"
              x1="0"
              x2="48"
              y1="0"
              y2="48"
            >
              <stop stopColor="#c084fc" />
              <stop offset="1" stopColor="#67e8f9" />
            </linearGradient>
            <linearGradient
              id="ddak-analyze-piece-b"
              x1="0"
              x2="48"
              y1="0"
              y2="48"
            >
              <stop stopColor="#60a5fa" />
              <stop offset="1" stopColor="#bef264" />
            </linearGradient>
            <linearGradient
              id="ddak-analyze-piece-c"
              x1="0"
              x2="48"
              y1="0"
              y2="48"
            >
              <stop stopColor="#f0abfc" />
              <stop offset="1" stopColor="#93c5fd" />
            </linearGradient>
            <linearGradient
              id="ddak-analyze-piece-d"
              x1="0"
              x2="48"
              y1="0"
              y2="48"
            >
              <stop stopColor="#5eead4" />
              <stop offset="1" stopColor="#c4b5fd" />
            </linearGradient>
            <clipPath id="ddak-analyze-clip">
              <path d={blobPath} />
            </clipPath>
          </defs>

          <motion.g
            clipPath="url(#ddak-analyze-clip)"
            animate={
              reduceMotion
                ? undefined
                : {scale: [0.96, 1.02, 0.98], rotate: [0, 2, -1]}
            }
            transition={{duration: 2.4, repeat: Infinity, ease: "easeInOut"}}
            style={{transformOrigin: "80px 80px"}}
          >
            <rect
              x="0"
              y="0"
              width="160"
              height="160"
              fill="url(#ddak-analyze-fill)"
            />
            <motion.g
              animate={
                reduceMotion ? undefined : {x: [0, 22, -8], y: [0, 16, 0]}
              }
              transition={{duration: 2.4, repeat: Infinity, ease: "easeInOut"}}
            >
              <circle cx="52" cy="42" r="34" fill="white" opacity="0.22" />
            </motion.g>
          </motion.g>

          {fragmentPaths.map((fragment, index) => (
            <g
              key={fragment.d}
              transform={`translate(${index % 2 === 0 ? 58 : 86} ${
                index < 2 ? 46 : 84
              })`}
            >
              <motion.g
                animate={
                  reduceMotion
                    ? {opacity: 0.45, scale: 0.72}
                    : {
                        x: fragment.x,
                        y: fragment.y,
                        rotate: fragment.rotate,
                        scale: [0.15, 0.92, 0.58],
                        opacity: [0, 0.9, 0],
                      }
                }
                transition={{
                  duration: 1.8,
                  delay: fragment.delay,
                  repeat: Infinity,
                  repeatDelay: 0.18,
                  ease: "easeInOut",
                }}
              >
                <path d={fragment.d} fill={fragment.fill} opacity="0.9" />
              </motion.g>
            </g>
          ))}
        </svg>
      </div>
      <h2 className="mt-3 text-2xl font-black tracking-tight">쪼개는 중</h2>
      <p className="mt-2 text-xs font-black uppercase tracking-[0.28em] text-violet-500">
        2분 조각
      </p>
      <p className="sr-only">{goalLabel}</p>
    </motion.section>
  );
}
