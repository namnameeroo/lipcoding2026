"use client";

import type {MicroTask} from "@/types/tasks";

type TaskQueuePreviewProps = {
  tasks: MicroTask[];
  currentIndex: number;
};

export function TaskQueuePreview({tasks, currentIndex}: TaskQueuePreviewProps) {
  const upcomingTasks = tasks.slice(currentIndex + 1);
  const upcomingCount = upcomingTasks.length;

  return (
    <aside className="p-1">
      <details className="group">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-2xl border border-white/55 px-4 py-3 text-left transition hover:border-violet-200 [&::-webkit-details-marker]:hidden">
          <div>
            <h2 className="text-base font-black">남은 2분 행동</h2>
            <p className="mt-1 text-xs font-bold text-slate-500">
              {upcomingCount > 0 ? (
                <>
                  <span className="group-open:hidden">
                    {upcomingCount}개 다음 행동 보기
                  </span>
                  <span className="hidden group-open:inline">접어두기</span>
                </>
              ) : (
                "마지막 행동"
              )}
            </p>
          </div>
          <span
            className="grid size-8 shrink-0 place-items-center rounded-full border border-slate-300 text-sm font-black text-slate-700 transition group-open:rotate-180"
            aria-hidden="true"
          >
            ↓
          </span>
        </summary>

        {upcomingCount > 0 ? (
          <ol className="mt-3 grid gap-2">
            {upcomingTasks.map((task, index) => (
              <li
                key={task.id}
                className="rounded-2xl border border-white/50 px-4 py-3 text-slate-600"
              >
                <div className="flex items-center gap-3">
                  <span className="grid size-7 shrink-0 place-items-center rounded-full border border-slate-300 text-xs font-black text-slate-600">
                    {currentIndex + index + 2}
                  </span>
                  <span className="text-sm font-black">{task.title}</span>
                </div>
              </li>
            ))}
          </ol>
        ) : null}
      </details>
    </aside>
  );
}
