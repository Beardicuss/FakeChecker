import React, { useState, useCallback, useEffect } from 'react';
import generatorImg from '../../assets/minigames/generator/generator.png';
import crankKeyImg from '../../assets/minigames/generator/crank-key.png';
import bulbLitImg from '../../assets/minigames/generator/bulb-lit.png';
import './Minigames.css';

const TARGET_SCROLLS = 30;

/**
 * Generator Start minigame — scroll the mouse wheel rapidly to crank the engine.
 */
export default function GeneratorStart({ onComplete }) {
    const [power, setPower] = useState(0); // 0 → 100
    const [done, setDone] = useState(false);
    const [rotation, setRotation] = useState(0);

    // Power drains slowly if you stop scrolling
    useEffect(() => {
        if (done) return;
        const drain = setInterval(() => {
            setPower(prev => Math.max(0, prev - 0.5));
        }, 100);
        return () => clearInterval(drain);
    }, [done]);

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

            <div className="minigame-overlay__timer">
                {done
                    ? <span className="minigame-overlay__result">[ POWER RESTORED ]</span>
                    : `CHARGE: ${Math.round(power)}%`
                }
            </div>
        </div>
    );
}
