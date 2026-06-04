import React, { useState, useCallback, useEffect } from 'react';
import generatorImg from '../../assets/minigames/generator/generator.png';
import crankKeyImg from '../../assets/minigames/generator/crank-key.png';
import bulbLitImg from '../../assets/minigames/generator/bulb-lit.png';
import './Minigames.css';

const TARGET_SCROLLS = 30;

/**
 * Generator Start minigame — scroll the mouse wheel rapidly to crank the engine.
 */
export default function GeneratorStart({ onComplete, onPenalty }) {
    const [power, setPower] = useState(0); // 0 → 100
    const [done, setDone] = useState(false);
    const [failed, setFailed] = useState(false);
    const [rotation, setRotation] = useState(0);
    const [timeLeft, setTimeLeft] = useState(5);

    // Power drains slowly if you stop scrolling
    useEffect(() => {
        if (done) return;
        const drain = setInterval(() => {
            setPower(prev => Math.max(0, prev - 0.5));
        }, 100);

        const tick = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    setDone(true);
                    setFailed(true);
                    onPenalty?.(15);
                    setTimeout(() => onComplete(), 1000);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            clearInterval(drain);
            clearInterval(tick);
        };
    }, [done, onComplete, onPenalty]);

    // Check win condition
    useEffect(() => {
        if (power >= 100 && !done) {
            setDone(true);
            setTimeout(() => onComplete(), 1500);
        }
    }, [power, done, onComplete]);

    const handleWheel = useCallback((e) => {
        if (done) return;
        e.preventDefault();
        const increment = 100 / TARGET_SCROLLS;
        setPower(prev => Math.min(100, prev + increment));
        setRotation(prev => prev + 25);
    }, [done]);

    return (
        <div className="minigame-overlay" onWheel={handleWheel}>
            <div className="minigame-overlay__title">⚡ POWER FAILURE</div>
            <div className="minigame-overlay__subtitle">Scroll mouse wheel to crank the generator!</div>

            <div className="minigame-overlay__arena">
                {done ? (
                    <img src={bulbLitImg} alt="Power Restored" style={{ width: 200, height: 200, objectFit: 'contain' }} />
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                        <img src={generatorImg} alt="Generator" style={{ width: 220, height: 220, objectFit: 'contain' }} />
                        <div className="generator__crank" style={{ transform: `rotate(${rotation}deg)` }}>
                            <img src={crankKeyImg} alt="Crank Key" />
                        </div>
                    </div>
                )}
            </div>

            <div className="minigame-overlay__progress-bar">
                <div
                    className={`minigame-overlay__progress-fill ${power >= 100 ? 'minigame-overlay__progress-fill--success' : ''}`}
                    style={{ width: `${power}%` }}
                />
            </div>

            <div className="minigame-overlay__timer" style={{ display: 'flex', gap: '32px' }}>
                <span>
                    {failed ? <span className="minigame-overlay__result" style={{ color: '#ff4444' }}>[ PENALTY -15s ]</span>
                        : done ? <span className="minigame-overlay__result">[ POWER RESTORED ]</span>
                            : `CHARGE: ${Math.round(power)}%`
                    }
                </span>
                {!done && !failed && (
                    <span style={{ color: timeLeft <= 2 ? '#ff4444' : 'var(--text-primary)' }}>
                        TIME: 00:0{timeLeft}
                    </span>
                )}
            </div>
        </div>
    );
}
