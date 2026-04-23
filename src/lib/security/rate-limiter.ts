type RateLimitEntry = {
  count: number;
  resetTime: number;
};

type RateLimiterConfig = {
  windowMs: number;
  maxRequests: number;
};

const DEFAULT_CONFIG: RateLimiterConfig = {
  windowMs: 60_000,
  maxRequests: 30
};

const stores = new Map<string, Map<string, RateLimitEntry>>();

function getStore(namespace: string): Map<string, RateLimitEntry> {
  let store = stores.get(namespace);
  if (!store) {
    store = new Map();
    stores.set(namespace, store);
  }
  return store;
}

export function checkRateLimit(
  key: string,
  namespace = "default",
  config: RateLimiterConfig = DEFAULT_CONFIG
): { allowed: boolean; remaining: number; resetInMs: number } {
  const now = Date.now();
  const store = getStore(namespace);
  const entry = store.get(key);

  if (!entry || now > entry.resetTime) {
    store.set(key, { count: 1, resetTime: now + config.windowMs });
    return { allowed: true, remaining: config.maxRequests - 1, resetInMs: config.windowMs };
  }

  entry.count += 1;
  const remaining = Math.max(0, config.maxRequests - entry.count);
  const resetInMs = entry.resetTime - now;

  return {
    allowed: entry.count <= config.maxRequests,
    remaining,
    resetInMs
  };
}

export function resetRateLimit(key: string, namespace = "default"): void {
  const store = stores.get(namespace);
  store?.delete(key);
}
