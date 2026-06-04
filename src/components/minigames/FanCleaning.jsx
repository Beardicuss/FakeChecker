import React, { useState, useCallback, useRef, useEffect } from 'react';
import fanDusty from '../../assets/minigames/fan/fan-dusty.png';
import fanClean from '../../assets/minigames/fan/fan-clean.png';
import clothImg from '../../assets/minigames/fan/cloth.png';
import './Minigames.css';

const TIME_LIMIT = 8; // seconds

/**
 * Fan Cleaning minigame — swipe dust off the fan by moving the mouse rapidly.
 */
export default function FanCleaning({ onComplete }) {
    const [dust, setDust] = useState(100); // 100% dusty → 0% clean
    const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
    const [done, setDone] = useState(false);
    const lastMousePos = useRef({ x: 0, y: 0 });

    // Countdown timer
    useEffect(() => {
        if (done) return;
        const interval = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    setDone(true);
                    setTimeout(() => onComplete(), 1500);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [done, onComplete]);

    // Check if clean enough
    useEffect(() => {
        if (dust <= 5 && !done) {
            setDone(true);
            setTimeout(() => onComplete(), 1200);
        }
    }, [dust, done, onComplete]);

    const handleMouseMove = useCallback((e) => {
        if (done) return;
        const dx = Math.abs(e.clientX - lastMousePos.current.x);
        const dy = Math.abs(e.clientY - lastMousePos.current.y);
        const movement = dx + dy;
        lastMousePos.current = { x: e.clientX, y: e.clientY };

        if (movement > 5) {
            setDust(prev => Math.max(0, prev - movement * 0.15));
        }
    }, [done]);

    const cleanPercent = 100 - dust;

    return (
        <div className="minigame-overlay" onMouseMove={handleMouseMove}>
            <div className="minigame-overlay__title">⚠ SYSTEM OVERHEATING</div>
            <div className="minigame-overlay__subtitle">Move mouse rapidly to clean the fan!</div>

            <div className="minigame-overlay__arena">
                <div className="fan-cleaning__sprite">
                    <img src={dust > 20 ? fanDusty : fanClean} alt="Fan" />
                    <div
                        className="fan-cleaning__dust-layer"
                        style={{ opacity: dust / 100 }}
                    />
                </div>
            </div>

            <div className="minigame-overlay__progress-bar">
                <div
                    className={`minigame-overlay__progress-fill ${cleanPercent > 80 ? 'minigame-overlay__progress-fill--success' : ''}`}
                    style={{ width: `${cleanPercent}%` }}
                />
            </div>

            <div className="minigame-overlay__timer">
                {done
                    ? <span className="minigame-overlay__result">[ VENTILATION RESTORED ]</span>
                    : `TIME: ${timeLeft}s`
                }
            </div>
        </div>
    );
}
