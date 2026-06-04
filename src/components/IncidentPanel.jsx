import React from 'react';
import yellowLight from '../assets/minigames/incident-lights/yellow.png';
import orangeLight from '../assets/minigames/incident-lights/orange.png';
import blueLight from '../assets/minigames/incident-lights/blue.png';
import redLight from '../assets/minigames/incident-lights/red.png';
import './IncidentPanel.css';

const INCIDENTS = [
    { color: 'yellow', src: yellowLight, label: 'FAN', key: 'fan' },
    { color: 'orange', src: orangeLight, label: 'TERMINAL', key: 'terminal' },
    { color: 'blue', src: blueLight, label: 'POWER', key: 'generator' },
    { color: 'red', src: redLight, label: 'CABLE', key: 'cables' },
];

/**
 * Incident warning panel with 4 visual lights.
 * Lights glow brilliantly when their incident is currently active.
 */
export default function IncidentPanel({ activeIncident }) {
    return (
        <div className="incident-panel" id="incident-panel">
            <label className="incident-panel__title">SYSTEMS</label>
            <div className="incident-panel__lights">
                {INCIDENTS.map(inc => (
                    <div
                        key={inc.label}
                        className={`incident-light incident-light--${inc.color} ${activeIncident === inc.key ? 'incident-light--active' : ''}`}
                    >
                        <span className="incident-light__symbol">
                            <img src={inc.src} alt={inc.label} className="incident-light__img" />
                        </span>
                        <span className="incident-light__label">{inc.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
