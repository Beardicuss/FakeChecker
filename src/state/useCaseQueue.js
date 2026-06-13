import { useState, useCallback, useEffect } from 'react';
import tutorialCases from '../data/tutorialCases.json';
import fallbackCases from '../data/cases.json';
// dayCases are fetched via AI, but fallback to cases.json if offline or failed

const TARGET_DYNAMIC_CASES = 49;
const PRESENTATION_DAYS = 3;
const VERDICTS = new Set(['TRUE', 'FAKE']);
const VERDICT_ALIASES = {
    REAL: 'TRUE',
    FALSE: 'FAKE',
    MISLEADING: 'FAKE',
    UNVERIFIED: 'FAKE',
};

function normalizeVerdict(value) {
    if (typeof value === 'boolean') return value ? 'FAKE' : 'TRUE';
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

function getCaseDifficulty(caseData) {
    const flags = caseData.redFlags?.length || 0;
    const text = `${caseData.headline} ${caseData.body}`.toLowerCase();

    if (caseData.type === 'tutorial') return 0;
    if (flags === 0 && caseData.ministryVerdict === 'TRUE') return 1;
    if (text.includes('mars') || text.includes('var') || text.includes('cancelled') || text.includes('secret')) return 1;
    if (flags <= 1) return 2;
    return 3;
}

function orderByDifficulty(cases) {
    return [...cases].sort((a, b) => getCaseDifficulty(a) - getCaseDifficulty(b));
}

function mergeWithFallback(primaryCases) {
    const normalizedFallback = normalizeCases(fallbackCases);
    const merged = [];
    const usedIds = new Set();

    [...primaryCases, ...orderByDifficulty(normalizedFallback)].forEach(caseData => {
        if (!caseData || usedIds.has(caseData.id)) return;
        usedIds.add(caseData.id);
        merged.push(caseData);
    });

    return merged.slice(0, TARGET_DYNAMIC_CASES);
}

function getCasesForDay(day, dynamicCases) {
    const dayNumber = Math.max(1, Math.min(PRESENTATION_DAYS, day || 1));
    const orderedCases = orderByDifficulty(dynamicCases);
    const casesPerDay = Math.ceil(TARGET_DYNAMIC_CASES / PRESENTATION_DAYS);
    const start = (dayNumber - 1) * casesPerDay;
    const end = dayNumber * casesPerDay;
    const dayCases = orderedCases.slice(start, end);

    return dayNumber === 1 ? [...tutorialCases, ...dayCases] : dayCases;
}

/**
 * Case queue management hook.
 * Loads tutorial cases first, then Day 1 cases.
 */
export function useCaseQueue(day = 1) {
    const [dynamicCases, setDynamicCases] = useState([]);
    const [dynamicMail, setDynamicMail] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentIndexByDay, setCurrentIndexByDay] = useState({});

    // Call Cloudflare AI Worker API to fetch latest 6-hour interval cases
    useEffect(() => {
        const API_URL = import.meta.env.VITE_AI_WORKER_URL || 'http://127.0.0.1:8787';
        fetch(`${API_URL}/api/daily`)
            .then(res => res.json())
            .then(data => {
                if (data && data.questions && data.questions.length > 0) {
                    const normalizedCases = normalizeCases(data.questions);
                    setDynamicCases(mergeWithFallback(normalizedCases));
                    setDynamicMail(Array.isArray(data.emails) ? data.emails : []);
                } else {
                    setDynamicCases(mergeWithFallback([]));
                    setDynamicMail(Array.isArray(data?.emails) ? data.emails : []);
                }
            })
            .catch(err => {
                console.error("AI Fetch Error, using local fallback cases:", err);
                setDynamicCases(mergeWithFallback([]));
                setDynamicMail([]);
            })
            .finally(() => setIsLoading(false));
    }, []);

    const dayKey = String(Math.max(1, day || 1));
    const allCases = getCasesForDay(day, dynamicCases);
    const currentIndex = currentIndexByDay[dayKey] || 0;
    const currentCase = allCases[currentIndex] || null;
    const isTutorial = currentCase?.type === 'tutorial';
    const isQueueEmpty = currentIndex >= allCases.length;
    const totalCases = allCases.length;

    const advanceCase = useCallback(() => {
        setCurrentIndexByDay(prev => ({
            ...prev,
            [dayKey]: (prev[dayKey] || 0) + 1,
        }));
    }, [dayKey]);

    const resetQueue = useCallback(() => {
        setCurrentIndexByDay({});
    }, []);

    return {
        currentCase,
        currentIndex,
        isTutorial,
        isQueueEmpty,
        totalCases,
        isLoading,
        dynamicMail,
        advanceCase,
        resetQueue,
    };
}
