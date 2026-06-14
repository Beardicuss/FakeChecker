const AGENT_ID_KEY = 'fake-checker-issued-agent-ids';
const AGENT_PROFILE_KEY = 'fake-checker-agent-profile';
const AGENT_NAME_INDEX_KEY = 'fake-checker-agent-name-index';

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

function readNameIndex() {
    try {
        if (typeof window === 'undefined') return {};
        const raw = window.localStorage.getItem(AGENT_NAME_INDEX_KEY);
        const parsed = raw ? JSON.parse(raw) : {};
        return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
    } catch {
        return {};
    }
}

function writeNameIndex(index) {
    try {
        if (typeof window === 'undefined') return;
        window.localStorage.setItem(AGENT_NAME_INDEX_KEY, JSON.stringify(index));
    } catch {
        // Identity still works for this session if local storage is unavailable.
    }
}

function getNameKey(name) {
    return sanitizeAgentName(name).toLowerCase();
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
    const savedIdentity = getSavedIdentityForName(agentName);
    const id = savedIdentity?.id || existingId || issueAgentId();
    return {
        name: agentName,
        id,
        tag: formatAgentTag(agentName, id),
    };
}

export function getSavedIdentityForName(name) {
    const index = readNameIndex();
    return index[getNameKey(name)] || null;
}

export function loadAgentIdentity() {
    try {
        if (typeof window === 'undefined') return null;
        const raw = window.localStorage.getItem(AGENT_PROFILE_KEY);
        const parsed = raw ? JSON.parse(raw) : null;
        if (!parsed?.name || !parsed?.id) return null;

        return {
            name: sanitizeAgentName(parsed.name),
            id: parsed.id,
            avatarId: parsed.avatarId || 'user',
        };
    } catch {
        return null;
    }
}

export function saveAgentIdentity(identity) {
    if (!identity?.name || !identity?.id) return;

    const profile = {
        name: sanitizeAgentName(identity.name),
        id: identity.id,
        avatarId: identity.avatarId || 'user',
    };

    try {
        if (typeof window !== 'undefined') {
            window.localStorage.setItem(AGENT_PROFILE_KEY, JSON.stringify(profile));
        }
    } catch {
        // Ignore storage failures; the active React state remains valid.
    }

    const issued = new Set(readIssuedIds());
    issued.add(profile.id);
    writeIssuedIds([...issued]);

    const index = readNameIndex();
    index[getNameKey(profile.name)] = profile;
    writeNameIndex(index);
}

export function clearAgentIdentity() {
    try {
        if (typeof window === 'undefined') return;
        window.localStorage.removeItem(AGENT_PROFILE_KEY);
        window.localStorage.removeItem(AGENT_NAME_INDEX_KEY);
        window.localStorage.removeItem(AGENT_ID_KEY);
    } catch {
        // Nothing to clear if storage is unavailable.
    }
}
