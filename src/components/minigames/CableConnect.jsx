/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/refs */
import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import cableBox from '../../assets/minigames/cables/box.webp';
import './Minigames.css';

const WIRE_DATA = [
    { id: 'red', label: 'RED', color: '#8C4123', lampColor: '#ff3322' },
    { id: 'yellow', label: 'YELLOW', color: '#A58228', lampColor: '#ffe033' },
    { id: 'green', label: 'GREEN', color: '#3E5A36', lampColor: '#44ff66' },
    { id: 'blue', label: 'BLUE', color: '#345569', lampColor: '#33aaff' },
    { id: 'purple', label: 'PURPLE', color: '#584155', lampColor: '#cc66ff' },
];

const METAL = '#8a8478';
const METAL_HI = '#b8b2a8';
const METAL_SH = '#4a4840';
const BRASS = '#a08830';

const SNAP_RADIUS = 48;

// ── DEFAULT POSITIONS — tweaked via debug panel  ──
/*
const DEFAULT_POS = {
    leftX: [21.2, 21.2, 21.2, 21.2, 21.2],
    leftY: [33.0, 43.1, 54.8, 64.4, 73.9],
    rightX: [21.5, 21.5, 21.5, 21.5, 21.5],
    rightY: [32.5, 43.2, 54.9, 64.5, 74.9],
    lampX: [17.1, 17.1, 17.1, 17.1, 17.1],
};
*/

