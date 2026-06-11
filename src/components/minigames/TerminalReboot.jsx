import { useState, useCallback, useEffect } from 'react';
import terminalBg from '../../assets/minigames/terminal/terminal.png';
import './Minigames.css';

/**
 * Terminal Reboot minigame — type a 7-digit alphanumeric code on a physical keypad.
 * Requires pressing APPLY to submit.
 */
export default function TerminalReboot({ onComplete, onPenalty }) {
    const [input, setInput] = useState('');
    const [done, setDone] = useState(false);
    const [failed, setFailed] = useState(false);
    const [timeLeft, setTimeLeft] = useState(15);
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
