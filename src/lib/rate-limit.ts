interface RateLimitStore {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitStore>();

// Cleanup stale entries every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, store] of rateLimitMap.entries()) {
    if (now > store.resetTime) {
      rateLimitMap.delete(ip);
    }
  }
}, 10 * 60 * 1000);

export function checkRateLimit(
  ip: string,
  limit: number = 3,
  windowMs: number = 10 * 60 * 1000
): { success: boolean; limit: number; remaining: number; resetTime: number } {
  const now = Date.now();
  const store = rateLimitMap.get(ip);

  if (!store || now > store.resetTime) {
    const newStore: RateLimitStore = {
      count: 1,
      resetTime: now + windowMs,
    };
    rateLimitMap.set(ip, newStore);
    return {
      success: true,
      limit,
      remaining: limit - 1,
      resetTime: newStore.resetTime,
    };
  }

  if (store.count >= limit) {
    return {
      success: false,
      limit,
      remaining: 0,
      resetTime: store.resetTime,
    };
  }

  store.count += 1;
  return {
    success: true,
    limit,
    remaining: limit - store.count,
    resetTime: store.resetTime,
  };
}
