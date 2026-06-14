const LOCAL_LEADERBOARD_KEY = 'fake-checker-leaderboard';
const MAX_LOCAL_ROWS = 50;

function getApiUrl() {
    return import.meta.env.VITE_AI_WORKER_URL || '';
}

function readLocalRows() {
    try {
        const raw = window.localStorage.getItem(LOCAL_LEADERBOARD_KEY);
        const parsed = raw ? JSON.parse(raw) : [];
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function writeLocalRows(rows) {
    try {
        window.localStorage.setItem(LOCAL_LEADERBOARD_KEY, JSON.stringify(rows.slice(0, MAX_LOCAL_ROWS)));
    } catch {
        // Leaderboard can still use the remote worker if storage is unavailable.
    }
}

function sortRows(rows) {
    return [...rows].sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime();
    });
}

function saveLocalScore(entry) {
    const rows = readLocalRows().filter(row => row.agentId !== entry.agentId);
    rows.push(entry);
    writeLocalRows(sortRows(rows));
}

export function calculateLeaderboardScore({ correctCount, wrongCount, skipCount, trust, processed }) {
    return Math.max(0, (
        (correctCount * 100)
        - (wrongCount * 35)
        - (skipCount * 10)
        + (trust * 5)
        + processed
    ));
}

export async function fetchLeaderboard(range = 'global') {
    const apiUrl = getApiUrl();

    if (apiUrl) {
        const response = await fetch(`${apiUrl}/api/leaderboard?range=${encodeURIComponent(range)}`);
        if (response.ok) {
            const data = await response.json();
            return Array.isArray(data.rows) ? data.rows : [];
        }
    }

    return sortRows(readLocalRows());
}

export async function submitLeaderboardScore(entry) {
    const apiUrl = getApiUrl();
    saveLocalScore(entry);

    if (!apiUrl) return { ok: true, local: true };

    const response = await fetch(`${apiUrl}/api/leaderboard`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
    });

    if (!response.ok) {
        throw new Error(`Leaderboard submit failed: ${response.status}`);
    }

    return response.json();
}
