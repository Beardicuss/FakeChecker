import React, { useState, useEffect } from 'react';
import './Stamp.css';

/**
 * Animated "APPROVED" / "REJECTED" stamp overlay.
 */
export default function Stamp({ type, visible, onComplete }) {
    const [animating, setAnimating] = useState(false);

    useEffect(() => {
        if (visible) {
            setAnimating(true);
            const timer = setTimeout(() => {
                setAnimating(false);
                onComplete?.();
            }, 1200);
            return () => clearTimeout(timer);
        }
    }, [visible, onComplete]);

    if (!visible && !animating) return null;

    const label = type === 'correct' ? 'APPROVED' : 'REJECTED';
    const modifier = type === 'correct' ? 'stamp--approved' : 'stamp--rejected';

    return (
        <div className={`stamp ${modifier} ${animating ? 'stamp--active' : ''}`} aria-live="assertive">
            {label}
        </div>
    );
}
