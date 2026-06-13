import { useState, useEffect } from 'react';
import emblemImg from '../assets/backgrounds/ministry-emblem.webp';
import './BootSequence.css';

const BOOT_LINES = [
    'MINISTRY OF VERITY — TERMINAL v3.41',
    'Initializing system diagnostics...',
    'Memory check: 640K OK',
    'Loading verification protocols...',
    'Connecting to Central Truth Database...',
    'Connection established.',
    'Loading agent workspace...',
    '',
    'SYSTEM READY.',
    '',
    '> Observe. Denounce. Obey.',
];

/**
 * CRT boot animation screen with Ministry emblem and typed terminal lines.
 */
export default function BootSequence({ onComplete }) {
    const [visibleLines, setVisibleLines] = useState(0);

    useEffect(() => {
        if (visibleLines < BOOT_LINES.length) {
            const delay = BOOT_LINES[visibleLines] === '' ? 400 : 200 + Math.random() * 300;
            const timer = setTimeout(() => setVisibleLines(prev => prev + 1), delay);
            return () => clearTimeout(timer);
        } else {
            const timer = setTimeout(onComplete, 1500);
            return () => clearTimeout(timer);
        }
    }, [visibleLines, onComplete]);

    return (
        <div className="boot-sequence" id="boot-sequence">
            <img
                src={emblemImg}
                alt="Ministry of Verity"
                className="boot-sequence__emblem"
            />
            <div className="boot-sequence__terminal">
                {BOOT_LINES.slice(0, visibleLines).map((line, i) => (
                    <div key={i} className="boot-sequence__line">
                        {line || '\u00A0'}
                    </div>
                ))}
                {visibleLines < BOOT_LINES.length && (
                    <span className="boot-sequence__cursor">█</span>
                )}
            </div>
        </div>
    );
}
