import fallbackCases from '../data/cases.json';

const DEFAULT_AGENT = {
    agentName: 'UNREGISTERED',
    agentId: 'NO-ID',
    agentEmail: 'NO CONTACT RECORD',
};

function formatDate(value = new Date()) {
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return '[DATE REDACTED]';

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `[${day}.${month}.${year} | ${hours}:${minutes}]`;
}

function normalizeCase(rawCase) {
    const article = rawCase.article || {};
    const solution = rawCase.solution || {};
    return {
        id: rawCase.id,
        headline: rawCase.headline,
        category: rawCase.category || 'field report',
        source: article.sourceName || rawCase.source || 'UNKNOWN SOURCE',
        publishedAt: article.publishedAt || rawCase.publishedContext || null,
        verdict: solution.verdict || rawCase.ministryVerdict || 'FAKE',
        explanation: solution.explanation || rawCase.explanation || 'No supplemental explanation attached.',
        redFlags: Array.isArray(rawCase.redFlags) ? rawCase.redFlags : [],
    };
}

function buildIdentityMessage(agent) {
    return {
        id: 'identity',
        label: 'WELCOME',
        from: 'REGISTRY.AUTHORITY',
        date: formatDate(),
        security: 'STARTER',
        subject: 'YOUR AGENT PROFILE IS READY',
        body: [
            `Welcome, ${agent.agentName || DEFAULT_AGENT.agentName}. Your locked agent ID is ${agent.agentId || DEFAULT_AGENT.agentId}.`,
            `Your leaderboard score and game progress belong to this ID. You may change your nickname later, but this ID cannot be edited.`,
            'Open the Profile tab on the left side of the workstation to edit your nickname and choose a leaderboard avatar. If no avatar is selected, the default no-face icon will be used.',
            'During each shift, inspect every football claim, compare it with the directives, and stamp TRUE, FAKE, or SKIP. Correct calls earn credits; wrong calls reduce Ministry trust.',
        ],
    };
}

function buildCoreDirectiveMessage() {
    return {
        id: 'core-directive',
        label: 'DIRECTIVE',
        from: 'POLICY.BUREAU',
        date: formatDate(),
        security: 'SECURE-A',
        subject: 'ACTIVE CLASSIFICATION RULES',
        body: [
            'The current field protocol is binary: TRUE or FAKE. If evidence is insufficient, use SKIP and accept the minor trust penalty.',
            'TRUE requires reliable confirmation. FAKE requires contradiction, fabrication, distortion, or lack of confirmation strong enough to reject public approval.',
            'SKIP is not failure. It is a controlled delay. Excessive delay, however, is still recorded.',
            'A correct answer is not a guess. It is the result of source discipline.',
        ],
    };
}

function buildEventDirective(caseData, index) {
    const flags = caseData.redFlags.length > 0
        ? caseData.redFlags.map(flag => flag.replaceAll('_', ' ')).join(', ')
        : 'NO FLAGS LOGGED';

    return {
        id: `event-${caseData.id || index}`,
        label: `EVENT ${index + 1}`,
        from: 'INTELLIGENCE.DESK',
        date: formatDate(caseData.publishedAt || new Date()),
        security: caseData.redFlags.length > 0 ? 'WATCHLIST' : 'INTERNAL',
        subject: caseData.headline,
        body: [
            `Source under observation: ${caseData.source}.`,
            `Classification forecast: ${caseData.verdict}.`,
            `Analyst note: ${caseData.explanation}`,
            `Known flags: ${flags}.`,
            'When this event appears in the queue, inspect the evidence before stamping. Similar headlines may not share the same classification.',
        ],
    };
}

function normalizeExternalMessage(message, index) {
    if (!message || typeof message !== 'object') return null;
    const body = Array.isArray(message.body)
        ? message.body
        : String(message.body || message.text || '').split('\n').filter(Boolean);

    if (!message.subject || body.length === 0) return null;

    return {
        id: message.id || `ai-mail-${index + 1}`,
        label: message.label || 'AI NOTICE',
        from: message.from || message.sender || 'AI.DIRECTIVE.NODE',
        date: message.date || formatDate(),
        security: message.security || 'INTERNAL',
        subject: message.subject,
        body,
    };
}

export function buildMailMessages({ agentName, agentId, agentEmail, externalMessages = [] } = {}) {
    const agent = {
        ...DEFAULT_AGENT,
        agentName: agentName || DEFAULT_AGENT.agentName,
        agentId: agentId || DEFAULT_AGENT.agentId,
        agentEmail: agentEmail || DEFAULT_AGENT.agentEmail,
    };
    const eventMessages = fallbackCases
        .map(normalizeCase)
        .slice(0, 6)
        .map(buildEventDirective);
    const aiMessages = externalMessages
        .map(normalizeExternalMessage)
        .filter(Boolean);

    return [
        buildIdentityMessage(agent),
        buildCoreDirectiveMessage(),
        ...aiMessages,
        ...eventMessages,
    ];
}
