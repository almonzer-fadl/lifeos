const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

const DEFAULTS = {
  MUTATION: { max: 20, windowMs: 60_000 },
  READ: { max: 60, windowMs: 60_000 },
};

export function rateLimit(
  key: string,
  opts: { max: number; windowMs: number } = DEFAULTS.READ
): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + opts.windowMs });
    return { allowed: true, remaining: opts.max - 1, resetIn: opts.windowMs };
  }

  entry.count++;

  if (entry.count > opts.max) {
    return { allowed: false, remaining: 0, resetIn: entry.resetAt - now };
  }

  return { allowed: true, remaining: opts.max - entry.count, resetIn: entry.resetAt - now };
}

// Cleanup stale entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore) {
    if (now > entry.resetAt) rateLimitStore.delete(key);
  }
}, 300_000).unref();

export { DEFAULTS };