function shuffleArray(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function cablePath(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const sag = Math.min(Math.max(dist * 0.25, 16), 80);
    const cx1 = x1 + dx * 0.3;
    const cy1 = y1 + sag;
    const cx2 = x2 - dx * 0.3;
    const cy2 = y2 + sag;
    return `M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`;
}

function PlugTip({ x, y, side }) {
    const dir = side === 'right' ? 1 : -1;
    return (
        <g>
            <rect x={x - (dir < 0 ? 5 : 0)} y={y - 8} width={5} height={16} fill={METAL} stroke={METAL_SH} strokeWidth="0.5" />
            <rect x={x + (dir > 0 ? 0 : -14)} y={y - 7} width={14} height={14} fill={METAL} stroke={METAL_SH} strokeWidth="0.5" />
            <rect x={x + (dir > 0 ? 0 : -14)} y={y - 7} width={14} height={3} fill={METAL_HI} opacity="0.6" />
            <rect x={x + (dir > 0 ? 14 : -22)} y={y - 3} width={8} height={6} fill={BRASS} stroke="#6a5818" strokeWidth="0.5" rx="1" />
            <rect x={x + (dir > 0 ? 21 : -23)} y={y - 2} width={2} height={4} fill="#5a4810" rx="1" />
        </g>
    );
}

function CableSvg({ wire, fromPos, toPos, isDragging, isMatched, cursorSvg }) {
    if (!fromPos) return null;

    let endX, endY;
    if (isMatched && toPos) {
        endX = toPos.x; endY = toPos.y;
    } else if (isDragging && cursorSvg) {
        endX = cursorSvg.x; endY = cursorSvg.y;
    } else {
        endX = fromPos.x + 36; endY = fromPos.y + 8;
    }

    const path = cablePath(fromPos.x, fromPos.y, endX, endY);

    return (
        <g opacity={isMatched ? 0.88 : 1}>
            <path d={path} fill="none" stroke={METAL_SH} strokeWidth="9" strokeLinecap="round" />
            <path d={path} fill="none" stroke={wire.color} strokeWidth="7" strokeLinecap="round" />
            <path d={path} fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="2.5" strokeLinecap="round" />
            <PlugTip x={fromPos.x} y={fromPos.y} side="right" />
            {(isMatched || isDragging) && <PlugTip x={endX} y={endY} side="left" />}
        </g>
    );
}

/* --- DEVELOPMENT DEBUG PANEL ---
// Uncomment this block and set DEBUG = true to calibrate the cables
const DEBUG = false; // set to false when you're done calibrating

const panelStyle = {
    position: 'fixed', top: 10, right: 10, zIndex: 9999,
    background: 'rgba(0,0,0,0.88)', border: '1px solid #444',
    borderRadius: 8, padding: '10px 14px', width: 300,
    fontFamily: 'monospace', fontSize: 11, color: '#ccc',
    maxHeight: '90vh', overflowY: 'auto',
};
const rowStyle = { display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 };
const labelStyle = { width: 110, flexShrink: 0, color: '#888' };
const valStyle = { width: 34, textAlign: 'right', color: '#fff' };

function Slider({ label, value, onChange, min = 0, max = 120, step = 0.5 }) {
    return (
        <div style={rowStyle}>
            <span style={labelStyle}>{label}</span>
            <input
                type="range" min={min} max={max} step={step}
                value={value}
                onChange={e => onChange(parseFloat(e.target.value))}
                style={{ flex: 1 }}
            />
            <span style={valStyle}>{value.toFixed(1)}</span>
        </div>
    );
}

function DebugPanel({ pos, setPos }) {
    const [copied, setCopied] = useState(false);

    const setArr = (key, i, val) => setPos(p => {
        const arr = [...p[key]];
        arr[i] = val;
        return { ...p, [key]: arr };
    });

    const css = `
.cables__column--left > div:nth-child(1) { left: ${pos.leftX[0].toFixed(1)}%; top: ${pos.leftY[0].toFixed(1)}%; }
.cables__column--left > div:nth-child(2) { left: ${pos.leftX[1].toFixed(1)}%; top: ${pos.leftY[1].toFixed(1)}%; }
.cables__column--left > div:nth-child(3) { left: ${pos.leftX[2].toFixed(1)}%; top: ${pos.leftY[2].toFixed(1)}%; }
.cables__column--left > div:nth-child(4) { left: ${pos.leftX[3].toFixed(1)}%; top: ${pos.leftY[3].toFixed(1)}%; }
.cables__column--left > div:nth-child(5) { left: ${pos.leftX[4].toFixed(1)}%; top: ${pos.leftY[4].toFixed(1)}%; }

.cables__column--right > div:nth-child(1) { right: ${pos.rightX[0].toFixed(1)}%; top: ${pos.rightY[0].toFixed(1)}%; }
.cables__column--right > div:nth-child(2) { right: ${pos.rightX[1].toFixed(1)}%; top: ${pos.rightY[1].toFixed(1)}%; }
.cables__column--right > div:nth-child(3) { right: ${pos.rightX[2].toFixed(1)}%; top: ${pos.rightY[2].toFixed(1)}%; }
.cables__column--right > div:nth-child(4) { right: ${pos.rightX[3].toFixed(1)}%; top: ${pos.rightY[3].toFixed(1)}%; }
.cables__column--right > div:nth-child(5) { right: ${pos.rightX[4].toFixed(1)}%; top: ${pos.rightY[4].toFixed(1)}%; }

.cables__lamps-column > div:nth-child(1) { right: ${pos.lampX[0].toFixed(1)}%; top: ${pos.rightY[0].toFixed(1)}%; }
.cables__lamps-column > div:nth-child(2) { right: ${pos.lampX[1].toFixed(1)}%; top: ${pos.rightY[1].toFixed(1)}%; }
.cables__lamps-column > div:nth-child(3) { right: ${pos.lampX[2].toFixed(1)}%; top: ${pos.rightY[2].toFixed(1)}%; }
.cables__lamps-column > div:nth-child(4) { right: ${pos.lampX[3].toFixed(1)}%; top: ${pos.rightY[3].toFixed(1)}%; }
.cables__lamps-column > div:nth-child(5) { right: ${pos.lampX[4].toFixed(1)}%; top: ${pos.rightY[4].toFixed(1)}%; }`;

    const copy = () => {
        navigator.clipboard.writeText(css);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    return (
        <div style={panelStyle}>
            <div style={{ color: '#ff6644', fontWeight: 'bold', marginBottom: 8 }}>⚙ CABLE CALIBRATOR</div>

            <div style={{ color: '#ff9944', marginBottom: 4 }}>— LEFT COLUMN —</div>
            {[0, 1, 2, 3, 4].map(i => (
                <div key={\`l\${i}\`}>
                    <Slider label={\`L\${i + 1} X\`} value={pos.leftX[i]} onChange={v => setArr('leftX', i, v)} />
                    <Slider label={\`L\${i + 1} Y\`} value={pos.leftY[i]} onChange={v => setArr('leftY', i, v)} />
                </div>
            ))}

            <div style={{ color: '#44aaff', margin: '8px 0 4px' }}>— RIGHT COLUMN —</div>
            {[0, 1, 2, 3, 4].map(i => (
                <div key={\`r\${i}\`}>
                    <Slider label={\`R\${i + 1} X\`} value={pos.rightX[i]} onChange={v => setArr('rightX', i, v)} />
                    <Slider label={\`R\${i + 1} Y\`} value={pos.rightY[i]} onChange={v => setArr('rightY', i, v)} />
                </div>
            ))}

            <div style={{ color: '#ff44ff', margin: '8px 0 4px' }}>— RIGHT LAMPS —</div>
            {[0, 1, 2, 3, 4].map(i => (
                <Slider key={\`rlmp\${i}\`} label={\`RLamp \${i + 1} X\`} value={pos.lampX[i]} onChange={v => setArr('lampX', i, v)} />
            ))}

            <div style={{ marginTop: 10, borderTop: '1px solid #333', paddingTop: 8 }}>
                <button
                    onClick={copy}
                    style={{
                        width: '100%', padding: '6px 0', background: copied ? '#1a4a1a' : '#1a1a2a',
                        border: '1px solid #444', borderRadius: 4, color: copied ? '#44ff44' : '#ccc',
                        cursor: 'pointer', fontFamily: 'monospace', fontSize: 11,
                    }}
                >
                    {copied ? '✓ COPIED!' : '⧉ COPY CSS'}
                </button>
                <div style={{ marginTop: 6, color: '#555', fontSize: 10 }}>
                    Paste into Minigames.css, then set DEBUG=false
                </div>
            </div>
        </div>
    );
}
*/

// ── Main component ─────────────────────────────────────────────────────────
export default function CableConnect({ onComplete, onPenalty }) {
    const [matched, setMatched] = useState(new Set());
    const [dragging, setDragging] = useState(null);
    const [snapTarget, setSnapTarget] = useState(null);
    const [done, setDone] = useState(false);
    const [failed, setFailed] = useState(false);
    const [timeLeft, setTimeLeft] = useState(15);
    const [, forceUpdate] = useState(0);

    const svgRef = useRef(null);
    const mouseSvgRef = useRef({ x: 0, y: 0 });
    const mouseRawRef = useRef({ x: 0, y: 0 });
    const leftRefs = useRef({});
    const rightRefs = useRef({});
    const rafRef = useRef(null);
    const leftWires = useMemo(() => shuffleArray(WIRE_DATA).slice(0, 5), []);
    const rightWires = useMemo(() => shuffleArray(leftWires), [leftWires]);

    const startRaf = useCallback(() => {
        if (rafRef.current) return;
        const loop = () => {
            if (svgRef.current) {
                // Convert raw screen mouse coords into the SVG's local scaled coordinate space
                const pt = svgRef.current.createSVGPoint();
                pt.x = mouseRawRef.current.x;
                pt.y = mouseRawRef.current.y;
                try {
                    const ctm = svgRef.current.getScreenCTM();
                    if (ctm) {
                        const svgP = pt.matrixTransform(ctm.inverse());
                        mouseSvgRef.current = { x: svgP.x, y: svgP.y };
                    }
                } catch {
                    // Fallback if CTM isn't ready
                }
            }

            let closest = null, closestDist = SNAP_RADIUS;
            for (const wire of leftWires) {
                const el = rightRefs.current[wire.id];
                if (!el || matched.has(wire.id)) continue;
                const er = el.getBoundingClientRect();
                const cx = er.left + er.width / 2;
                const cy = er.top + er.height / 2;
                const dx = mouseRawRef.current.x - cx;
                const dy = mouseRawRef.current.y - cy;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < closestDist) { closestDist = dist; closest = wire.id; }
            }
            setSnapTarget(closest);
            forceUpdate(n => n + 1);
            rafRef.current = requestAnimationFrame(loop);
        };
        rafRef.current = requestAnimationFrame(loop);
    }, [leftWires, matched]);

    const stopRaf = useCallback(() => {
        if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    }, []);

    useEffect(() => {
        if (matched.size === leftWires.length && !done) {
            setDone(true); stopRaf(); setTimeout(() => onComplete(), 1400);
        }
    }, [matched, leftWires.length, done, onComplete, stopRaf]);

    useEffect(() => { forceUpdate(n => n + 1); }, []);

    useEffect(() => {
        if (done || failed) return;
        const tick = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    setFailed(true); stopRaf(); onPenalty?.(15);
                    setTimeout(() => onComplete(), 1200); return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(tick);
    }, [done, failed, onComplete, onPenalty, stopRaf]);

    useEffect(() => {
        const onMove = e => { mouseRawRef.current = { x: e.clientX, y: e.clientY }; };
        window.addEventListener('mousemove', onMove);
        return () => window.removeEventListener('mousemove', onMove);
    }, []);

    useEffect(() => {
        const cancel = e => {
            if (e.type === 'contextmenu' || e.key === 'Escape') {
                setDragging(null); setSnapTarget(null); stopRaf(); e.preventDefault();
            }
        };
        window.addEventListener('contextmenu', cancel);
        window.addEventListener('keydown', cancel);
        return () => { window.removeEventListener('contextmenu', cancel); window.removeEventListener('keydown', cancel); };
    }, [stopRaf]);

    const getCenter = useCallback(el => {
        if (!el || !svgRef.current) return null;
        const er = el.getBoundingClientRect();

        // Convert the center of the DOM element's screen rect into the SVG's coordinate space
        const pt = svgRef.current.createSVGPoint();
        pt.x = er.left + er.width / 2;
        pt.y = er.top + er.height / 2;
        try {
            const ctm = svgRef.current.getScreenCTM();
            if (ctm) {
                const svgP = pt.matrixTransform(ctm.inverse());
                return { x: svgP.x, y: svgP.y };
            }
        } catch {
            // CTM fail 
        }

        return { x: 0, y: 0 };
    }, []);

    const handleLeftClick = useCallback(wireId => {
        if (matched.has(wireId) || done || failed) return;
        if (dragging === wireId) { setDragging(null); setSnapTarget(null); stopRaf(); return; }
        setDragging(wireId); startRaf();
    }, [matched, done, failed, dragging, startRaf, stopRaf]);

    const handleRightClick = useCallback(wireId => {
        if (!dragging || done || failed) return;
        if (wireId === dragging) {
            setMatched(prev => new Set([...prev, wireId]));
        } else {
            const el = rightRefs.current[wireId];
            if (el) {
                el.classList.add('cables__slot--wrong');
                setTimeout(() => el.classList.remove('cables__slot--wrong'), 400);
            }
        }
        setDragging(null); setSnapTarget(null); stopRaf();
    }, [dragging, done, failed, stopRaf]);

    useEffect(() => {
        if (!dragging || !snapTarget) return;
        if (snapTarget === dragging) {
            setMatched(prev => new Set([...prev, dragging]));
            setDragging(null); setSnapTarget(null); stopRaf();
        }
    }, [snapTarget, dragging, stopRaf]);

    const cursorSvg = dragging ? mouseSvgRef.current : null;

    return (
        <>
            <div className="minigame-overlay">
                <div className="minigame-overlay__title">⚡ CABLE JUNCTION FAILURE</div>
                <div className="minigame-overlay__subtitle">
                    {dragging
                        ? `Move ${dragging.toUpperCase()} cable to the matching lamp on the right`
                        : 'Click a cable on the left to unplug it'}
                </div>

                <div
                    className="minigame-overlay__arena cables__arena"
                    style={{ cursor: dragging ? 'none' : 'default' }}
                >
                    <img className="cables__box-bg" src={cableBox} alt="Junction Box" />

                    <div className="cables__board">
                        {/* LEFT column */}
                        <div className="cables__column cables__column--left">
                            {leftWires.map((wire) => (
                                <div
                                    key={`left - ${wire.id} `}
                                    ref={el => leftRefs.current[wire.id] = el}
                                    className={[
                                        'cables__connector cables__connector--left',
                                        matched.has(wire.id) ? 'cables__connector--matched' : '',
                                        dragging === wire.id ? 'cables__connector--active' : '',
                                        !matched.has(wire.id) && !dragging ? 'cables__connector--idle' : '',
                                    ].join(' ')}
                                    onClick={() => handleLeftClick(wire.id)}
                                    title={`Unplug ${wire.label} cable`}
                                >
                                    {/* Invisible DOM anchor — UI is pure SVG */}
                                </div>
                            ))}
                        </div>

                        {/* RIGHT column */}
                        <div className="cables__column cables__column--right">
                            {rightWires.map((wire) => (
                                <div
                                    key={`right - ${wire.id} `}
                                    ref={el => rightRefs.current[wire.id] = el}
                                    className={[
                                        'cables__connector cables__connector--right',
                                        matched.has(wire.id) ? 'cables__connector--matched' : '',
                                        snapTarget === wire.id && dragging ? 'cables__connector--hover' : '',
                                        dragging && !matched.has(wire.id) ? 'cables__connector--target' : '',
                                    ].join(' ')}
                                    onClick={() => handleRightClick(wire.id)}
                                    title={`Socket for ${wire.label}`}
                                >
                                    <div
                                        className="cables__socket"
                                        style={{
                                            background: matched.has(wire.id) ? wire.color : '#1a1a1a',
                                            boxShadow: snapTarget === wire.id && dragging
                                                ? `0 0 10px 3px ${wire.lampColor} 88` : 'none',
                                            transition: 'all 0.15s',
                                        }}
                                    />
                                </div>
                            ))}
                        </div>

                        {/* Lamps column */}
                        <div className="cables__lamps-column">
                            {rightWires.map((wire) => (
                                <div key={`lamp - ${wire.id} `}>
                                    <div
                                        className="cables__lamp"
                                        style={{
                                            background: wire.lampColor,
                                            boxShadow: `0 0 ${matched.has(wire.id) ? '12px 5px' : '6px 2px'} ${wire.lampColor} 99`,
                                            opacity: matched.has(wire.id) ? 1 : 0.6,
                                            transition: 'all 0.3s',
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* SVG cable overlay */}
                    <svg
                        ref={svgRef}
                        style={{
                            position: 'absolute', inset: 0,
                            width: '100%', height: '100%',
                            pointerEvents: 'none', zIndex: 10,
                            overflow: 'visible',
                        }}
                    >
                        <defs>
                            <filter id="cable-shadow" x="-20%" y="-20%" width="140%" height="140%">
                                <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.35" />
                            </filter>
                        </defs>

                        {leftWires.map(wire => {
                            const fromEl = leftRefs.current[wire.id];
                            const toEl = rightRefs.current[wire.id];
                            const fromPos = getCenter(fromEl);
                            const toPos = matched.has(wire.id) ? getCenter(toEl) : null;
                            return (
                                <g
                                    key={wire.id}
                                    filter="url(#cable-shadow)"
                                    style={{ pointerEvents: 'auto', cursor: dragging ? 'default' : 'pointer' }}
                                    onClick={() => handleLeftClick(wire.id)}
                                >
                                    <CableSvg
                                        wire={wire}
                                        fromPos={fromPos}
                                        toPos={toPos}
                                        isDragging={dragging === wire.id}
                                        isMatched={matched.has(wire.id)}
                                        cursorSvg={dragging === wire.id ? cursorSvg : null}
                                    />
                                </g>
                            );
                        })}

                        {dragging && cursorSvg && (() => {
                            const wire = WIRE_DATA.find(w => w.id === dragging);
                            const { x, y } = cursorSvg;
                            return (
                                <g>
                                    <circle cx={x} cy={y} r={16} fill="none" stroke={wire.lampColor} strokeWidth="1.5" opacity="0.55" />
                                    <PlugTip x={x} y={y} side="left" />
                                </g>
                            );
                        })()}
                    </svg>
                </div>

                <div className="minigame-overlay__progress-bar">
                    <div
                        className={[
                            'minigame-overlay__progress-fill',
                            done ? 'minigame-overlay__progress-fill--success' : '',
                            failed ? 'minigame-overlay__progress-fill--danger' : '',
                        ].join(' ')}
                        style={{ width: `${(matched.size / leftWires.length) * 100}% ` }}
                    />
                </div>

                <div className="minigame-overlay__timer" style={{ display: 'flex', gap: '32px' }}>
                    <span>
                        {failed
                            ? <span className="minigame-overlay__result" style={{ color: '#ff4444' }}>[ PENALTY -15s ]</span>
                            : done
                                ? <span className="minigame-overlay__result">[ CONNECTION RESTORED ]</span>
                                : `CONNECTED: ${matched.size} / ${leftWires.length}`}
                    </span >
                    {!done && !failed && (
                        <span style={{ color: timeLeft <= 4 ? '#ff4444' : 'inherit' }}>
                            TIME: {timeLeft}s
                        </span>
                    )}
                </div >
            </div >
        </>
    );
}