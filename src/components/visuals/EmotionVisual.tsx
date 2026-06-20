"use client";

import dynamic from "next/dynamic";
import {Component, useEffect, useState} from "react";
import type {ErrorInfo, ReactNode} from "react";
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

type WebGLContext = WebGLRenderingContext | WebGL2RenderingContext;

type SceneErrorBoundaryProps = {
  children: ReactNode;
  onError: () => void;
};

type SceneErrorBoundaryState = {
  failed: boolean;
};

class SceneErrorBoundary extends Component<
  SceneErrorBoundaryProps,
  SceneErrorBoundaryState
> {
  state: SceneErrorBoundaryState = {failed: false};

  static getDerivedStateFromError(): SceneErrorBoundaryState {
    return {failed: true};
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Failed to render 3D emotion scene", error, errorInfo);
    this.props.onError();
  }

  render() {
    if (this.state.failed) {
      return null;
    }

    return this.props.children;
  }
}

function canUseWebGL(): boolean {
  const canvas = document.createElement("canvas");
  let context: WebGLContext | null = null;

  try {
    context = canvas.getContext("webgl2") ?? canvas.getContext("webgl");
    return Boolean(context);
  } catch (error) {
    console.warn("WebGL support check failed", error);
    return false;
  } finally {
    context?.getExtension("WEBGL_lose_context")?.loseContext();
    canvas.width = 0;
    canvas.height = 0;
  }
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
          <SceneErrorBoundary onError={() => setFallback(true)}>
            <EmotionScene
              emotionTag={emotionTag}
              progress={progress}
              completed={completed}
            />
          </SceneErrorBoundary>
        </div>
      ) : null}
    </div>
  );
}
