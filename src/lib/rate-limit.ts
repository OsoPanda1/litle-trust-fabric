import { secureJsonError } from "./security-headers";

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

const CLEANUP_INTERVAL = 60_000;
let lastCleanup = Date.now();

function cleanup(): void {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  for (const [key, entry] of store) {
    if (now > entry.resetAt) store.delete(key);
  }
}

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

const DEFAULT_CONFIG: RateLimitConfig = {
  windowMs: 60_000,
  maxRequests: 100,
};

const STRICT_CONFIGS: Record<string, RateLimitConfig> = {
  "/api/submit": { windowMs: 60_000, maxRequests: 10 },
  "/api/auth": { windowMs: 60_000, maxRequests: 20 },
  "/api/verify": { windowMs: 60_000, maxRequests: 200 },
};

export function checkRateLimit(
  identifier: string,
  path?: string,
  config?: Partial<RateLimitConfig>,
): { allowed: boolean; remaining: number; resetIn: number } {
  cleanup();

  const cfg = path && STRICT_CONFIGS[path]
    ? STRICT_CONFIGS[path]
    : { ...DEFAULT_CONFIG, ...config };

  const now = Date.now();
  const entry = store.get(identifier);

  if (!entry || now > entry.resetAt) {
    store.set(identifier, { count: 1, resetAt: now + cfg.windowMs });
    return { allowed: true, remaining: cfg.maxRequests - 1, resetIn: cfg.windowMs };
  }

  entry.count++;
  const remaining = Math.max(0, cfg.maxRequests - entry.count);

  if (entry.count > cfg.maxRequests) {
    return { allowed: false, remaining: 0, resetIn: entry.resetAt - now };
  }

  return { allowed: true, remaining, resetIn: entry.resetAt - now };
}

export function rateLimitMiddleware(
  request: Request,
  config?: Partial<RateLimitConfig>,
): Response | null {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    ?? request.headers.get("x-real-ip")
    ?? "unknown";

  const url = new URL(request.url);
  const result = checkRateLimit(ip, url.pathname, config);

  if (!result.allowed) {
    const headers: Record<string, string> = {
      "Retry-After": String(Math.ceil(result.resetIn / 1000)),
      "X-RateLimit-Limit": String(config?.maxRequests ?? DEFAULT_CONFIG.maxRequests),
      "X-RateLimit-Remaining": "0",
      "X-RateLimit-Reset": String(Math.ceil((Date.now() + result.resetIn) / 1000)),
    };
    return secureJsonError(429, `Rate limit exceeded. Retry after ${Math.ceil(result.resetIn / 1000)}s.`);
  }

  return null;
}
