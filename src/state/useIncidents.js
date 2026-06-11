import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Hook to manage stochastic incident spawning.
 * New flow: warning light glows for 8s (steady 4s, then blinks 4s).
 * Player must click the light to open the minigame.
 * If they don't click in time, -15s penalty and incident clears.
 *
 * @param {boolean} isShiftActive - Only spawn incidents when the player is actively working.
 * @param {Object} upgrades - Upgrades object from useGameState.
 * @param {Function} onPenalty - Callback to deduct time when incident is ignored.
 */
export function useIncidents(isShiftActive, upgrades, onPenalty) {
    const [warningIncident, setWarningIncident] = useState(null);
    const [activeIncident, setActiveIncident] = useState(null);
    const [warningElapsed, setWarningElapsed] = useState(0); // seconds since warning started
    const warningTickRef = useRef(null);

    // Clear everything
    const resolveIncident = useCallback(() => {
        setActiveIncident(null);
        setWarningIncident(null);
        setWarningElapsed(0);
    }, []);

    // Player clicks the lit lamp — opens the minigame
    const openIncident = useCallback(() => {
        if (!warningIncident) return;
        setActiveIncident(warningIncident);
        setWarningIncident(null);
        setWarningElapsed(0);
    }, [warningIncident]);

    const triggerIncident = useCallback((type) => {
        if (upgrades[type] >= 2) return;
        setWarningIncident(type);
        setWarningElapsed(0);
    }, [upgrades]);

    // Warning countdown: 8 seconds to click, then auto-penalty
    useEffect(() => {
        if (!warningIncident || activeIncident) {
            // No warning active or minigame already open
            if (warningTickRef.current) {
                clearInterval(warningTickRef.current);
                warningTickRef.current = null;
            }
            return;
        }

        warningTickRef.current = setInterval(() => {
            setWarningElapsed(prev => {
                const next = prev + 1;
                if (next >= 8) {
                    // Time expired — penalty and clear
                    onPenalty?.(15);
                    setWarningIncident(null);
                    setWarningElapsed(0);
                    return 0;
                }
                return next;
            });
        }, 1000);

        return () => {
            if (warningTickRef.current) {
                clearInterval(warningTickRef.current);
                warningTickRef.current = null;
            }
        };
    }, [warningIncident, activeIncident, onPenalty]);

    // Spawner Logic
    useEffect(() => {
        if (!isShiftActive || activeIncident || warningIncident) return;

        const spawnTimer = setTimeout(() => {
            const types = ['fan', 'generator', 'cables', 'terminal'];
            types.sort(() => Math.random() - 0.5);

            for (const type of types) {
                if (upgrades[type] >= 2) continue;
                setWarningIncident(type);
                setWarningElapsed(0);
                break;
            }
        }, 25000); // Trigger exactly every 25 seconds of peace

        return () => clearTimeout(spawnTimer);
    }, [isShiftActive, activeIncident, warningIncident, upgrades]);

    return {
        warningIncident,
        activeIncident,
        warningElapsed, // 0-7; >=4 means blinking
        resolveIncident,
        openIncident,
        triggerIncident
    };
}
