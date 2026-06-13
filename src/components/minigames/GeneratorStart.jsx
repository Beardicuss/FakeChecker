import { useState, useCallback, useEffect, useRef } from 'react';
import generatorImg from '../../assets/minigames/generator/generator.webp';
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

    // Debugging panel states
    const [debug, setDebug] = useState(false);
    const [generatorSize, setGeneratorSize] = useState(341);
    const [glowConfig, setGlowConfig] = useState({ top: 224, left: 197, width: 25, height: 25 });
    const [plugTarget, setPlugTarget] = useState({ left: 64, top: 113, width: 80, height: 80 });

    // Drag state
    const [crankConnected, setCrankConnected] = useState(false);
    const [crankPos, setCrankPos] = useState({ left: -60, top: 160 }); // Starting position loosely outside
    const [isDragging, setIsDragging] = useState(false);
    const dragRef = useRef({ startX: 0, startY: 0, startLeft: 0, startTop: 0 });

    // Handle debug toggle via keyboard
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'q' && e.ctrlKey) setDebug(prev => !prev);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Handle pointer drag globally
    useEffect(() => {
        if (!isDragging) return;

        const handlePointerMove = (e) => {
            const dx = e.clientX - dragRef.current.startX;
            const dy = e.clientY - dragRef.current.startY;
            const newLeft = dragRef.current.startLeft + dx;
            const newTop = dragRef.current.startTop + dy;

            setCrankPos({ left: newLeft, top: newTop });

            // Check snap collision during drag
            const crankCenterX = newLeft + 60; // 120px default width / 2
            const crankCenterY = newTop + 8; // 16px default height / 2

            const insideX = crankCenterX >= plugTarget.left && crankCenterX <= (plugTarget.left + plugTarget.width);
            const insideY = crankCenterY >= plugTarget.top && crankCenterY <= (plugTarget.top + plugTarget.height);

            if (insideX && insideY) {
                setIsDragging(false);
                setCrankConnected(true);
                // Snap the PIVOT JOINT to the center of the pocket perfectly!
                setCrankPos({
                    left: plugTarget.left + (plugTarget.width / 2),
                    top: plugTarget.top + (plugTarget.height / 2)
                });
            }
        };

        const handlePointerUp = () => {
            if (isDragging) {
                setIsDragging(false);
                // Return to start if released outside socket
                setCrankPos({ left: -60, top: 160 });
            }
        };

        window.addEventListener('pointermove', handlePointerMove);
        window.addEventListener('pointerup', handlePointerUp);
        return () => {
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('pointerup', handlePointerUp);
        };
    }, [isDragging, crankPos, plugTarget]);

    // Power drains slowly if you stop scrolling
    useEffect(() => {
        if (done || failed) return;
        const drain = setInterval(() => {
            if (crankConnected) {
                setPower(prev => Math.max(0, prev - 0.5));
            }
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
    }, [done, failed, crankConnected, onComplete, onPenalty]);

    // Check win condition
    useEffect(() => {
        if (power >= 100 && !done) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setDone(true);
            setTimeout(() => onComplete(), 1500);
        }
    }, [power, done, onComplete]);

    const handleWheel = useCallback((e) => {
        if (done || failed || !crankConnected) return; // Must plug crank first!
        e.preventDefault();
        const increment = 100 / TARGET_SCROLLS;
        setPower(prev => Math.min(100, prev + increment));
        setRotation(prev => prev + 25);
    }, [done, failed, crankConnected]);

    const handleCrankPointerDown = (e) => {
        if (crankConnected || done || failed) return;
        e.preventDefault();
        dragRef.current = {
            startX: e.clientX,
            startY: e.clientY,
            startLeft: crankPos.left,
            startTop: crankPos.top
        };
        setIsDragging(true);
    };

    return (
        <div className="minigame-overlay" onWheel={handleWheel}>
            {debug && (
                <div style={{ position: 'absolute', top: 10, left: 10, background: 'rgba(0,0,0,0.8)', padding: 10, zIndex: 9999, color: '#0f0', display: 'flex', flexDirection: 'column', gap: 5 }}>
                    <h3>Generator Debug (Ctrl+Q)</h3>
                    <h4>Generator Engine Base</h4>
                    Size: <input type="range" min="100" max="800" value={generatorSize} onChange={e => setGeneratorSize(Number(e.target.value))} /> {generatorSize}px<br />
                    <h4>CSS Light Glow Effect</h4>
                    Top: <input type="range" min="-200" max="500" value={glowConfig.top} onChange={e => setGlowConfig({ ...glowConfig, top: Number(e.target.value) })} /> {glowConfig.top}px<br />
                    Left: <input type="range" min="-200" max="500" value={glowConfig.left} onChange={e => setGlowConfig({ ...glowConfig, left: Number(e.target.value) })} /> {glowConfig.left}px<br />
                    Size: <input type="range" min="5" max="200" value={glowConfig.width} onChange={e => setGlowConfig({ ...glowConfig, width: Number(e.target.value), height: Number(e.target.value) })} /> {glowConfig.width}px<br />
                    <h4>Plug Socket Target Constraint</h4>
                    Target Top: <input type="range" min="-100" max="500" value={plugTarget.top} onChange={e => setPlugTarget({ ...plugTarget, top: Number(e.target.value) })} /> {plugTarget.top}px<br />
                    Target Left: <input type="range" min="-100" max="500" value={plugTarget.left} onChange={e => setPlugTarget({ ...plugTarget, left: Number(e.target.value) })} /> {plugTarget.left}px<br />
                    Target Width: <input type="range" min="10" max="500" value={plugTarget.width} onChange={e => setPlugTarget({ ...plugTarget, width: Number(e.target.value) })} /> {plugTarget.width}px<br />
                    Target Height: <input type="range" min="10" max="500" value={plugTarget.height} onChange={e => setPlugTarget({ ...plugTarget, height: Number(e.target.value) })} /> {plugTarget.height}px<br />
                    <button style={{ color: '#000', background: '#0f0', marginTop: 10, cursor: 'pointer' }} onClick={() => {
                        setCrankConnected(false);
                        setCrankPos({ left: -60, top: 160 });
                        setRotation(0);
                    }}>Reset Crank Attachment</button>
                    <button style={{ color: '#fff', background: '#00f', marginTop: 5, cursor: 'pointer', border: 'none', padding: '4px' }} onClick={() => {
                        const str = JSON.stringify({ generatorSize, glowConfig, plugTarget }, null, 2);
                        navigator.clipboard.writeText(str);
                        alert('Copied configuration to clipboard!');
                    }}>
                        [ COPY ALL SETTINGS TO CLIPBOARD ]
                    </button>
                </div>
            )}
            <div className="minigame-overlay__title">⚡ POWER FAILURE</div>
            <div className="minigame-overlay__subtitle">
                {!crankConnected ? "Drag & Plug the crank key into the generator socket!" : "Scroll mouse wheel sequentially to crank the engine!"}
            </div>

            <div className="minigame-overlay__arena">
                <div style={{ position: 'relative', width: `${generatorSize}px`, height: `${generatorSize}px` }}>
                    {/* Main Base Generator */}
                    <img
                        src={generatorImg}
                        alt="Generator"
                        style={{ width: '100%', height: '100%', objectFit: 'contain', position: 'absolute', top: 0, left: 0 }}
                    />

                    {/* Artificial CSS Glow Layer for Native Light */}
                    <div
                        style={{
                            position: 'absolute',
                            top: glowConfig.top,
                            left: glowConfig.left,
                            width: glowConfig.width,
                            height: glowConfig.height,
                            borderRadius: '50%',
                            background: 'radial-gradient(circle, rgba(255,255,100,1) 0%, rgba(255,200,0,0.8) 40%, rgba(255,150,0,0) 70%)',
                            mixBlendMode: 'screen',
                            filter: 'blur(4px)',
                            boxShadow: `0 0 ${glowConfig.width * 1.5}px ${glowConfig.width * 0.5}px rgba(255, 200, 0, 0.4)`,
                            opacity: power / 100,
                            pointerEvents: 'none'
                        }}
                    />

                    {/* Debug Socket Visualizer */}
                    {debug && (
                        <div style={{
                            position: 'absolute',
                            top: plugTarget.top,
                            left: plugTarget.left,
                            width: plugTarget.width,
                            height: plugTarget.height,
                            border: '2px dashed #0f0',
                            backgroundColor: 'rgba(0, 255, 0, 0.2)',
                            pointerEvents: 'none'
                        }} />
                    )}

                    {/* Crank Component. Rotates visually when connected. */}
                    {!done && (
                        <div
                            onPointerDown={handleCrankPointerDown}
                            style={{
                                position: 'absolute',
                                top: crankPos.top,
                                left: crankPos.left,
                                transform: crankConnected ? `rotate(${rotation}deg)` : 'rotate(0deg)',
                                transformOrigin: `0% 0%`,
                                width: '120px',
                                height: '16px',
                                cursor: crankConnected ? 'default' : (isDragging ? 'grabbing' : 'grab'),
                                zIndex: 10,
                                userSelect: 'none',
                                touchAction: 'none'
                            }}
                        >
                            {/* CSS Engineered Crank */}
                            <div style={{ position: 'relative', width: '100%', height: '100%', pointerEvents: 'none' }}>
                                {/* Socket Pivot Base (At EXACT mathematical origin 0,0) */}
                                <div style={{
                                    position: 'absolute', top: 0, left: 0,
                                    width: '32px', height: '32px',
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #786e56, #3a3324)',
                                    border: '2px solid #211c13',
                                    boxShadow: 'inset 0 0 5px #000, 0 5px 15px rgba(0,0,0,0.9)',
                                    transform: 'translate(-50%, -50%)',
                                    zIndex: 2
                                }} />
                                {/* Internal Pipe Joint Highlight */}
                                <div style={{
                                    position: 'absolute', top: 0, left: 0,
                                    width: '12px', height: '12px',
                                    borderRadius: '50%',
                                    background: '#1d1a12',
                                    transform: 'translate(-50%, -50%)',
                                    zIndex: 3
                                }} />

                                {/* Extended Crank Arm */}
                                <div style={{
                                    position: 'absolute',
                                    top: 0, left: 0,
                                    width: '120px', height: '18px',
                                    background: 'linear-gradient(to bottom, #6a624d, #423b2d)',
                                    border: '2px solid #211c13',
                                    borderLeft: 'none',
                                    transformOrigin: '0% 50%',
                                    transform: 'translateY(-50%)',
                                    boxShadow: '0 8px 12px rgba(0,0,0,0.8)',
                                    zIndex: 1
                                }} />

                                {/* Vertical Grip Handle */}
                                <div style={{
                                    position: 'absolute',
                                    top: 0, left: '120px',
                                    width: '24px', height: '50px',
                                    background: 'linear-gradient(to right, #40382b, #1f1b13)',
                                    border: '2px solid #14110b',
                                    borderRadius: '6px',
                                    transform: 'translate(-50%, -20%)',
                                    boxShadow: 'inset 0 0 5px #40382b, 5px 5px 15px rgba(0,0,0,1)',
                                    zIndex: 2
                                }} />
                            </div>
                        </div>
                    )}
                </div>
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
