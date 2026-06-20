import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";

async function loadRateLimitModule() {
  vi.resetModules();
  return import("./rate-limit");
}

describe("checkRateLimit", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-20T00:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("allows requests until the limit is reached", async () => {
    const {checkRateLimit} = await loadRateLimitModule();

    expect(checkRateLimit("client-a", 2).allowed).toBe(true);
    expect(checkRateLimit("client-a", 2).allowed).toBe(true);

    const third = checkRateLimit("client-a", 2);

    expect(third.allowed).toBe(false);
    expect(third.remaining).toBe(0);
  });

  it("resets the bucket after the window", async () => {
    const {checkRateLimit} = await loadRateLimitModule();

    expect(checkRateLimit("client-b", 1, 1_000).allowed).toBe(true);
    expect(checkRateLimit("client-b", 1, 1_000).allowed).toBe(false);

    vi.advanceTimersByTime(1_001);

    expect(checkRateLimit("client-b", 1, 1_000).allowed).toBe(true);
  });

  it("keeps independent buckets per key", async () => {
    const {checkRateLimit} = await loadRateLimitModule();

    expect(checkRateLimit("client-c", 1).allowed).toBe(true);
    expect(checkRateLimit("client-c", 1).allowed).toBe(false);
    expect(checkRateLimit("client-d", 1).allowed).toBe(true);
  });
});
