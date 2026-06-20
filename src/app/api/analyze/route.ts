import {NextRequest, NextResponse} from "next/server";
import {z} from "zod";
import {GoalCoachAgentError} from "@/lib/ai/goalCoachAgent";
import {analyzeGoal} from "@/lib/ai/analyzeGoal";
import {checkRateLimit} from "@/lib/rate-limit";
import {logTelemetry, safeSerializeError} from "@/lib/telemetry";

export const runtime = "nodejs";

const requestSchema = z
  .object({
    goal: z.string().trim().min(1).max(300),
  })
  .strict();

const maxRequestBodyBytes = 4_096;
const trustClientIpHeaders = process.env.TRUST_CLIENT_IP_HEADERS === "true";
const clientIdentifierCookieName = "ddak.client-id";
const clientRateLimitPerMinute = 5;
const globalRateLimitPerMinute = 300;
const requestIdHeader = "X-Request-ID";

type ClientIdentifier = {
  rateLimitKey: string;
  cookieValueToSet?: string;
};

class RequestBodyTooLargeError extends Error {
  constructor() {
    super("Request body is too large.");
  }
}

function firstHeaderValue(value: string | null): string | null {
  return value?.split(",")[0]?.trim() || null;
}

function createClientCookieValue(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function createRequestId(request: NextRequest): string {
  const incomingRequestId = request.headers.get("x-request-id")?.trim();

  if (incomingRequestId && /^[a-zA-Z0-9._:-]{8,100}$/.test(incomingRequestId)) {
    return incomingRequestId;
  }

  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function isValidClientCookieValue(value: string): boolean {
  return /^[a-f0-9-]{36}$/i.test(value);
}

function getTrustedClientIp(request: NextRequest): string | null {
  if (!trustClientIpHeaders) {
    return null;
  }

  return (
    firstHeaderValue(request.headers.get("x-real-ip")) ??
    firstHeaderValue(request.headers.get("x-forwarded-for"))
  );
}

function getClientIdentifier(request: NextRequest): ClientIdentifier {
  const trustedClientIp = getTrustedClientIp(request);

  if (trustedClientIp) {
    return {rateLimitKey: `trusted-ip:${trustedClientIp}`};
  }

  const cookieValue = request.cookies.get(clientIdentifierCookieName)?.value;

  if (cookieValue && isValidClientCookieValue(cookieValue)) {
    return {rateLimitKey: `cookie:${cookieValue}`};
  }

  const generatedCookieValue = createClientCookieValue();

  return {
    rateLimitKey: `cookie:${generatedCookieValue}`,
    cookieValueToSet: generatedCookieValue,
  };
}

function errorResponse(message: string, status: number) {
  return NextResponse.json({error: message}, {status});
}

function setRateLimitHeaders(response: NextResponse, remaining: number, resetAt: number) {
  response.headers.set("X-RateLimit-Remaining", String(remaining));
  response.headers.set("X-RateLimit-Reset", String(resetAt));
}

function setRetryAfterHeader(response: NextResponse, retryAfterSeconds: number) {
  response.headers.set("Retry-After", String(Math.max(1, Math.ceil(retryAfterSeconds))));
}

function setClientIdentifierCookie(response: NextResponse, clientIdentifier: ClientIdentifier) {
  if (!clientIdentifier.cookieValueToSet) {
    return;
  }

  response.cookies.set(clientIdentifierCookieName, clientIdentifier.cookieValueToSet, {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

function finalizeResponse(
  response: NextResponse,
  clientIdentifier: ClientIdentifier,
  remaining: number,
  resetAt: number,
  requestId: string,
) {
  setRateLimitHeaders(response, remaining, resetAt);
  setClientIdentifierCookie(response, clientIdentifier);
  response.headers.set(requestIdHeader, requestId);

  return response;
}

function isJsonRequest(request: NextRequest): boolean {
  const contentType = request.headers.get("content-type");

  return contentType?.toLowerCase().split(";")[0]?.trim() === "application/json";
}

async function parseJsonBody(request: NextRequest): Promise<unknown> {
  const reader = request.body?.getReader();

  if (!reader) {
    throw new SyntaxError("Missing request body.");
  }

  const chunks: Uint8Array[] = [];
  let receivedBytes = 0;

  while (true) {
    const {done, value} = await reader.read();

    if (done) {
      break;
    }

    receivedBytes += value.byteLength;

    if (receivedBytes > maxRequestBodyBytes) {
      await reader.cancel();
      throw new RequestBodyTooLargeError();
    }

    chunks.push(value);
  }

  const bodyBytes = new Uint8Array(receivedBytes);
  let offset = 0;

  chunks.forEach((chunk) => {
    bodyBytes.set(chunk, offset);
    offset += chunk.byteLength;
  });

  return JSON.parse(new TextDecoder().decode(bodyBytes));
}

export async function POST(request: NextRequest) {
  const requestId = createRequestId(request);
  const startedAt = Date.now();
  const clientIdentifier = getClientIdentifier(request);
  const globalRateLimit = checkRateLimit("api:analyze:global", globalRateLimitPerMinute);

  if (!globalRateLimit.allowed) {
    const response = errorResponse("요청이 너무 많아요. 잠시 후 다시 시도해 주세요.", 429);
    setRetryAfterHeader(response, (globalRateLimit.resetAt - Date.now()) / 1000);
    logTelemetry("warn", "analyze_rate_limited", {
      requestId,
      bucket: "global",
      durationMs: Date.now() - startedAt,
    });
    return finalizeResponse(response, clientIdentifier, 0, globalRateLimit.resetAt, requestId);
  }

  const clientRateLimit = checkRateLimit(
    `api:analyze:client:${clientIdentifier.rateLimitKey}`,
    clientRateLimitPerMinute,
  );

  if (!clientRateLimit.allowed) {
    const response = errorResponse("요청이 너무 많아요. 잠시 후 다시 시도해 주세요.", 429);
    setRetryAfterHeader(response, (clientRateLimit.resetAt - Date.now()) / 1000);
    logTelemetry("warn", "analyze_rate_limited", {
      requestId,
      bucket: "client",
      durationMs: Date.now() - startedAt,
    });
    return finalizeResponse(response, clientIdentifier, 0, clientRateLimit.resetAt, requestId);
  }

  const remaining = Math.min(globalRateLimit.remaining, clientRateLimit.remaining);
  const resetAt = Math.max(globalRateLimit.resetAt, clientRateLimit.resetAt);

  if (!isJsonRequest(request)) {
    return finalizeResponse(
      errorResponse("JSON 요청만 지원해요.", 415),
      clientIdentifier,
      remaining,
      resetAt,
      requestId,
    );
  }

  const contentLength = Number(request.headers.get("content-length") ?? 0);

  if (contentLength > maxRequestBodyBytes) {
    return finalizeResponse(
      errorResponse("요청이 너무 커요.", 413),
      clientIdentifier,
      remaining,
      resetAt,
      requestId,
    );
  }

  let body: unknown;

  try {
    body = await parseJsonBody(request);
  } catch (error) {
    if (error instanceof RequestBodyTooLargeError) {
      return finalizeResponse(
        errorResponse("요청이 너무 커요.", 413),
        clientIdentifier,
        remaining,
        resetAt,
        requestId,
      );
    }

    logTelemetry("warn", "analyze_invalid_json", {
      requestId,
      durationMs: Date.now() - startedAt,
      errorName: error instanceof Error ? error.name : "unknown",
    });
    return finalizeResponse(
      errorResponse("요청 형식이 올바르지 않아요.", 400),
      clientIdentifier,
      remaining,
      resetAt,
      requestId,
    );
  }

  const parsed = requestSchema.safeParse(body);

  if (!parsed.success) {
    return finalizeResponse(
      errorResponse("목표는 1자 이상 300자 이하로 입력해 주세요.", 400),
      clientIdentifier,
      remaining,
      resetAt,
      requestId,
    );
  }

  try {
    const result = await analyzeGoal(parsed.data.goal, {requestId});
    const response = NextResponse.json(result);
    logTelemetry("info", "analyze_request_success", {
      requestId,
      durationMs: Date.now() - startedAt,
      goalLength: parsed.data.goal.length,
      taskCount: result.tasks.length,
    });
    return finalizeResponse(response, clientIdentifier, remaining, resetAt, requestId);
  } catch (error) {
    if (error instanceof GoalCoachAgentError) {
      const response = errorResponse(error.message, error.status);

      if (error.retryAfterSeconds) {
        setRetryAfterHeader(response, error.retryAfterSeconds);
      }

      logTelemetry(error.status >= 500 ? "error" : "warn", "analyze_agent_error", {
        requestId,
        durationMs: Date.now() - startedAt,
        goalLength: parsed.data.goal.length,
        errorCode: error.code,
        status: error.status,
      });

      return finalizeResponse(response, clientIdentifier, remaining, resetAt, requestId);
    }

    logTelemetry("error", "analyze_unhandled_error", {
      requestId,
      durationMs: Date.now() - startedAt,
      errorName: error instanceof Error ? error.name : "unknown",
      errorMessage: safeSerializeError(error).message,
    });
    return finalizeResponse(
      errorResponse("목표를 분석하지 못했어요. 잠시 후 다시 시도해 주세요.", 500),
      clientIdentifier,
      remaining,
      resetAt,
      requestId,
    );
  }
}
