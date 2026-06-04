import React from 'react';
import './IncidentPanel.css';

const INCIDENTS = [
    { color: 'yellow', symbol: '⚙', label: 'FAN' },
    { color: 'orange', symbol: '▣', label: 'TERMINAL' },
    { color: 'blue', symbol: '⚡', label: 'POWER' },
    { color: 'red', symbol: '⌁', label: 'CABLE' },
];

/**
 * Visual-only incident warning panel with 4 lights.
 */
export default function IncidentPanel() {
    return (
        <div className="incident-panel" id="incident-panel">
            <label className="incident-panel__title">SYSTEMS</label>
            <div className="incident-panel__lights">
                {INCIDENTS.map(inc => (
                    <div key={inc.label} className={`incident-light incident-light--${inc.color}`}>
                        <span className="incident-light__symbol">{inc.symbol}</span>
                        <span className="incident-light__label">{inc.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
