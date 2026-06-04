import { useState, useCallback } from 'react';
import tutorialCases from '../data/tutorialCases.json';
import dayCases from '../data/cases.json';

/**
 * Case queue management hook.
 * Loads tutorial cases first, then Day 1 cases.
 */
export function useCaseQueue() {
    const allCases = [...tutorialCases, ...dayCases];
    const [currentIndex, setCurrentIndex] = useState(0);

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
        advanceCase,
        resetQueue,
    };
}
