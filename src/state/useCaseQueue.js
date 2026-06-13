import { useState, useCallback, useEffect } from 'react';
import tutorialCases from '../data/tutorialCases.json';
import fallbackCases from '../data/cases.json';
import generatedContent from '../data/generatedContent.json';
// Prepared cases are read from JSON first, with cached worker JSON as an optional refresh.

const PRESENTATION_DAYS = 6;
const CASES_PER_DAY = 18;
const TARGET_DYNAMIC_CASES = CASES_PER_DAY * PRESENTATION_DAYS;
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

const FOOTBALL_TERMS = [
    'football',
    'soccer',
    'fifa',
    'uefa',
    'world cup',
    'euro',
    'champions league',
    'europa league',
    'premier league',
    'la liga',
    'serie a',
    'bundesliga',
    'ligue 1',
    'match',
    'goal',
    'club',
    'national team',
    'manager',
    'coach',
    'player',
    'striker',
    'midfielder',
    'defender',
    'goalkeeper',
    'penalty',
    'var',
    'transfer',
    'napoli',
    'dinamo tbilisi',
    'georgia',
    'kvaratskhelia',
    'mamardashvili',
];

function isFootballCase(caseData) {
    const text = [
        caseData.headline,
        caseData.body,
        caseData.source,
        caseData.category,
        caseData.publishedContext,
        ...(caseData.evidence || []).flatMap(item => [item.title, item.detail]),
    ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

    return FOOTBALL_TERMS.some(term => text.includes(term));
}

function normalizeCases(cases) {
    if (!Array.isArray(cases)) return [];
    return cases.map(normalizeCase).filter(Boolean).filter(isFootballCase);
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
    const start = ((dayNumber - 1) * CASES_PER_DAY) % Math.max(1, orderedCases.length);
    const dayCases = orderedCases.length === 0
        ? []
        : Array.from({ length: Math.min(CASES_PER_DAY, orderedCases.length) }, (_, index) => (
            orderedCases[(start + index) % orderedCases.length]
        ));

    return dayNumber === 1 ? [...tutorialCases, ...dayCases] : dayCases;
}

/**
 * Case queue management hook.
 * Loads tutorial cases first, then Day 1 cases.
 */
export function useCaseQueue(day = 1) {
    const [dynamicCases, setDynamicCases] = useState(() => (
        mergeWithFallback(normalizeCases(generatedContent.questions))
    ));
    const [dynamicMail, setDynamicMail] = useState(() => (
        Array.isArray(generatedContent.emails) ? generatedContent.emails : []
    ));
    const [isLoading, setIsLoading] = useState(true);
    const [currentIndexByDay, setCurrentIndexByDay] = useState({});

    // Fetch cached prepared JSON only. The worker must not generate during play.
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
                console.error("Prepared content fetch failed, using bundled JSON:", err);
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
