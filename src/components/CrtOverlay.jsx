import React, { useState, useEffect } from 'react';
import './CrtOverlay.css';

// Design baseline — the resolution where the game looks perfect at scale(1)
const BASE_WIDTH = 1920;
const BASE_HEIGHT = 1080;

/**
 * CRT monitor overlay effect — scanlines + ambient glow.
 * Wraps the entire application content.
 * Auto-scales to fit any viewport resolution.
 */
export default function CrtOverlay({ children }) {
    const [scale, setScale] = useState(1);

    useEffect(() => {
        const computeScale = () => {
            // Use 95% of viewport to leave breathing room for browser chrome
            const vw = window.innerWidth * 0.95;
            const vh = window.innerHeight * 0.95;
            const scaleX = vw / BASE_WIDTH;
            const scaleY = vh / BASE_HEIGHT;
            // Use the smaller axis so nothing clips — no cap, always fit
            setScale(Math.min(scaleX, scaleY));
        };

        computeScale();
        window.addEventListener('resize', computeScale);
        return () => window.removeEventListener('resize', computeScale);
    }, []);

    return (
        <div
            className="crt-wrapper"
            style={{ transform: `scale(${scale})`, transformOrigin: 'center center' }}
        >
            <div className="crt-content">
                {children}
            </div>
            <div className="crt-scanlines" aria-hidden="true" />
            <div className="crt-glow" aria-hidden="true" />
        </div>
    );
}
