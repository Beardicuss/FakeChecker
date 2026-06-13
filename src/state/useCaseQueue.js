import { useState, useCallback, useEffect } from 'react';
import tutorialCases from '../data/tutorialCases.json';
import fallbackCases from '../data/cases.json';
// dayCases are fetched via AI, but fallback to cases.json if offline or failed

const VERDICTS = new Set(['TRUE', 'FALSE', 'MISLEADING', 'UNVERIFIED']);
const VERDICT_ALIASES = {
    REAL: 'TRUE',
    FAKE: 'FALSE',
};

function normalizeVerdict(value) {
    if (typeof value === 'boolean') return value ? 'FALSE' : 'TRUE';
    if (typeof value !== 'string') return null;

    const normalized = value.trim().toUpperCase();
    if (VERDICT_ALIASES[normalized]) return VERDICT_ALIASES[normalized];
    return VERDICTS.has(normalized) ? normalized : null;
}

function normalizeEvidence(evidence) {
    if (!Array.isArray(evidence)) return [];

    return evidence
        .map(item => {
            if (typeof item === 'string') return { title: item, type: 'source' };
            if (!item || typeof item !== 'object') return null;
            return {
                title: item.title || item.name || item.label || 'Untitled evidence',
                type: item.type || 'source',
                detail: item.detail || item.note || item.summary || null,
            };
        })
        .filter(Boolean);
}

function normalizeCase(rawCase, index) {
    if (!rawCase || typeof rawCase !== 'object') return null;

    const objectiveVerdict = normalizeVerdict(rawCase.objectiveVerdict)
        || normalizeVerdict(rawCase.solution?.verdict)
        || normalizeVerdict(rawCase.is_fake);
    const ministryVerdict = normalizeVerdict(rawCase.ministryVerdict)
        || normalizeVerdict(rawCase.solution?.verdict)
        || objectiveVerdict;
    const article = rawCase.article || {};
    const body = rawCase.body || rawCase.content || article.body;
    const hint = rawCase.hint || (Array.isArray(rawCase.hints) ? rawCase.hints[0] : undefined);

    if (!rawCase.headline || !body || !ministryVerdict) return null;

    return {
        id: rawCase.id || rawCase.seedId || `ai-${index + 1}`,
        type: rawCase.type || rawCase.contentType || 'text',
        headline: rawCase.headline,
        body,
        source: rawCase.verification?.primarySources?.[0]?.name
            || rawCase.source
            || article.sourceName
            || 'AI Football Archive',
        mediaTag: rawCase.mediaTag ?? null,
        objectiveVerdict: objectiveVerdict || ministryVerdict,
        ministryVerdict,
        category: rawCase.category || null,
        publishedContext: rawCase.publishedContext || article.publishedAt || null,
        verification: rawCase.verification || null,
        evidence: normalizeEvidence(rawCase.evidence),
        redFlags: Array.isArray(rawCase.redFlags) ? rawCase.redFlags : [],
        explanation: rawCase.solution?.explanation || rawCase.explanation || null,
        ...(hint ? { hint } : {}),
    };
}

function normalizeCases(cases) {
    if (!Array.isArray(cases)) return [];
    return cases.map(normalizeCase).filter(Boolean);
}

/**
 * Case queue management hook.
 * Loads tutorial cases first, then Day 1 cases.
 */
export function useCaseQueue() {
    const [dynamicCases, setDynamicCases] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);

    // Call Cloudflare AI Worker API to fetch latest 6-hour interval cases
    useEffect(() => {
        const API_URL = import.meta.env.VITE_AI_WORKER_URL || 'http://127.0.0.1:8787';
        fetch(`${API_URL}/api/daily`)
            .then(res => res.json())
            .then(data => {
                if (data && data.questions && data.questions.length > 0) {
                    const normalizedCases = normalizeCases(data.questions);
                    setDynamicCases(normalizedCases.length > 0 ? normalizedCases : normalizeCases(fallbackCases));
                } else {
                    setDynamicCases(normalizeCases(fallbackCases));
                }
            })
            .catch(err => {
                console.error("AI Fetch Error, using local fallback cases:", err);
                setDynamicCases(normalizeCases(fallbackCases));
            })
            .finally(() => setIsLoading(false));
    }, []);

    const allCases = [...tutorialCases, ...dynamicCases];
    const currentCase = allCases[currentIndex] || null;
    const isTutorial = currentCase?.type === 'tutorial';
    const isQueueEmpty = currentIndex >= allCases.length;
    const totalCases = allCases.length;

    const advanceCase = useCallback(() => {
        setCurrentIndex(prev => prev + 1);
    }, []);

    const resetQueue = useCallback(() => {
        setCurrentIndex(0);
    }, []);

    return {
        currentCase,
        currentIndex,
        isTutorial,
        isQueueEmpty,
        totalCases,
        isLoading,
        advanceCase,
        resetQueue,
    };
}
