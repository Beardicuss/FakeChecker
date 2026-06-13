import { useState, useCallback, useEffect } from 'react';
import tutorialCases from '../data/tutorialCases.json';
import fallbackCases from '../data/cases.json';
// dayCases are fetched via AI, but fallback to cases.json if offline or failed

const VERDICTS = new Set(['REAL', 'FAKE']);

function normalizeVerdict(value) {
    if (typeof value === 'boolean') return value ? 'FAKE' : 'REAL';
    if (typeof value !== 'string') return null;

    const normalized = value.trim().toUpperCase();
    return VERDICTS.has(normalized) ? normalized : null;
}

function normalizeCase(rawCase, index) {
    if (!rawCase || typeof rawCase !== 'object') return null;

    const objectiveVerdict = normalizeVerdict(rawCase.objectiveVerdict)
        || normalizeVerdict(rawCase.is_fake);
    const ministryVerdict = normalizeVerdict(rawCase.ministryVerdict)
        || objectiveVerdict;
    const body = rawCase.body || rawCase.content;
    const hint = rawCase.hint || (Array.isArray(rawCase.hints) ? rawCase.hints[0] : undefined);

    if (!rawCase.headline || !body || !ministryVerdict) return null;

    return {
        id: rawCase.id || `ai-${index + 1}`,
        type: rawCase.type || 'text',
        headline: rawCase.headline,
        body,
        source: rawCase.source || 'AI Football Archive',
        mediaTag: rawCase.mediaTag ?? null,
        objectiveVerdict: objectiveVerdict || ministryVerdict,
        ministryVerdict,
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
                    setDynamicCases(normalizedCases.length > 0 ? normalizedCases : fallbackCases);
                } else {
                    setDynamicCases(fallbackCases);
                }
            })
            .catch(err => {
                console.error("AI Fetch Error, using local fallback cases:", err);
                setDynamicCases(fallbackCases);
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
