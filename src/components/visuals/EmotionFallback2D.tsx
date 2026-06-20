"use client";

import type {CSSProperties} from "react";
import {getEmotionProfile} from "@/lib/emotions";
import type {EmotionTag} from "@/types/tasks";

type EmotionFallback2DProps = {
  emotionTag: EmotionTag;
  progress: number;
  completed: boolean;
};

export function EmotionFallback2D({
  emotionTag,
  progress,
  completed,
}: EmotionFallback2DProps) {
  const profile = getEmotionProfile(emotionTag);
  const scale = completed ? 1.45 : 1 + progress * 0.22;
  const opacity = completed ? 0.18 : 0.34 + progress * 0.16;
  const style: CSSProperties = {
    background: `radial-gradient(circle at 30% 30%, ${profile.colors[2]}, transparent 36%), linear-gradient(135deg, ${profile.colors[0]}, ${profile.colors[1]})`,
    transform: `scale(${scale})`,
    opacity,
    animationDuration: `${Math.max(5, 10 / profile.speed)}s`,
  };

  return (
    <>
      <div className="absolute -left-28 top-12 h-72 w-72 rounded-full bg-violet-300/30 blur-3xl sm:h-[30rem] sm:w-[30rem]" />
      <div className="absolute -right-28 bottom-6 h-80 w-80 rounded-full bg-cyan-200/35 blur-3xl sm:h-[34rem] sm:w-[34rem]" />
      <div
        className={`ddak-emotion-fallback absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 sm:h-[34rem] sm:w-[34rem] ${profile.fallbackClassName} ${
          completed ? "ddak-shape-completed" : ""
        }`}
        style={style}
      />
    </>
  );
}
