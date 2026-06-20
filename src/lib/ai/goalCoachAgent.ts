import OpenAI, {
  APIConnectionError,
  APIConnectionTimeoutError,
  APIError,
  AuthenticationError,
  AzureOpenAI,
  RateLimitError,
} from "openai";
import {z} from "zod";
import {analyzeGoalResultSchema} from "@/lib/task-session-schema";
import {logTelemetry, safeSerializeError} from "@/lib/telemetry";
import type {AnalyzeGoalResult} from "@/types/tasks";

const defaultOpenAiModel = "gpt-4o-mini";
const defaultAzureApiVersion = "2024-10-21";
const modelTimeoutMs = 20_000;
const modelMaxRetries = 1;
const maxCompletionTokens = 700;

export type AnalyzeGoalOptions = {
  requestId?: string;
};

type ModelProvider = "azure-openai" | "openai";

export type ModelConfiguration = {
  provider: ModelProvider;
  model: string;
  client: OpenAI;
};

export type GoalSafetyAssessment =
  | {
      allowed: true;
      safetyGuidance: string;
    }
  | {
      allowed: false;
      reason: string;
      userMessage: string;
    };

export type GoalCoachAgentErrorCode =
  | "configuration"
  | "unsafe_goal"
  | "model_rate_limited"
  | "model_authentication"
  | "model_unavailable"
  | "invalid_model_response";

export class GoalCoachAgentError extends Error {
  readonly code: GoalCoachAgentErrorCode;
  readonly status: number;
  readonly retryAfterSeconds?: number;

