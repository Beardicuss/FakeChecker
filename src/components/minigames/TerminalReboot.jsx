import React, { useState, useCallback, useEffect, useMemo } from 'react';
import terminalImg from '../../assets/minigames/terminal/terminal.png';
import './Minigames.css';

/**
 * Terminal Reboot minigame — type a 5-digit code on a retro keypad.
 * Some keys "stick" and need to be pressed twice.
 */
export default function TerminalReboot({ onComplete }) {
    const [input, setInput] = useState('');
    const [done, setDone] = useState(false);
    const [stuckKeys, setStuckKeys] = useState({});

    // Generate random 5-digit code + random stuck keys
    const targetCode = useMemo(() => {
        return Array.from({ length: 5 }, () => Math.floor(Math.random() * 10)).join('');
    }, []);

    // Randomly make 2 keys "stick"
    const stickyKeys = useMemo(() => {
        const keys = new Set();
        while (keys.size < 2) {
            keys.add(String(Math.floor(Math.random() * 10)));
        }
        return keys;
    }, []);

    useEffect(() => {
        if (input === targetCode && !done) {
            setDone(true);
            setTimeout(() => onComplete(), 1500);
        }
    }, [input, targetCode, done, onComplete]);

    const handleKeyPress = useCallback((digit) => {
        if (done || input.length >= 5) return;

        // Check if this key is stuck and needs a second press
        if (stickyKeys.has(digit) && !stuckKeys[digit + input.length]) {
            setStuckKeys(prev => ({ ...prev, [digit + input.length]: true }));
            return; // First press does nothing, key "sticks"
        }

        setInput(prev => prev + digit);
        // Reset stuck state for this context
        setStuckKeys(prev => {
            const next = { ...prev };
            delete next[digit + input.length];
            return next;
        });
    }, [done, input, stickyKeys, stuckKeys]);

    const handleClear = useCallback(() => {
        if (done) return;
        setInput('');
        setStuckKeys({});
    }, [done]);

    // Render the code with visual feedback
    const renderCodeDisplay = () => {
        return targetCode.split('').map((char, i) => (
            <span key={i} style={{
                color: input[i] === char ? '#44ff44' : input[i] ? '#ff4444' : 'var(--text-primary)',
            }}>
                {char}
            </span>
        ));
    };

    return (
        <div className="minigame-overlay">
            <div className="minigame-overlay__title">🖥 SYSTEM FROZEN</div>
            <div className="minigame-overlay__subtitle">Enter the reboot code — some keys may stick!</div>

            <div className="minigame-overlay__arena">
                <div className="terminal-reboot__screen">
                    <div className="terminal-reboot__error">BUREAU-ERR 304</div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <img src={terminalImg} alt="Terminal" style={{ width: 100, height: 100, objectFit: 'contain' }} />
                        <div>
                            <div style={{ color: 'var(--text-dim)', fontSize: 'var(--font-size-sm)', marginBottom: '4px' }}>
                                ENTER CODE:
                            </div>
                            <div className="terminal-reboot__code-display">
                                {renderCodeDisplay()}
                            </div>
                        </div>
                    </div>

                    <div className="terminal-reboot__input-display">
                        {input || '_____'}
                    </div>

                    <div className="terminal-reboot__keypad">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                            <button
                                key={n}
                                className={`terminal-reboot__key ${stickyKeys.has(String(n)) ? 'terminal-reboot__key--stuck' : ''}`}
                                onClick={() => handleKeyPress(String(n))}
                            >
                                {n}
                            </button>
                        ))}
                        <button
                            className="terminal-reboot__key terminal-reboot__key--zero"
                            onClick={() => handleKeyPress('0')}
                        >0</button>
                    </div>

                    <button
                        className="terminal-reboot__key"
                        onClick={handleClear}
                        style={{ marginTop: '8px', fontSize: 'var(--font-size-sm)', padding: '6px 16px' }}
                    >CLEAR</button>
                </div>
            </div>

            <div className="minigame-overlay__timer">
                {done
                    ? <span className="minigame-overlay__result">[ SYSTEM REBOOTED ]</span>
                    : `DIGITS: ${input.length} / 5`
                }
            </div>
        </div>
    );
}
