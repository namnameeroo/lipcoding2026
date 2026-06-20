"use client";

import {FormEvent, useState} from "react";
import {motion} from "framer-motion";

type GoalInputProps = {
  error: string | null;
  isSubmitting: boolean;
  onSubmit: (goal: string) => Promise<void>;
};

const examples = ["논문 쓰기", "방 정리하기", "포트폴리오 만들기"];

export function GoalInput({error, isSubmitting, onSubmit}: GoalInputProps) {
  const [goal, setGoal] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalized = goal.trim();

    if (!normalized) {
      setLocalError("오늘 해야 하는 일을 한 문장으로 적어 주세요.");
      return;
    }

    if (normalized.length > 300) {
      setLocalError("목표는 300자 이하로 줄여 주세요.");
      return;
    }

    setLocalError(null);
    await onSubmit(normalized);
  }

  return (
    <motion.section
      initial={{opacity: 0, y: 18}}
      animate={{opacity: 1, y: 0}}
      exit={{opacity: 0, y: -18}}
      className="w-full max-w-3xl rounded-[2rem] border border-white/60 bg-white/65 p-6 shadow-2xl shadow-violet-200/50 backdrop-blur-xl sm:p-10"
    >
      <div className="inline-flex rounded-full bg-violet-100 px-4 py-2 text-sm font-black text-violet-800">
        완성하려 하지 말고, 그냥 시작만 해
      </div>
      <h2 className="mt-6 text-4xl font-black tracking-tight sm:text-6xl">
        오늘 뭘 해야 하나요?
      </h2>
      <p className="mt-5 max-w-2xl text-base leading-7 text-slate-700 sm:text-lg">
        큰 목표를 적으면 딱 하나의 2분 행동부터 보여드릴게요. 나머지는
        흐리게 숨겨서 압도감을 줄입니다.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 grid gap-4">
        <label htmlFor="goal" className="sr-only">
          목표 입력
        </label>
        <textarea
          id="goal"
          value={goal}
          onChange={(event) => setGoal(event.target.value)}
          maxLength={320}
          rows={4}
          placeholder="예: 세금 신고서 작성하기"
          className="min-h-32 resize-none rounded-[1.5rem] border border-violet-100 bg-white/80 px-5 py-4 text-lg font-semibold text-slate-950 outline-none ring-violet-300 transition placeholder:text-slate-400 focus:border-violet-300 focus:ring-4"
        />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-semibold text-slate-500">
            {goal.trim().length}/300자
          </p>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-full bg-slate-950 px-6 py-3 text-base font-black text-white shadow-lg shadow-slate-950/20 transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            딱 시작하기
          </button>
        </div>
      </form>

      {localError || error ? (
        <p role="alert" className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">
          {localError ?? error}
        </p>
      ) : null}

      <div className="mt-6 flex flex-wrap gap-2">
        {examples.map((example) => (
          <button
            key={example}
            type="button"
            onClick={() => setGoal(example)}
            className="rounded-full border border-violet-100 bg-white/70 px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-violet-50"
          >
            {example}
          </button>
        ))}
      </div>
    </motion.section>
  );
}