  constructor(
    code: GoalCoachAgentErrorCode,
    message: string,
    status: number,
    retryAfterSeconds?: number,
  ) {
    super(message);
    this.name = "GoalCoachAgentError";
    this.code = code;
    this.status = status;
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

const dangerousGoalPatterns = [
  /자살|자해|스스로\s*해치|죽고\s*싶/i,
  /살해|암살|폭행|고문|테러/i,
  /폭탄|폭발물|사제\s*무기|총기\s*제작/i,
  /마약\s*(제조|판매|밀수)|불법\s*약물/i,
  /계정\s*탈취|비밀번호\s*훔치|해킹해서|피싱/i,
  /suicide|self[-\s]?harm|kill myself/i,
  /build\s+(a\s+)?bomb|make\s+(a\s+)?weapon/i,
  /steal\s+password|phishing|hack\s+into/i,
];

const highStakesPatterns = [
  /의학|진단|처방|복용|수술|응급|법률|소송|세금|투자|대출|보험/,
  /medical|diagnosis|prescription|legal|lawsuit|tax|investment|loan|insurance/i,
];

export function assessGoalSafety(goal: string): GoalSafetyAssessment {
  const normalizedGoal = goal.trim();

  if (dangerousGoalPatterns.some((pattern) => pattern.test(normalizedGoal))) {
    return {
      allowed: false,
      reason: "dangerous_or_illegal_goal",
      userMessage:
        "이 목표는 안전하지 않거나 불법적인 행동으로 이어질 수 있어 도와드릴 수 없어요. 안전하고 합법적인 목표로 바꿔 주세요.",
    };
  }

  if (highStakesPatterns.some((pattern) => pattern.test(normalizedGoal))) {
    return {
      allowed: true,
      safetyGuidance:
        "의학, 법률, 금융처럼 중요한 결정을 대신하지 마세요. 전문가에게 확인하거나 공식 자료를 여는 첫 행동으로 분해하세요.",
    };
  }

  return {
    allowed: true,
    safetyGuidance:
      "사용자가 직접 통제할 수 있고 안전하며 합법적인 첫 행동으로만 분해하세요.",
  };
}

export function resolveModelConfiguration(): ModelConfiguration {
  const azureEndpoint = process.env.AZURE_OPENAI_ENDPOINT;
  const azureApiKey = process.env.AZURE_OPENAI_API_KEY;
  const azureDeployment = process.env.AZURE_OPENAI_DEPLOYMENT_NAME;
  const azureApiVersion =
    process.env.AZURE_OPENAI_API_VERSION ?? process.env.OPENAI_API_VERSION ?? defaultAzureApiVersion;
  const azureVars = [azureEndpoint, azureApiKey, azureDeployment].filter(Boolean);

  if (azureVars.length > 0 && azureVars.length < 3) {
    throw new GoalCoachAgentError(
      "configuration",
      "Azure OpenAI를 사용하려면 AZURE_OPENAI_ENDPOINT, AZURE_OPENAI_API_KEY, AZURE_OPENAI_DEPLOYMENT_NAME이 모두 필요해요.",
      500,
    );
  }

  if (azureEndpoint && azureApiKey && azureDeployment) {
    return {
      provider: "azure-openai",
      model: azureDeployment,
      client: new AzureOpenAI({
        endpoint: azureEndpoint,
        apiKey: azureApiKey,
        deployment: azureDeployment,
        apiVersion: azureApiVersion,
        timeout: modelTimeoutMs,
        maxRetries: modelMaxRetries,
      }),
    };
  }

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new GoalCoachAgentError(
      "configuration",
      "AI 모델 인증 정보가 설정되지 않았어요. Azure OpenAI 또는 OpenAI 서버 환경 변수를 설정해 주세요.",
      500,
    );
  }

  return {
    provider: "openai",
    model: process.env.OPENAI_MODEL ?? defaultOpenAiModel,
    client: new OpenAI({
      apiKey,
      timeout: modelTimeoutMs,
      maxRetries: modelMaxRetries,
    }),
  };
}

function createAgentPrompt(goal: string, safetyGuidance: string): string {
  const goalContext = JSON.stringify({goal});

  return [
    "당신은 GoalCoachAgent입니다.",
    "목표: 시작을 미루는 사용자가 지금 바로 2분 안에 시작할 수 있는 물리적 행동으로 목표를 쪼갭니다.",
    "워크플로 단계:",
    "1. goal_intake: 사용자의 목표와 감정적 부담을 파악합니다.",
    "2. safety_review: 안전하고 합법적인 범위 안에서만 도와줍니다.",
    "3. task_decomposition: 5~10개의 구체적이고 검증 가능한 2분 행동으로 나눕니다.",
    "4. structured_output: 지정된 JSON 객체만 반환합니다.",
    `안전 지침: ${safetyGuidance}`,
    "각 태스크는 추상적인 표현(조사하기, 계획하기, 준비하기)이 아니라 파일 열기, 제목 쓰기, 링크 열기처럼 손으로 할 수 있는 행동이어야 합니다.",
    "감정 태그는 burden, creative, difficult, urgent, routine, new 중 가장 지배적인 하나만 고르세요.",
    "반드시 JSON 객체만 반환하세요. 추가 설명이나 마크다운은 금지입니다.",
    `사용자 입력 JSON: ${goalContext}`,
    '출력 JSON 형식: {"goal":"원문 목표","emotionTag":"burden","tasks":[{"title":"짧은 제목","twoMinuteAction":"2분 행동 문장"}]}',
  ].join("\n");
}

function mapModelError(error: unknown): never {
  if (error instanceof GoalCoachAgentError) {
    throw error;
  }

  if (error instanceof RateLimitError) {
    throw new GoalCoachAgentError(
      "model_rate_limited",
      "AI 모델 요청이 많아 잠시 쉬어야 해요. 조금 뒤 다시 시도해 주세요.",
      503,
      60,
    );
  }

  if (error instanceof AuthenticationError) {
    throw new GoalCoachAgentError(
      "model_authentication",
      "AI 모델 인증 설정을 확인해야 해요.",
      500,
    );
  }

  if (error instanceof APIConnectionTimeoutError || error instanceof APIConnectionError) {
    throw new GoalCoachAgentError(
      "model_unavailable",
      "AI 모델 응답이 지연되고 있어요. 잠시 후 다시 시도해 주세요.",
      503,
      15,
    );
  }

  if (error instanceof APIError) {
    throw new GoalCoachAgentError(
      "model_unavailable",
      "AI 모델 응답을 받지 못했어요. 잠시 후 다시 시도해 주세요.",
      error.status && error.status >= 500 ? 503 : 500,
      error.status && error.status >= 500 ? 15 : undefined,
    );
  }

  if (error instanceof SyntaxError || error instanceof z.ZodError) {
    throw new GoalCoachAgentError(
      "invalid_model_response",
      "AI 분석 결과 형식이 올바르지 않아요. 다시 시도해 주세요.",
      502,
    );
  }

  throw error;
}

export async function runGoalCoachAgent(
  goal: string,
  options: AnalyzeGoalOptions = {},
): Promise<AnalyzeGoalResult> {
  const startedAt = Date.now();
  const safetyAssessment = assessGoalSafety(goal);

  if (!safetyAssessment.allowed) {
    logTelemetry("warn", "goal_coach_agent_blocked", {
      requestId: options.requestId,
      reason: safetyAssessment.reason,
      goalLength: goal.length,
    });
    throw new GoalCoachAgentError("unsafe_goal", safetyAssessment.userMessage, 400);
  }

  let configuration: ModelConfiguration;

  try {
    configuration = resolveModelConfiguration();
    const completion = await configuration.client.chat.completions.create({
      model: configuration.model,
      temperature: 0.35,
      max_tokens: maxCompletionTokens,
      response_format: {type: "json_object"},
      messages: [
        {
          role: "system",
          content:
            "한국어로만 답하고, 검증 가능한 JSON 객체 외에는 어떤 텍스트도 출력하지 마세요.",
        },
        {
          role: "user",
          content: createAgentPrompt(goal, safetyAssessment.safetyGuidance),
        },
      ],
    });

    const content = completion.choices[0]?.message?.content;

    if (!content) {
      throw new GoalCoachAgentError(
        "invalid_model_response",
        "AI가 빈 응답을 반환했어요. 다시 시도해 주세요.",
        502,
      );
    }

    const parsedJson: unknown = JSON.parse(content);
    const parsed = analyzeGoalResultSchema.safeParse(parsedJson);

    if (!parsed.success) {
      throw new z.ZodError(parsed.error.issues);
    }

    logTelemetry("info", "goal_coach_agent_success", {
      requestId: options.requestId,
      provider: configuration.provider,
      model: configuration.model,
      durationMs: Date.now() - startedAt,
      goalLength: goal.length,
      taskCount: parsed.data.tasks.length,
      promptTokens: completion.usage?.prompt_tokens,
      completionTokens: completion.usage?.completion_tokens,
      totalTokens: completion.usage?.total_tokens,
    });

    return parsed.data;
  } catch (error) {
    logTelemetry("error", "goal_coach_agent_failure", {
      requestId: options.requestId,
      durationMs: Date.now() - startedAt,
      goalLength: goal.length,
      errorName: error instanceof Error ? error.name : "unknown",
      errorMessage: safeSerializeError(error).message,
    });
    mapModelError(error);
  }
}
