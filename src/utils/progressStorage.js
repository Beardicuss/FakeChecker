const PROGRESS_PREFIX = 'fake-checker-progress-';

function keyFor(agentId) {
    return `${PROGRESS_PREFIX}${agentId}`;
}

export function loadGameProgress(agentId) {
    if (!agentId) return null;

    try {
        if (typeof window === 'undefined') return null;
        const raw = window.localStorage.getItem(keyFor(agentId));
        const parsed = raw ? JSON.parse(raw) : null;
        return parsed && typeof parsed === 'object' ? parsed : null;
    } catch {
        return null;
    }
}

export function saveGameProgress(agentId, patch) {
    if (!agentId) return;

    try {
        if (typeof window === 'undefined') return;
        const current = loadGameProgress(agentId) || {};
        window.localStorage.setItem(keyFor(agentId), JSON.stringify({
            ...current,
            ...patch,
            savedAt: new Date().toISOString(),
        }));
    } catch {
        // Progress saving is best-effort; gameplay state remains valid in memory.
    }
}

export function clearGameProgress(agentId) {
    if (!agentId) return;

    try {
        if (typeof window === 'undefined') return;
        window.localStorage.removeItem(keyFor(agentId));
    } catch {
        // Nothing to clear if storage is unavailable.
    }
}
