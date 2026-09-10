// Shared counter store for rate limiting.
//
// Uses the Upstash Redis REST API (plain fetch, no extra dependency) when
// UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN are configured, so a
// limit is enforced globally across every Vercel serverless instance
// instead of per-instance. Falls back to an in-process Map otherwise —
// correct for a single long-lived process (Hostinger) but only
// per-instance on Vercel (see AUDIT_REPORT H-2). Get free-tier credentials
// at https://upstash.com and add them to close that gap in production.

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

export const isSharedStoreConfigured = Boolean(UPSTASH_URL && UPSTASH_TOKEN);

async function upstash(...command) {
  const response = await fetch(UPSTASH_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${UPSTASH_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(command),
  });
  if (!response.ok) throw new Error(`Upstash request failed with status ${response.status}`);
  const { result } = await response.json();
  return result;
}

const memoryStore = new Map();
let lastSweep = Date.now();

function sweepMemoryStore(now, windowMs) {
  if (now - lastSweep <= windowMs) return;
  lastSweep = now;
  for (const [key, entry] of memoryStore) {
    if (entry.resetAt <= now) memoryStore.delete(key);
  }
}

/**
 * Reads the current { count, resetAt } for `key` without incrementing it.
 * A missing/expired key reads as count 0.
 */
export async function peekCounter(key) {
  if (isSharedStoreConfigured) {
    try {
      const raw = await upstash("GET", key);
      return { count: raw ? Number(raw) : 0, resetAt: 0 };
    } catch {
      // Fall through to the in-memory store if Upstash is unreachable.
    }
  }
  const now = Date.now();
  const current = memoryStore.get(key);
  if (!current || current.resetAt <= now) return { count: 0, resetAt: now };
  return current;
}

/**
 * Increments the counter for `key` inside a `windowMs` window (creating it
 * with that TTL on the first hit) and returns the resulting
 * { count, resetAt }. Never throws — a failed shared-store call degrades to
 * the in-memory fallback rather than blocking real traffic.
 */
export async function incrementCounter(key, windowMs) {
  if (isSharedStoreConfigured) {
    try {
      const windowSeconds = Math.max(1, Math.ceil(windowMs / 1000));
      const count = await upstash("INCR", key);
      if (count === 1) await upstash("EXPIRE", key, windowSeconds);
      return { count, resetAt: Date.now() + windowMs };
    } catch {
      // Fall through to the in-memory store below.
    }
  }

  const now = Date.now();
  sweepMemoryStore(now, windowMs);
  const current = memoryStore.get(key);
  if (!current || current.resetAt <= now) {
    const entry = { count: 1, resetAt: now + windowMs };
    memoryStore.set(key, entry);
    return entry;
  }
  current.count += 1;
  memoryStore.set(key, current);
  return current;
}

/** Clears a key immediately, e.g. after a successful login. */
export async function resetCounter(key) {
  if (isSharedStoreConfigured) {
    try {
      await upstash("DEL", key);
      return;
    } catch {
      // Ignore — worst case the counter expires naturally via its TTL.
    }
  }
  memoryStore.delete(key);
}
