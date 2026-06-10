import { useState, useCallback, useEffect } from 'react';
import './Minigames.css';

/**
 * Terminal Reboot minigame — type a 5-digit code on a retro keypad.
 * Strict keypad lock: making a mistake resets the code immediately.
 */
export default function TerminalReboot({ onComplete, onPenalty }) {
    const [input, setInput] = useState('');
    const [done, setDone] = useState(false);
    const [failed, setFailed] = useState(false);
    const [timeLeft, setTimeLeft] = useState(8);

    // Generate random 5-digit code once lazily
    const [targetCode] = useState(() => Array.from({ length: 5 }, () => Math.floor(Math.random() * 10)).join(''));

    useEffect(() => {
        if (input === targetCode && !done && !failed) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setDone(true);
            setTimeout(() => onComplete(), 1500);
        }
    }, [input, targetCode, done, failed, onComplete]);

    // 8-second countdown
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

    const handleKeyPress = useCallback((digit) => {
        if (done || input.length >= 5) return;

        // Strict behavior: if the digit doesn't match the current code position, reset completely
        if (targetCode[input.length] !== digit) {
            setInput('');
            return;
        }

        setInput(prev => prev + digit);
    }, [done, input, targetCode]);

    const handleClear = useCallback(() => {
        if (done) return;
        setInput('');
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
            <div className="minigame-overlay__subtitle">Enter the reboot code to restore connection.</div>

            <div className="minigame-overlay__arena">
                <div className="terminal-reboot__screen">
                    <div className="terminal-reboot__error">BUREAU-ERR 304</div>
                    <div style={{ color: 'var(--text-dim)', fontSize: 'var(--font-size-sm)' }}>
                        ENTER CODE:
                    </div>
                    <div className="terminal-reboot__code-display" style={{ marginBottom: '8px' }}>
                        {renderCodeDisplay()}
                    </div>

                    <div className="terminal-reboot__input-display">
                        {input || '_____'}
                    </div>

                    <div className="terminal-reboot__keypad">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                            <button
                                key={n}
                                className="terminal-reboot__key"
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

            <div className="minigame-overlay__timer" style={{ display: 'flex', gap: '32px' }}>
                <span>
                    {failed ? <span className="minigame-overlay__result" style={{ color: '#ff4444' }}>[ PENALTY -15s ]</span>
                        : done ? <span className="minigame-overlay__result">[ SYSTEM REBOOTED ]</span>
                            : `DIGITS: ${input.length} / 5`
                    }
                </span>
                {!done && !failed && (
                    <span style={{ color: timeLeft <= 3 ? '#ff4444' : 'var(--text-primary)' }}>
                        TIME: {timeLeft}s
                    </span>
                )}
            </div>
        </div>
    );
}
