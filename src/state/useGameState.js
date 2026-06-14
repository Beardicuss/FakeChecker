import { useState, useCallback } from 'react';
import { DEFAULT_PROFILE_AVATAR_ID } from '../data/profileAvatars';
import { loadAgentIdentity } from '../utils/agentIdentity';
import { INITIAL_TRUST, calculateTrustDelta, clampTrust } from '../utils/trustCalculator';

const DAILY_QUOTA = 8;
const FINAL_PRESENTATION_DAY = 3;
// Future full-game update:
// const FINAL_PRESENTATION_DAY = 6;
const CORRECT_CREDIT_REWARD = 10;
const WRONG_CREDIT_PENALTY = 2;
const DAILY_CREDIT_CAPS = {
    1: 30,
    2: 80,
    3: 80,
    // Future full-game update:
    // 4: 80,
    // 5: 80,
    // 6: 90,
};

/**
 * Core game state hook.
 * Manages trust, quota progress, day number, and screen transitions.
 */
export function useGameState() {
    const savedIdentity = loadAgentIdentity();
    const [screen, setScreen] = useState('splash');        // current screen id
    const [agentName, setAgentName] = useState(savedIdentity?.name || '');
    const [agentEmail, setAgentEmail] = useState('');
    const [agentId, setAgentId] = useState(savedIdentity?.id || '');
    const [agentAvatarId, setAgentAvatarId] = useState(savedIdentity?.avatarId || DEFAULT_PROFILE_AVATAR_ID);
    const [trust, setTrust] = useState(INITIAL_TRUST);
    const [day, setDay] = useState(1);
    const [processed, setProcessed] = useState(0);
    const [correctCount, setCorrectCount] = useState(0);
    const [wrongCount, setWrongCount] = useState(0);
    const [skipCount, setSkipCount] = useState(0);
    const [totalProcessed, setTotalProcessed] = useState(0);
    const [totalCorrectCount, setTotalCorrectCount] = useState(0);
    const [totalWrongCount, setTotalWrongCount] = useState(0);
    const [totalSkipCount, setTotalSkipCount] = useState(0);
    const [dailyCreditsEarned, setDailyCreditsEarned] = useState(0);
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
            setTotalSkipCount(prev => prev + 1);
            setTotalProcessed(prev => prev + 1);
        } else if (playerChoice === ministryVerdict) {
            setCorrectCount(prev => prev + 1);
            setProcessed(prev => prev + 1);
            setTotalCorrectCount(prev => prev + 1);
            setTotalProcessed(prev => prev + 1);
            const dailyCap = DAILY_CREDIT_CAPS[day] ?? DAILY_CREDIT_CAPS[FINAL_PRESENTATION_DAY];
            const remainingDailyCredits = Math.max(0, dailyCap - dailyCreditsEarned);
            const reward = Math.min(CORRECT_CREDIT_REWARD, remainingDailyCredits);
            if (reward > 0) {
                setCurrency(prev => prev + reward);
                setDailyCreditsEarned(prev => prev + reward);
            }
        } else {
            setWrongCount(prev => prev + 1);
            setProcessed(prev => prev + 1);
            setTotalWrongCount(prev => prev + 1);
            setTotalProcessed(prev => prev + 1);
            setCurrency(prev => Math.max(0, prev - WRONG_CREDIT_PENALTY));
        }

        if (newTrust <= 0) {
            setGameOverReason('trust');
            setScreen('gameover');
        }
    }, [dailyCreditsEarned, day, trust]);

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
        setDailyCreditsEarned(0);
    }, []);

    const resetRun = useCallback(() => {
        resetDay();
        setTotalProcessed(0);
        setTotalCorrectCount(0);
        setTotalWrongCount(0);
        setTotalSkipCount(0);
    }, [resetDay]);

    const quotaMet = processed >= DAILY_QUOTA;

    return {
        screen, setScreen,
        agentName, setAgentName,
        agentEmail, setAgentEmail,
        agentId, setAgentId,
        agentAvatarId, setAgentAvatarId,
        trust, setTrust,
        day, setDay,
        processed,
        correctCount,
        wrongCount,
        skipCount,
        totalProcessed,
        totalCorrectCount,
        totalWrongCount,
        totalSkipCount,
        gameOverReason,
        currency, setCurrency,
        upgrades, setUpgrades,
        handleDecision,
        handleEndOfDay,
        resetDay,
        resetRun,
        quotaMet,
        DAILY_QUOTA,
        FINAL_PRESENTATION_DAY,
    };
}
