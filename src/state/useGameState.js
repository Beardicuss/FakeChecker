import { useState, useCallback } from 'react';
import { INITIAL_TRUST, calculateTrustDelta, clampTrust } from '../utils/trustCalculator';

const DAILY_QUOTA = 8;

/**
 * Core game state hook.
 * Manages trust, quota progress, day number, and screen transitions.
 */
export function useGameState() {
    const [screen, setScreen] = useState('boot');        // current screen id
    const [agentName, setAgentName] = useState('');
    const [trust, setTrust] = useState(INITIAL_TRUST);
    const [day, setDay] = useState(1);
    const [processed, setProcessed] = useState(0);
    const [correctCount, setCorrectCount] = useState(0);
    const [wrongCount, setWrongCount] = useState(0);
    const [skippedCount, setSkippedCount] = useState(0);
    const [gameOverReason, setGameOverReason] = useState(null);

    const handleDecision = useCallback((playerChoice, ministryVerdict) => {
        const delta = calculateTrustDelta(playerChoice, ministryVerdict);
        const newTrust = clampTrust(trust + delta);

        setTrust(newTrust);

        if (playerChoice === 'SKIP') {
            setSkippedCount(prev => prev + 1);
        } else if (playerChoice === ministryVerdict) {
            setCorrectCount(prev => prev + 1);
            setProcessed(prev => prev + 1);
        } else {
            setWrongCount(prev => prev + 1);
            setProcessed(prev => prev + 1);
        }

        if (newTrust <= 0) {
            setGameOverReason('trust');
            setScreen('gameover');
        }
    }, [trust]);

    const handleEndOfDay = useCallback(() => {
        if (processed < DAILY_QUOTA) {
            const newTrust = clampTrust(trust - 30);
            setTrust(newTrust);
            if (newTrust <= 0) {
                setGameOverReason('trust');
                setScreen('gameover');
                return;
            }
        }
        setScreen('report');
    }, [processed, trust]);

    const resetDay = useCallback(() => {
        setProcessed(0);
        setCorrectCount(0);
        setWrongCount(0);
        setSkippedCount(0);
    }, []);

    const quotaMet = processed >= DAILY_QUOTA;

    return {
        screen, setScreen,
        agentName, setAgentName,
        trust, setTrust,
        day, setDay,
        processed,
        correctCount,
        wrongCount,
        skippedCount,
        gameOverReason,
        handleDecision,
        handleEndOfDay,
        resetDay,
        quotaMet,
        DAILY_QUOTA,
    };
}
