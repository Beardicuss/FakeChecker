import yellowLight from '../assets/minigames/incident-lights/yellow.webp';
import orangeLight from '../assets/minigames/incident-lights/orange.webp';
import blueLight from '../assets/minigames/incident-lights/blue.webp';
import redLight from '../assets/minigames/incident-lights/red.webp';
import './IncidentPanel.css';

const INCIDENTS = [
    { color: 'yellow', src: yellowLight, label: 'FAN', key: 'fan' },
    { color: 'orange', src: orangeLight, label: 'TERMINAL', key: 'terminal' },
    { color: 'blue', src: blueLight, label: 'POWER', key: 'generator' },
    { color: 'red', src: redLight, label: 'CABLE', key: 'cables' },
];

/**
 * Incident warning panel with 4 visual lights.
 * Lights glow when an incident is pending. Click the glowing light to open the minigame.
 * Blinks intensely when time is running out.
 */
export default function IncidentPanel({ activeIncident, onLightClick, warningElapsed }) {
    return (
        <div className="incident-panel" id="incident-panel">
            <label className="incident-panel__title">SYSTEMS</label>
            <div className="incident-panel__lights">
                {INCIDENTS.map(inc => {
                    const isActive = activeIncident === inc.key;
                    const isBlinking = isActive && warningElapsed >= 4;
                    return (
                        <div
                            key={inc.label}
                            className={`incident-light incident-light--${inc.color} ${isActive ? 'incident-light--active' : ''} ${isBlinking ? 'incident-light--blinking' : ''}`}
                            onClick={() => {
                                if (isActive && onLightClick) {
                                    onLightClick();
                                }
                            }}
                        >
                            <span className="incident-light__symbol">
                                <img src={inc.src} alt={inc.label} className="incident-light__img" />
                            </span>
                            <span className="incident-light__label">{inc.label}</span>
                        </div>
                    )
                })}
            </div>
        </div>
    );
}
