import {afterEach, beforeEach, describe, expect, it} from "vitest";
import {
  GoalCoachAgentError,
  assessGoalSafety,
  resolveModelConfiguration,
} from "@/lib/ai/goalCoachAgent";

const modelEnvKeys = [
  "AZURE_OPENAI_ENDPOINT",
  "AZURE_OPENAI_API_KEY",
  "AZURE_OPENAI_DEPLOYMENT_NAME",
  "AZURE_OPENAI_API_VERSION",
  "OPENAI_API_VERSION",
  "OPENAI_API_KEY",
  "OPENAI_MODEL",
] as const;

let savedEnv: Record<string, string | undefined>;

describe("GoalCoachAgent safety", () => {
  it("allows ordinary productivity goals", () => {
    const assessment = assessGoalSafety("논문 초안 쓰기");

    expect(assessment.allowed).toBe(true);
  });

  it("blocks dangerous or illegal goals", () => {
    const assessment = assessGoalSafety("피싱으로 비밀번호 훔치기");

    expect(assessment.allowed).toBe(false);
    if (!assessment.allowed) {
      expect(assessment.reason).toBe("dangerous_or_illegal_goal");
    }
  });

  it("adds guidance for high-stakes goals", () => {
    const assessment = assessGoalSafety("세금 신고 준비하기");

    expect(assessment.allowed).toBe(true);
    if (assessment.allowed) {
      expect(assessment.safetyGuidance).toContain("전문가");
    }
  });
});

describe("resolveModelConfiguration", () => {
  beforeEach(() => {
    savedEnv = Object.fromEntries(modelEnvKeys.map((key) => [key, process.env[key]]));
    modelEnvKeys.forEach((key) => {
      delete process.env[key];
    });
  });

  afterEach(() => {
    modelEnvKeys.forEach((key) => {
      const value = savedEnv[key];

      if (value === undefined) {
        delete process.env[key];
        return;
      }

      process.env[key] = value;
    });
  });

  it("prefers Azure OpenAI when all Azure settings exist", () => {
    process.env.AZURE_OPENAI_ENDPOINT = "https://example.openai.azure.com";
    process.env.AZURE_OPENAI_API_KEY = "azure-key";
    process.env.AZURE_OPENAI_DEPLOYMENT_NAME = "gpt-4o-mini";

    const configuration = resolveModelConfiguration();

    expect(configuration.provider).toBe("azure-openai");
    expect(configuration.model).toBe("gpt-4o-mini");
  });

  it("falls back to OpenAI when Azure settings are absent", () => {
    process.env.OPENAI_API_KEY = "openai-key";

    const configuration = resolveModelConfiguration();

    expect(configuration.provider).toBe("openai");
    expect(configuration.model).toBe("gpt-4o-mini");
  });

  it("fails fast when Azure settings are partial", () => {
    process.env.AZURE_OPENAI_ENDPOINT = "https://example.openai.azure.com";
    process.env.OPENAI_API_KEY = "openai-key";

    expect(() => resolveModelConfiguration()).toThrow(GoalCoachAgentError);
  });
});
