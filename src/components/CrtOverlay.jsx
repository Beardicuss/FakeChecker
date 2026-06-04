import React from 'react';
import './CrtOverlay.css';

/**
 * CRT monitor overlay effect — scanlines + ambient glow.
 * Wraps the entire application content.
 */
export default function CrtOverlay({ children }) {
    return (
        <div className="crt-wrapper">
            <div className="crt-content">
                {children}
            </div>
            <div className="crt-scanlines" aria-hidden="true" />
            <div className="crt-glow" aria-hidden="true" />
        </div>
    );
}
