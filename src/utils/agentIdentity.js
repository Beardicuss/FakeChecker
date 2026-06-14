const AGENT_ID_KEY = 'fake-checker-issued-agent-ids';

function readIssuedIds() {
    try {
        if (typeof window === 'undefined') return [];
        const raw = window.localStorage.getItem(AGENT_ID_KEY);
        const parsed = raw ? JSON.parse(raw) : [];
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function writeIssuedIds(ids) {
    try {
        if (typeof window === 'undefined') return;
        window.localStorage.setItem(AGENT_ID_KEY, JSON.stringify(ids));
    } catch {
        // Local storage can be unavailable in private contexts; gameplay still works.
    }
}

export function sanitizeAgentName(name) {
    return String(name || '').trim().replace(/\s+/g, ' ').slice(0, 24);
}

export function formatAgentTag(name, id) {
    const cleanName = sanitizeAgentName(name) || 'Agent';
    return `${cleanName}${id || '#000000'}`;
}

export function issueAgentId() {
    const issued = new Set(readIssuedIds());
    let id = '';

    for (let attempt = 0; attempt < 20; attempt += 1) {
        id = `#${String(Math.floor(Math.random() * 1000000)).padStart(6, '0')}`;
        if (!issued.has(id)) break;
    }

    issued.add(id);
    writeIssuedIds([...issued]);
    return id;
}

export function createAgentIdentity(name, existingId = '') {
    const agentName = sanitizeAgentName(name);
    const id = existingId || issueAgentId();
    return {
        name: agentName,
        id,
        tag: formatAgentTag(agentName, id),
    };
}
