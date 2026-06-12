import { useState, useCallback, useEffect } from 'react';
import tutorialCases from '../data/tutorialCases.json';
// dayCases are now strictly dynamic, fetched via AI Worker on launch

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
                if (data && data.questions) {
                    setDynamicCases(data.questions);
                }
            })
            .catch(err => console.error("AI Fetch Error:", err))
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
