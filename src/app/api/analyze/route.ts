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

function getClientIdentifier(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }

  return request.headers.get("x-real-ip") ?? "unknown";
}

function errorResponse(message: string, status: number) {
  return NextResponse.json({error: message}, {status});
}

export async function POST(request: NextRequest) {
  let body: unknown;

  try {
    body = await request.json();
  } catch (error) {
    console.warn("Invalid JSON sent to /api/analyze", error);
    return errorResponse("요청 형식이 올바르지 않아요.", 400);
  }

  const parsed = requestSchema.safeParse(body);

  if (!parsed.success) {
    return errorResponse("목표는 1자 이상 300자 이하로 입력해 주세요.", 400);
  }

  const rateLimit = checkRateLimit(getClientIdentifier(request));

  if (!rateLimit.allowed) {
    const response = errorResponse("요청이 너무 많아요. 잠시 후 다시 시도해 주세요.", 429);
    response.headers.set("X-RateLimit-Remaining", "0");
    response.headers.set("X-RateLimit-Reset", String(rateLimit.resetAt));
    return response;
  }

  try {
    const result = await analyzeGoal(parsed.data.goal);
    const response = NextResponse.json(result);
    response.headers.set("X-RateLimit-Remaining", String(rateLimit.remaining));
    response.headers.set("X-RateLimit-Reset", String(rateLimit.resetAt));
    return response;
  } catch (error) {
    console.error("Goal analysis failed", error);
    return errorResponse("목표를 분석하지 못했어요. 잠시 후 다시 시도해 주세요.", 500);
  }
}
