import React, { useState, useEffect } from 'react';
import './GameOver.css';

/**
 * Game Over screen — trust depletion termination.
 */
export default function GameOver({ reason, onRestart }) {
    const [phase, setPhase] = useState(0);

    useEffect(() => {
        const t1 = setTimeout(() => setPhase(1), 2000);
        const t2 = setTimeout(() => setPhase(2), 4000);
        return () => { clearTimeout(t1); clearTimeout(t2); };
    }, []);

    return (
        <div className={`game-over game-over--phase-${phase}`} id="game-over">
            {phase === 0 && (
                <div className="game-over__warning">
                    <p className="game-over__alert">⚠ CRITICAL: TRUST LEVEL ZERO</p>
                    <p className="game-over__sub">ACCESS REVOKED</p>
                </div>
            )}
            {phase >= 1 && (
                <div className="game-over__blackout" />
            )}
            {phase === 2 && (
                <div className="game-over__final">
                    <p className="game-over__text">Agent dismissed. Dossier deleted.</p>
                    <p className="game-over__text-sub">Your position has been reassigned.</p>
                    <div className="game-over__actions">
                        <button className="game-over__btn" onClick={onRestart} id="btn-restart">
                            [ START OVER ]
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
