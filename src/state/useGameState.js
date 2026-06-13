import { useState, useCallback } from 'react';
import { INITIAL_TRUST, calculateTrustDelta, clampTrust } from '../utils/trustCalculator';

const DAILY_QUOTA = 8;
const FINAL_PRESENTATION_DAY = 3;

/**
 * Core game state hook.
 * Manages trust, quota progress, day number, and screen transitions.
 */
export function useGameState() {
    const [screen, setScreen] = useState('splash');        // current screen id
    const [agentName, setAgentName] = useState('');
    const [agentEmail, setAgentEmail] = useState('');
    const [agentId, setAgentId] = useState('');
    const [trust, setTrust] = useState(INITIAL_TRUST);
    const [day, setDay] = useState(1);
    const [processed, setProcessed] = useState(0);
    const [correctCount, setCorrectCount] = useState(0);
    const [wrongCount, setWrongCount] = useState(0);
    const [skipCount, setSkipCount] = useState(0);
    const [gameOverReason, setGameOverReason] = useState(null);
    const [currency, setCurrency] = useState(0);
    const [upgrades, setUpgrades] = useState({
        fan: 0,
        generator: 0,
        cables: 0,
        terminal: 0
    });

    const handleDecision = useCallback((playerChoice, ministryVerdict) => {
        const delta = calculateTrustDelta(playerChoice, ministryVerdict);
        const newTrust = clampTrust(trust + delta);

        setTrust(newTrust);

        if (playerChoice === 'SKIP') {
            setSkipCount(prev => prev + 1);
            setProcessed(prev => prev + 1);
        } else if (playerChoice === ministryVerdict) {
            setCorrectCount(prev => prev + 1);
            setProcessed(prev => prev + 1);
            setCurrency(prev => prev + 10); // 10 credits for correct work
        } else {
            setWrongCount(prev => prev + 1);
            setProcessed(prev => prev + 1);
            setCurrency(prev => Math.max(0, prev - 5)); // Penalty for mistakes
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
        setSkipCount(0);
    }, []);

    const quotaMet = processed >= DAILY_QUOTA;

    return {
        screen, setScreen,
        agentName, setAgentName,
        agentEmail, setAgentEmail,
        agentId, setAgentId,
        trust, setTrust,
        day, setDay,
        processed,
        correctCount,
        wrongCount,
        skipCount,
        gameOverReason,
        currency, setCurrency,
        upgrades, setUpgrades,
        handleDecision,
        handleEndOfDay,
        resetDay,
        quotaMet,
        DAILY_QUOTA,
        FINAL_PRESENTATION_DAY,
    };
}
