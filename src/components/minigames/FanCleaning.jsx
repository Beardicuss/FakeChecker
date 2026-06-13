import { useState, useCallback, useRef, useEffect } from 'react';
import fanDusty from '../../assets/minigames/fan/fan-dusty.webp';
import fanClean from '../../assets/minigames/fan/fan-clean.webp';
import clothImg from '../../assets/minigames/fan/cloth.webp';
import computerBg from '../../assets/minigames/fan/computer.webp';
import './Minigames.css';

const TIME_LIMIT = 5; // seconds

/**
 * Fan Cleaning minigame — swipe dust off the fan by moving the mouse rapidly.
 */
export default function FanCleaning({ onComplete, onPenalty }) {
    const [dust, setDust] = useState(100); // 100% dusty → 0% clean
    const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
    const [done, setDone] = useState(false);
    const [failed, setFailed] = useState(false);
    const lastMousePos = useRef({ x: 0, y: 0 });
    const clothRef = useRef(null);

    // Countdown timer
    useEffect(() => {
        if (done) return;
        const interval = setInterval(() => {
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
        return () => clearInterval(interval);
    }, [done, onComplete, onPenalty]);

    // Check if clean enough
    useEffect(() => {
        if (dust <= 5 && !done) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setDone(true);
            setTimeout(() => onComplete(), 2000);
        }
    }, [dust, done, onComplete]);

    const handleMouseMove = useCallback((e) => {
        if (done) return;

        if (clothRef.current) {
            clothRef.current.style.left = `${e.clientX}px`;
            clothRef.current.style.top = `${e.clientY}px`;
        }

        if (lastMousePos.current.x === 0 && lastMousePos.current.y === 0) {
            lastMousePos.current = { x: e.clientX, y: e.clientY };
            return;
        }

        const dx = Math.abs(e.clientX - lastMousePos.current.x);
        const dy = Math.abs(e.clientY - lastMousePos.current.y);
        const movement = dx + dy;
        lastMousePos.current = { x: e.clientX, y: e.clientY };

        if (movement > 5) {
            setDust(prev => Math.max(0, prev - movement * 0.02));
        }
    }, [done]);

    const cleanPercent = 100 - dust;

    return (
        <div className="minigame-overlay" onMouseMove={handleMouseMove} style={{ cursor: 'none' }}>
            <div className="minigame-overlay__title">⚠ SYSTEM OVERHEATING</div>
            <div className="minigame-overlay__subtitle">Move mouse rapidly to clean the fan!</div>

            {!done && (
                <img
                    ref={clothRef}
                    src={clothImg}
                    alt="Cleaning Cloth"
                    className="fan-cleaning__custom-cursor"
                />
            )}

            <div className="minigame-overlay__arena cables__arena">
                <img src={computerBg} alt="Computer Case" className="cables__box-bg" />

                <div className="fan-cleaning__board">
                    <div className={`fan-cleaning__sprite ${done && !failed ? 'fan-spinning' : ''}`}>
                        <img src={dust > 20 ? fanDusty : fanClean} alt="Fan" />
                        <div
                            className="fan-cleaning__dust-layer"
                            style={{ opacity: dust / 100 }}
                        />
                    </div>
                </div>
            </div>

            <div className="minigame-overlay__progress-bar">
                <div
                    className={`minigame-overlay__progress-fill ${cleanPercent > 80 ? 'minigame-overlay__progress-fill--success' : ''}`}
                    style={{ width: `${cleanPercent}%` }}
                />
            </div>

            <div className="minigame-overlay__timer">
                {failed
                    ? <span className="minigame-overlay__result" style={{ color: '#ff4444' }}>[ PENALTY -15s ]</span>
                    : done
                        ? <span className="minigame-overlay__result">[ VENTILATION RESTORED ]</span>
                        : `TIME: ${timeLeft}s`
                }
            </div>
        </div>
    );
}
