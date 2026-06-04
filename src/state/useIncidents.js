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

        const spawnTimer = setTimeout(() => {
            const types = ['fan', 'generator', 'cables', 'terminal'];
            types.sort(() => Math.random() - 0.5);

            for (const type of types) {
                if (upgrades[type] >= 2) continue;
                setWarningIncident(type);
                break;
            }
        }, 25000); // Trigger exactly every 25 seconds of peace

        return () => clearTimeout(spawnTimer);
    }, [isShiftActive, activeIncident, warningIncident, upgrades]);

    return {
        warningIncident,
        activeIncident,
        resolveIncident,
        triggerIncident
    };
}
