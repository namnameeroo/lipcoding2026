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

class RequestBodyTooLargeError extends Error {
  constructor() {
    super("Request body is too large.");
  }
}

function firstHeaderValue(value: string | null): string | null {
  return value?.split(",")[0]?.trim() || null;
}

function getClientIdentifier(request: NextRequest): string | null {
  if (!trustClientIpHeaders) {
    return null;
  }

  return (
    firstHeaderValue(request.headers.get("x-real-ip")) ??
    firstHeaderValue(request.headers.get("x-forwarded-for"))
  );
}

function errorResponse(message: string, status: number) {
  return NextResponse.json({error: message}, {status});
}

function setRateLimitHeaders(response: NextResponse, remaining: number, resetAt: number) {
  response.headers.set("X-RateLimit-Remaining", String(remaining));
  response.headers.set("X-RateLimit-Reset", String(resetAt));
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
  const globalRateLimit = checkRateLimit("api:analyze:global", 60);

  if (!globalRateLimit.allowed) {
    const response = errorResponse("요청이 너무 많아요. 잠시 후 다시 시도해 주세요.", 429);
    setRateLimitHeaders(response, 0, globalRateLimit.resetAt);
    return response;
  }

  const clientIdentifier = getClientIdentifier(request);
  const clientRateLimit = clientIdentifier
    ? checkRateLimit(`api:analyze:client:${clientIdentifier}`)
    : null;

  if (clientRateLimit && !clientRateLimit.allowed) {
    const response = errorResponse("요청이 너무 많아요. 잠시 후 다시 시도해 주세요.", 429);
    setRateLimitHeaders(response, 0, clientRateLimit.resetAt);
    return response;
  }

  if (!isJsonRequest(request)) {
    return errorResponse("JSON 요청만 지원해요.", 415);
  }

  const contentLength = Number(request.headers.get("content-length") ?? 0);

  if (contentLength > maxRequestBodyBytes) {
    return errorResponse("요청이 너무 커요.", 413);
  }

  let body: unknown;

  try {
    body = await parseJsonBody(request);
  } catch (error) {
    if (error instanceof RequestBodyTooLargeError) {
      return errorResponse("요청이 너무 커요.", 413);
    }

    console.warn("Invalid JSON sent to /api/analyze", error);
    return errorResponse("요청 형식이 올바르지 않아요.", 400);
  }

  const parsed = requestSchema.safeParse(body);

  if (!parsed.success) {
    return errorResponse("목표는 1자 이상 300자 이하로 입력해 주세요.", 400);
  }

  const remaining = Math.min(
    globalRateLimit.remaining,
    clientRateLimit?.remaining ?? globalRateLimit.remaining,
  );
  const resetAt = Math.max(
    globalRateLimit.resetAt,
    clientRateLimit?.resetAt ?? globalRateLimit.resetAt,
  );

  try {
    const result = await analyzeGoal(parsed.data.goal);
    const response = NextResponse.json(result);
    setRateLimitHeaders(response, remaining, resetAt);
    return response;
  } catch (error) {
    console.error("Goal analysis failed", error);
    return errorResponse("목표를 분석하지 못했어요. 잠시 후 다시 시도해 주세요.", 500);
  }
}
