"use client";

import type {MicroTask} from "@/types/tasks";

type TaskQueuePreviewProps = {
  tasks: MicroTask[];
  currentIndex: number;
};

export function TaskQueuePreview({tasks, currentIndex}: TaskQueuePreviewProps) {
  return (
    <aside className="rounded-[2rem] border border-white/60 bg-white/55 p-5 shadow-2xl shadow-violet-200/40 backdrop-blur-xl">
      <h2 className="text-lg font-black">남은 2분 행동</h2>
      <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
        전체 계획은 흐리게만 보여드릴게요. 지금은 위 카드 하나만 하면 됩니다.
      </p>
      <ol className="mt-5 grid gap-3">
        {tasks.map((task, index) => {
          const isCurrent = index === currentIndex;
          const isDone = task.status === "done";

          return (
            <li
              key={task.id}
              className={`rounded-2xl border px-4 py-3 transition ${
                isCurrent
                  ? "border-slate-950 bg-white text-slate-950"
                  : "border-white/60 bg-white/45 text-slate-500 blur-[1px]"
              } ${isDone ? "opacity-45 blur-0" : ""}`}
            >
              <div className="flex items-center gap-3">
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-slate-950 text-xs font-black text-white">
                  {isDone ? "✓" : index + 1}
                </span>
                <span className="text-sm font-black">{task.title}</span>
              </div>
            </li>
          );
        })}
      </ol>
    </aside>
  );
}
