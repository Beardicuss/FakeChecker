import { useState, useCallback, useEffect } from 'react';
import terminalBg from '../../assets/minigames/terminal/terminal.png';
import './Minigames.css';

/* --- DEVELOPMENT DEBUG PANEL --- 
// Uncomment this block and set DEBUG = true to calibrate the terminal layout
const DEFAULT_POS = {
    paperTop: 25.0, paperLeft: 69.0, paperWidth: 18.0, paperRot: 1.0,
    screenTop: 13.0, screenLeft: 14.0, screenWidth: 53.0, screenHeight: 40.0,
    keypadTop: 57.5, keypadLeft: 26.5, keypadWidth: 48.5, keypadHeight: 35.8,
    keypadGapRow: 4.0, keypadGapCol: 3.5,
};

const DEBUG = false; // Set to false when done calibrating

const panelStyle = {
    position: 'fixed', top: 10, right: 10, zIndex: 9999,
    background: 'rgba(0,0,0,0.88)', border: '1px solid #444',
    borderRadius: 8, padding: '10px 14px', width: 320,
    fontFamily: 'monospace', fontSize: 11, color: '#ccc',
    maxHeight: '90vh', overflowY: 'auto',
};
const rowStyle = { display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 };
const labelStyle = { width: 120, flexShrink: 0, color: '#888' };
const valStyle = { width: 34, textAlign: 'right', color: '#fff' };

function Slider({ label, value, onChange, min = 0, max = 100, step = 0.5 }) {
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

    const update = (key, val) => setPos(p => ({ ...p, [key]: val }));

    const css = `
.terminal-reboot__paper-text {
    top: ${pos.paperTop.toFixed(1)}%;
    left: ${pos.paperLeft.toFixed(1)}%;
    width: ${pos.paperWidth.toFixed(1)}%;
    transform: rotate(${pos.paperRot.toFixed(1)}deg);
}

.terminal-reboot__screen {
    top: ${pos.screenTop.toFixed(1)}%;
    left: ${pos.screenLeft.toFixed(1)}%;
    width: ${pos.screenWidth.toFixed(1)}%;
    height: ${pos.screenHeight.toFixed(1)}%;
}

.terminal-reboot__keypad {
    top: ${pos.keypadTop.toFixed(1)}%;
    left: ${pos.keypadLeft.toFixed(1)}%;
    width: ${pos.keypadWidth.toFixed(1)}%;
    height: ${pos.keypadHeight.toFixed(1)}%;
    gap: ${pos.keypadGapRow.toFixed(1)}% ${pos.keypadGapCol.toFixed(1)}%;
}`;

    const copy = () => {
        navigator.clipboard.writeText(css);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    return (
        <div style={panelStyle}>
            <div style={{ color: '#ff6644', fontWeight: 'bold', marginBottom: 8 }}>⚙ TERMINAL CALIBRATOR</div>

            <div style={{ color: '#ff9944', margin: '8px 0 4px' }}>— SCREEN / VIEWPORT —</div>
            <Slider label="Screen Top" value={pos.screenTop} onChange={v => update('screenTop', v)} />
            <Slider label="Screen Left" value={pos.screenLeft} onChange={v => update('screenLeft', v)} />
            <Slider label="Screen Width" value={pos.screenWidth} onChange={v => update('screenWidth', v)} />
            <Slider label="Screen Height" value={pos.screenHeight} onChange={v => update('screenHeight', v)} />

            <div style={{ color: '#44aaff', margin: '8px 0 4px' }}>— PHYSICAL KEYPAD —</div>
            <Slider label="Keypad Top" value={pos.keypadTop} onChange={v => update('keypadTop', v)} />
            <Slider label="Keypad Left" value={pos.keypadLeft} onChange={v => update('keypadLeft', v)} />
            <Slider label="Keypad Width" value={pos.keypadWidth} onChange={v => update('keypadWidth', v)} />
            <Slider label="Keypad Height" value={pos.keypadHeight} onChange={v => update('keypadHeight', v)} />
            <Slider label="Gap Row" value={pos.keypadGapRow} onChange={v => update('keypadGapRow', v)} min={0} max={20} />
            <Slider label="Gap Col" value={pos.keypadGapCol} onChange={v => update('keypadGapCol', v)} min={0} max={20} />

            <div style={{ color: '#ff44ff', margin: '8px 0 4px' }}>— STICKY NOTE —</div>
            <Slider label="Paper Top" value={pos.paperTop} onChange={v => update('paperTop', v)} />
            <Slider label="Paper Left" value={pos.paperLeft} onChange={v => update('paperLeft', v)} />
            <Slider label="Paper Width" value={pos.paperWidth} onChange={v => update('paperWidth', v)} />
            <Slider label="Rotation (deg)" value={pos.paperRot} onChange={v => update('paperRot', v)} min={-15} max={15} />

            <div style={{ marginTop: 10, borderTop: '1px solid #333', paddingTop: 8 }}>
                <button
                    onClick={copy}
                    style={{
                        width: '100%', padding: '6px 0', background: copied ? '#1a4a1a' : '#1a1a2a',
                        border: '1px solid #444', borderRadius: 4, color: copied ? '#44ff44' : '#ccc',
                        cursor: 'pointer', fontFamily: 'monospace', fontSize: 11,
                    }}
                >
                    {copied ? '✓ COPIED CSS!' : '⧉ COPY CSS OVERRIDES'}
                </button>
            </div>
        </div>
    );
}
*/

