"use client";

import dynamic from "next/dynamic";
import {useEffect, useState} from "react";
import {EmotionFallback2D} from "@/components/visuals/EmotionFallback2D";
import type {EmotionTag} from "@/types/tasks";

const EmotionScene = dynamic(
  () => import("@/components/visuals/EmotionScene").then((mod) => mod.EmotionScene),
  {
    ssr: false,
    loading: () => null,
  },
);

type EmotionVisualProps = {
  emotionTag: EmotionTag;
  progress: number;
  completed: boolean;
};

type NavigatorWithMemory = Navigator & {
  deviceMemory?: number;
};

function canUseWebGL(): boolean {
  const canvas = document.createElement("canvas");
  return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
}

function shouldUseFallback(): boolean {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const smallViewport = window.innerWidth < 768;
  const deviceMemory = (navigator as NavigatorWithMemory).deviceMemory;
  const lowMemory = typeof deviceMemory === "number" && deviceMemory < 4;

  return reducedMotion || smallViewport || lowMemory || !canUseWebGL();
}

export function EmotionVisual({emotionTag, progress, completed}: EmotionVisualProps) {
  const [fallback, setFallback] = useState(true);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setFallback(shouldUseFallback());
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <EmotionFallback2D
        emotionTag={emotionTag}
        progress={progress}
        completed={completed}
      />
      {!fallback ? (
        <div className="absolute inset-0 opacity-80">
          <EmotionScene
            emotionTag={emotionTag}
            progress={progress}
            completed={completed}
          />
        </div>
      ) : null}
    </div>
  );
}
