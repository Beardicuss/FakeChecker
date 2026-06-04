import { useState, useEffect, useCallback } from 'react';

/**
 * Hook to manage stochastic incident spawning.
 * @param {boolean} isShiftActive - Only spawn incidents when the player is actively working.
 * @param {Object} upgrades - Upgrades object from useGameState.
 */
export function useIncidents(isShiftActive, upgrades) {
    const [warningIncident, setWarningIncident] = useState(null);
    const [activeIncident, setActiveIncident] = useState(null);

    const resolveIncident = useCallback(() => {
        setActiveIncident(null);
        setWarningIncident(null);
    }, []);

    const triggerIncident = useCallback((type) => {
        if (upgrades[type] >= 2) return;
        setWarningIncident(type);
    }, [upgrades]);

    // Warning -> Active Escalation (5 seconds)
    useEffect(() => {
        if (!warningIncident || activeIncident) return;

        const warningTimer = setTimeout(() => {
            setActiveIncident(warningIncident);
            setWarningIncident(null);
        }, 5000);

        return () => clearTimeout(warningTimer);
    }, [warningIncident, activeIncident]);

    // Spawner Logic
    useEffect(() => {
        if (!isShiftActive || activeIncident || warningIncident) return;

        const spawnCheckInterval = setInterval(() => {
            const types = ['fan', 'generator', 'cables', 'terminal'];
            types.sort(() => Math.random() - 0.5);

            for (const type of types) {
                if (upgrades[type] >= 2) continue;

                const baseProb = 0.005; // 0.5% chance per second (Approx 1 incident every ~50 seconds total)
                const actualProb = upgrades[type] === 1 ? baseProb * 0.2 : baseProb;

                if (Math.random() < actualProb) {
                    setWarningIncident(type);
                    break;
                }
            }
        }, 1000);

        return () => clearInterval(spawnCheckInterval);
    }, [isShiftActive, activeIncident, warningIncident, upgrades]);

    return {
        warningIncident,
        activeIncident,
        resolveIncident,
        triggerIncident
    };
}
