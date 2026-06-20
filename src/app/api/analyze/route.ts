import {NextRequest, NextResponse} from "next/server";
import {z} from "zod";
import {analyzeGoal} from "@/lib/ai/analyzeGoal";
import {checkRateLimit} from "@/lib/rate-limit";

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
) {
  setRateLimitHeaders(response, remaining, resetAt);
  setClientIdentifierCookie(response, clientIdentifier);

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
  const clientIdentifier = getClientIdentifier(request);
  const globalRateLimit = checkRateLimit("api:analyze:global", globalRateLimitPerMinute);

  if (!globalRateLimit.allowed) {
    const response = errorResponse("요청이 너무 많아요. 잠시 후 다시 시도해 주세요.", 429);
    return finalizeResponse(response, clientIdentifier, 0, globalRateLimit.resetAt);
  }

  const clientRateLimit = checkRateLimit(
    `api:analyze:client:${clientIdentifier.rateLimitKey}`,
    clientRateLimitPerMinute,
  );

  if (!clientRateLimit.allowed) {
    const response = errorResponse("요청이 너무 많아요. 잠시 후 다시 시도해 주세요.", 429);
    return finalizeResponse(response, clientIdentifier, 0, clientRateLimit.resetAt);
  }

  const remaining = Math.min(globalRateLimit.remaining, clientRateLimit.remaining);
  const resetAt = Math.max(globalRateLimit.resetAt, clientRateLimit.resetAt);

  if (!isJsonRequest(request)) {
    return finalizeResponse(
      errorResponse("JSON 요청만 지원해요.", 415),
      clientIdentifier,
      remaining,
      resetAt,
    );
  }

  const contentLength = Number(request.headers.get("content-length") ?? 0);

  if (contentLength > maxRequestBodyBytes) {
    return finalizeResponse(
      errorResponse("요청이 너무 커요.", 413),
      clientIdentifier,
      remaining,
      resetAt,
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
      );
    }

    console.warn("Invalid JSON sent to /api/analyze", error);
    return finalizeResponse(
      errorResponse("요청 형식이 올바르지 않아요.", 400),
      clientIdentifier,
      remaining,
      resetAt,
    );
  }

  const parsed = requestSchema.safeParse(body);

  if (!parsed.success) {
    return finalizeResponse(
      errorResponse("목표는 1자 이상 300자 이하로 입력해 주세요.", 400),
      clientIdentifier,
      remaining,
      resetAt,
    );
  }

  try {
    const result = await analyzeGoal(parsed.data.goal);
    const response = NextResponse.json(result);
    return finalizeResponse(response, clientIdentifier, remaining, resetAt);
  } catch (error) {
    console.error("Goal analysis failed", error);
    return finalizeResponse(
      errorResponse("목표를 분석하지 못했어요. 잠시 후 다시 시도해 주세요.", 500),
      clientIdentifier,
      remaining,
      resetAt,
    );
  }
}
