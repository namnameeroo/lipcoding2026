import OpenAI from "openai";
import {analyzeGoalResultSchema} from "@/lib/task-session-schema";
import type {AnalyzeGoalResult} from "@/types/tasks";

const model = "gpt-4o-mini";

function createPrompt(goal: string): string {
  return [
    "당신은 시작을 미루는 사람을 돕는 한국어 태스크 코치입니다.",
    "사용자의 큰 목표를 지금 바로 실행할 수 있는 5~10개의 마이크로 태스크로 분해하세요.",
    "각 태스크는 절대 2분 안에 시작 또는 완료 가능한 단 하나의 물리적 행동이어야 합니다.",
    "추상적인 표현(조사하기, 계획하기, 준비하기) 대신 파일 열기, 제목 쓰기, 링크 열기처럼 손으로 할 수 있는 행동으로 쓰세요.",
    "감정 태그는 burden, creative, difficult, urgent, routine, new 중 가장 지배적인 하나만 고르세요.",
    "반드시 JSON 객체만 반환하세요. 추가 설명이나 마크다운은 금지입니다.",
    `사용자 목표: ${goal}`,
    'JSON 형식: {"goal":"원문 목표","emotionTag":"burden","tasks":[{"title":"짧은 제목","twoMinuteAction":"2분 행동 문장"}]}',
  ].join("\n");
}

export async function analyzeGoal(goal: string): Promise<AnalyzeGoalResult> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured.");
  }

  const client = new OpenAI({apiKey});
  const completion = await client.chat.completions.create({
    model,
    temperature: 0.35,
    response_format: {type: "json_object"},
    messages: [
      {
        role: "system",
        content:
          "한국어로만 답하고, 검증 가능한 JSON 객체 외에는 어떤 텍스트도 출력하지 마세요.",
      },
      {role: "user", content: createPrompt(goal)},
    ],
  });

  const content = completion.choices[0]?.message?.content;

  if (!content) {
    throw new Error("OpenAI returned an empty response.");
  }

  const parsedJson: unknown = JSON.parse(content);
  const result = analyzeGoalResultSchema.parse(parsedJson);

  return result;
}
