const responseCache = new Map();
let cleanupStarted = false;

function normalizeKey(key) {
  return String(key || "");
}

export function startCacheCleanup(intervalMs = 60_000) {
  if (cleanupStarted) return;
  cleanupStarted = true;

  const timer = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of responseCache.entries()) {
      if (!entry || entry.expiresAt <= now) {
        responseCache.delete(key);
      }
    }
  }, intervalMs);

  if (typeof timer.unref === "function") {
    timer.unref();
  }
}

export function getCachedResponse(key) {
  const entry = responseCache.get(normalizeKey(key));
  if (!entry) return null;
  if (entry.expiresAt <= Date.now()) {
    responseCache.delete(normalizeKey(key));
    return null;
  }
  return entry.payload;
}

export function setCachedResponse(key, payload, ttlMs = 15_000) {
  responseCache.set(normalizeKey(key), {
    payload,
    expiresAt: Date.now() + ttlMs,
  });
}

export function invalidateCachedResponses(patterns = []) {
  const filters = Array.isArray(patterns) ? patterns : [patterns];
  if (filters.length === 0) {
    responseCache.clear();
    return;
  }

  for (const key of responseCache.keys()) {
    const matches = filters.some((pattern) => {
      const normalized = normalizeKey(pattern);
      return normalized && key.includes(normalized);
    });
    if (matches) responseCache.delete(key);
  }
}

export function createCacheMiddleware({ keyBuilder, ttlMs = 15_000 }) {
  return (req, res, next) => {
    const cacheKey = keyBuilder(req);
    if (!cacheKey) return next();

    const cached = getCachedResponse(cacheKey);
    if (cached) {
      res.setHeader("X-Cache", "HIT");
      return res.status(cached.status).json(cached.body);
    }

    const originalJson = res.json.bind(res);
    res.json = (body) => {
      setCachedResponse(cacheKey, { status: res.statusCode, body }, ttlMs);
      res.setHeader("X-Cache", "MISS");
      return originalJson(body);
    };

    next();
  };
}
