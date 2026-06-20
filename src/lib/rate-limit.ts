type RateLimitBucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, RateLimitBucket>();
let lastCleanupAt = 0;

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  resetAt: number;
};

export function checkRateLimit(
  key: string,
  limit = 5,
  windowMs = 60_000,
): RateLimitResult {
  const now = Date.now();

  if (lastCleanupAt + windowMs <= now) {
    buckets.forEach((bucket, bucketKey) => {
      if (bucket.resetAt <= now) {
        buckets.delete(bucketKey);
      }
    });
    lastCleanupAt = now;
  }

  const current = buckets.get(key);

  if (!current || current.resetAt <= now) {
    const resetAt = now + windowMs;
    buckets.set(key, {count: 1, resetAt});
    return {allowed: true, remaining: limit - 1, resetAt};
  }

  if (current.count >= limit) {
    return {allowed: false, remaining: 0, resetAt: current.resetAt};
  }

  current.count += 1;
  buckets.set(key, current);

  return {
    allowed: true,
    remaining: Math.max(0, limit - current.count),
    resetAt: current.resetAt,
  };
}
