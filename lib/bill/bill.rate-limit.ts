const WINDOW_MS = 60_000;
const MAX_REQUESTS = 10;
const hits = new Map<string, { count: number; resetAt: number }>();

export function checkBillRateLimit(identifier: string): boolean {
    const key = identifier || "unknown";
    const now = Date.now();
    const entry = hits.get(key);

    if (!entry || entry.resetAt <= now) {
        hits.set(key, { count: 1, resetAt: now + WINDOW_MS });
        return false;
    }

    entry.count += 1;
    return entry.count <= MAX_REQUESTS;
}