/**
 * Terminal Reboot minigame — type a 7-digit alphanumeric code on a physical keypad.
 * Requires pressing APPLY to submit.
 */
export default function TerminalReboot({ onComplete, onPenalty }) {
    const [input, setInput] = useState('');
    const [done, setDone] = useState(false);
    const [failed, setFailed] = useState(false);
    const [timeLeft, setTimeLeft] = useState(10); // Return to 10 seconds
    const [errorFlash, setErrorFlash] = useState(false);

    // Generate random 7-character code lazily
    const [targetCode] = useState(() => {
        const chars = '0123456789*#';
        return Array.from({ length: 7 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    });

    // Countdown
    useEffect(() => {
        if (done || failed) return;
        const tick = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    setFailed(true);
                    onPenalty?.(15);
                    setTimeout(() => onComplete(), 1000);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(tick);
    }, [done, failed, onComplete, onPenalty]);

    const handleKeyPress = useCallback((char) => {
        if (done || failed || errorFlash || input.length >= 7) return;
        setInput(prev => prev + char);
    }, [done, failed, errorFlash, input.length]);

    const handleBackspace = useCallback(() => {
        if (done || failed || errorFlash) return;
        setInput(prev => prev.slice(0, -1));
    }, [done, failed, errorFlash]);

    const handleClear = useCallback(() => {
        if (done || failed || errorFlash) return;
        setInput('');
    }, [done, failed, errorFlash]);

    const handleApply = useCallback(() => {
        if (done || failed || errorFlash) return;

        if (input === targetCode) {
            setDone(true);
            setTimeout(() => onComplete(), 1500);
        } else {
            setErrorFlash(true);
            setTimeout(() => {
                setInput('');
                setErrorFlash(false);
            }, 500);
        }
    }, [done, failed, errorFlash, input, targetCode, onComplete]);

    return (
        <div className="minigame-overlay">
            <div className="minigame-overlay__title">🖥 SYSTEM FROZEN</div>
            <div className="minigame-overlay__subtitle">Enter the reboot code to restore connection.</div>

            <div className="minigame-overlay__arena terminal-reboot__arena">
                <img src={terminalBg} alt="Terminal" className="cables__box-bg" />

                <div className="terminal-reboot__paper-text">
                    {targetCode}
                </div>

                <div className="terminal-reboot__screen">
                    <div className="terminal-reboot__input-display" style={{ color: errorFlash ? '#ff4444' : '#44ff44' }}>
                        {input}
                        <span className="terminal-reboot__cursor">_</span>
                    </div>
                </div>

                <div className="terminal-reboot__keypad">
                    {/* Row 1 */}
                    <button className="terminal-reboot__key" onClick={() => handleKeyPress('1')} />
                    <button className="terminal-reboot__key" onClick={() => handleKeyPress('2')} />
                    <button className="terminal-reboot__key" onClick={() => handleKeyPress('3')} />
                    <button className="terminal-reboot__key" onClick={handleClear} />

                    {/* Row 2 */}
                    <button className="terminal-reboot__key" onClick={() => handleKeyPress('4')} />
                    <button className="terminal-reboot__key" onClick={() => handleKeyPress('5')} />
                    <button className="terminal-reboot__key" onClick={() => handleKeyPress('6')} />
                    <button className="terminal-reboot__key" onClick={handleBackspace} />

                    {/* Row 3 */}
                    <button className="terminal-reboot__key" onClick={() => handleKeyPress('7')} />
                    <button className="terminal-reboot__key" onClick={() => handleKeyPress('8')} />
                    <button className="terminal-reboot__key" onClick={() => handleKeyPress('9')} />
                    <button className="terminal-reboot__key terminal-reboot__key--apply" onClick={handleApply} />

                    {/* Row 4 */}
                    <button className="terminal-reboot__key" onClick={() => handleKeyPress('*')} />
                    <button className="terminal-reboot__key" onClick={() => handleKeyPress('0')} />
                    <button className="terminal-reboot__key" onClick={() => handleKeyPress('#')} />
                </div>
            </div>

            <div className="minigame-overlay__timer" style={{ display: 'flex', gap: '32px' }}>
                <span>
                    {failed ? <span className="minigame-overlay__result" style={{ color: '#ff4444' }}>[ PENALTY -15s ]</span>
                        : done ? <span className="minigame-overlay__result">[ SYSTEM REBOOTED ]</span>
                            : `DIGITS: ${input.length} / 5`
                    }
                </span >
                {!done && !failed && (
                    <span style={{ color: timeLeft <= 3 ? '#ff4444' : 'var(--text-primary)' }}>
                        TIME: {timeLeft}s
                    </span>
                )}
            </div >
        </div >
    );
}
