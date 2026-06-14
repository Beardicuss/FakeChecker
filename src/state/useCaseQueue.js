import { useState, useCallback, useEffect } from 'react';
import fallbackCases from '../data/cases.json';
import additionalTextCases from '../data/additionalTextCases.json';
import submittedTextCases from '../data/submittedTextCases.json';
import imageCases from '../data/imageCases.json';
import generatedContent from '../data/generatedContent.json';
import { loadGameProgress, saveGameProgress } from '../utils/progressStorage';
// Prepared cases are read from JSON first, with cached worker JSON as an optional refresh.

const PRESENTATION_DAYS = 3;
// Future full-game update:
// const PRESENTATION_DAYS = 6;
const TEXT_CASE_LAYOUT_BY_DAY = {
    1: { trueCount: 21, fakeCount: 21 },
    2: { trueCount: 21, fakeCount: 21 },
    3: { trueCount: 22, fakeCount: 21 },
};
const TARGET_DYNAMIC_CASES = 240;
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
        image: rawCase.image || rawCase.imagePath || null,
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

function groupByVerdict(cases) {
    return cases.reduce((groups, caseData) => {
        if (caseData.ministryVerdict === 'TRUE') groups.trueCases.push(caseData);
        if (caseData.ministryVerdict === 'FAKE') groups.fakeCases.push(caseData);
        return groups;
    }, { trueCases: [], fakeCases: [] });
}

function takeCycled(cases, count, offset = 0) {
    if (cases.length === 0) return [];
    if (cases.length >= offset + count) return cases.slice(offset, offset + count);

    return Array.from({ length: count }, (_, index) => (
        cases[(offset + index) % cases.length]
    ));
}

function interleaveCases(firstCases, secondCases) {
    const result = [];
    const maxLength = Math.max(firstCases.length, secondCases.length);

    for (let index = 0; index < maxLength; index += 1) {
        if (firstCases[index]) result.push(firstCases[index]);
        if (secondCases[index]) result.push(secondCases[index]);
    }

    return result;
}

function seededShuffle(cases, seed) {
    return [...cases]
        .map((caseData, index) => ({
            caseData,
            sortKey: Math.sin((index + 1) * 997 + seed * 7919),
        }))
        .sort((a, b) => a.sortKey - b.sortKey)
        .map(item => item.caseData);
}

function mergeWithFallback(primaryCases) {
    const normalizedFallback = normalizeCases([...fallbackCases, ...submittedTextCases, ...additionalTextCases]);
    const merged = [];
    const usedIds = new Set();

    [...normalizedFallback, ...primaryCases].forEach(caseData => {
        if (!caseData || usedIds.has(caseData.id)) return;
        usedIds.add(caseData.id);
        merged.push(caseData);
    });

    return merged.slice(0, TARGET_DYNAMIC_CASES);
}

function getTextCasesForDay(day, textCases) {
    const { trueCases, fakeCases } = groupByVerdict(textCases.filter(caseData => !caseData.image));
    const layout = TEXT_CASE_LAYOUT_BY_DAY[day] || TEXT_CASE_LAYOUT_BY_DAY[1];
    const previousLayouts = Object.entries(TEXT_CASE_LAYOUT_BY_DAY)
        .filter(([layoutDay]) => Number(layoutDay) < day)
        .map(([, dayLayout]) => dayLayout);
    const trueOffset = previousLayouts.reduce((total, dayLayout) => total + dayLayout.trueCount, 0);
    const fakeOffset = previousLayouts.reduce((total, dayLayout) => total + dayLayout.fakeCount, 0);
    const dailyTrueCases = takeCycled(trueCases, layout.trueCount, trueOffset);
    const dailyFakeCases = takeCycled(fakeCases, layout.fakeCount, fakeOffset);

    return interleaveCases(dailyTrueCases, dailyFakeCases);
}

function getPhotoCasesForDay(day) {
    const { trueCases, fakeCases } = groupByVerdict(normalizeCases(imageCases));
    const photoLayoutByDay = {
        1: { fakeStart: 0, fakeCount: 4, trueStart: 0, trueCount: 4 },
        2: { fakeStart: 4, fakeCount: 4, trueStart: 4, trueCount: 4 },
        3: { fakeStart: 8, fakeCount: 4, trueStart: 8, trueCount: 3 },
    };
    const layout = photoLayoutByDay[day];

    if (!layout) return [];

    return seededShuffle(interleaveCases(
        fakeCases.slice(layout.fakeStart, layout.fakeStart + layout.fakeCount),
        trueCases.slice(layout.trueStart, layout.trueStart + layout.trueCount),
    ), day);
}

function interspersePhotoCases(textCases, photoCases) {
    const result = [];
    let textIndex = 0;
    let photoIndex = 0;

    while (textIndex < textCases.length || photoIndex < photoCases.length) {
        const textChunk = textCases.slice(textIndex, textIndex + 2);
        result.push(...textChunk);
        textIndex += textChunk.length;

        if (photoIndex < photoCases.length) {
            result.push(photoCases[photoIndex]);
            photoIndex += 1;
        }

        if (textChunk.length === 0 && photoIndex < photoCases.length) {
            result.push(...photoCases.slice(photoIndex));
            break;
        }
    }

    return result;
}

function getCasesForDay(day, dynamicCases) {
    const dayNumber = Math.max(1, Math.min(PRESENTATION_DAYS, day || 1));
    return interspersePhotoCases(
        getTextCasesForDay(dayNumber, dynamicCases),
        getPhotoCasesForDay(dayNumber),
    );
}

/**
 * Case queue management hook.
 * Loads tutorial cases first, then Day 1 cases.
 */
export function useCaseQueue(day = 1, agentId = '') {
    const [dynamicCases, setDynamicCases] = useState(() => (
        mergeWithFallback(normalizeCases(generatedContent.questions))
    ));
    const [dynamicMail, setDynamicMail] = useState(() => (
        Array.isArray(generatedContent.emails) ? generatedContent.emails : []
    ));
    const [isLoading, setIsLoading] = useState(true);
    const [currentIndexByDay, setCurrentIndexByDay] = useState(() => (
        loadGameProgress(agentId)?.caseIndexByDay || {}
    ));

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
        setCurrentIndexByDay(prev => {
            const next = {
                ...prev,
                [dayKey]: (prev[dayKey] || 0) + 1,
            };
            saveGameProgress(agentId, { caseIndexByDay: next });
            return next;
        });
    }, [agentId, dayKey]);

    const resetQueue = useCallback(() => {
        setCurrentIndexByDay({});
        saveGameProgress(agentId, { caseIndexByDay: {} });
    }, [agentId]);

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
