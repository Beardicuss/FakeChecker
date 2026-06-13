import { useState } from 'react';
import './MailPage.css';

const MESSAGES = [
    {
        id: 1,
        label: 'TUTORIAL',
        from: 'DIRECTIVE.ENFORCER',
        date: '[05.07.2025 | 06:00]',
        security: 'SECURE-B',
        subject: 'ORIENTATION PROTOCOL',
        body: [
            'Welcome, Agent.',
            'Your identity has been provisionally authorized for Ministry orientation. The terminal will guide you through the current verification process before active service begins.',
            'Review each incoming package, compare it against the active directives, and classify it as REAL or FAKE. Skipping a package is permitted, but hesitation is recorded.',
            'Your progress will be monitored and evaluated.',
            'Observa. Denuntia. Obedi.',
        ],
    },
    {
        id: 2,
        label: 'SYSTEM ACCESS',
        from: 'TERMINAL.ADMIN',
        date: '[05.07.2025 | 06:12]',
        security: 'INTERNAL',
        subject: 'ACCESS FLOW UPDATED',
        body: [
            'Agent terminal access has been simplified.',
            'Manual password entry is no longer required for this workstation. Enter your agent name, accept the current directive, and proceed through the main terminal menu.',
            'Do not leave the workstation unattended during an active shift. System incidents may occur without further warning.',
        ],
    },
    {
        id: 3,
        label: 'NEW DIRECTIVES',
        from: 'POLICY.BUREAU',
        date: '[05.07.2025 | 06:25]',
        security: 'SECURE-A',
        subject: 'ACTIVE FOOTBALL VERIFICATION RULES',
        body: [
            'The Ministry has issued revised football verification priorities.',
            'Historical achievements, player praise, and club records must be evaluated against the active directives displayed on your workstation.',
            'A statement can be factually true and still require suppression if Ministry policy marks it as destabilizing.',
        ],
    },
    {
        id: 4,
        label: 'SYSTEM ALERTS',
        from: 'MAINTENANCE.NODE',
        date: '[05.07.2025 | 06:40]',
        security: 'OPERATIONS',
        subject: 'WORKSTATION INSTABILITY NOTICE',
        body: [
            'This workstation remains below acceptable reliability thresholds.',
            'Cooling, power, wiring, and terminal subsystems may fail during a shift. Click the active warning light and complete the repair procedure before the alert expires.',
            'Purchased upgrades reduce or eliminate matching system failures.',
        ],
    },
];

/**
 * Internal mail inbox UI overlaying the main workstation area.
 */
export default function MailPage({ onClose }) {
    const [activeMsg, setActiveMsg] = useState(1);
    const message = MESSAGES.find(item => item.id === activeMsg) || MESSAGES[0];

    return (
        <div className="mail-page">
            <div className="mail-page__content">
                {/* Header built around the baked-in background logos */}
                <div className="mail-page__header">
                    <span className="mail-page__header-sub">INTERNAL MAIL NETWORK</span>
                    <h2 className="mail-page__header-title">MINISTRY OF VERITY</h2>
                </div>

                <div className="mail-page__split">
                    {/* LEFT PANE - MESSAGE LIST */}
                    <div className="mail-page__sidebar">
                        <h3 className="mail-page__sidebar-title">INCOMING MESSAGES</h3>

                        {MESSAGES.map(item => (
                            <div key={item.id} className={`mail-page__list-item ${activeMsg === item.id ? 'active' : ''}`} onClick={() => setActiveMsg(item.id)}>
                                <div className="mail-page__list-number">{item.id}</div>
                                <div className="mail-page__list-text">{item.label}</div>
                                <div className="mail-page__list-icon"><svg width="20" height="16" viewBox="0 0 20 16" fill="currentColor"><path d="M2 0C.9 0 0 .9 0 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2h-8L6 0H2z" /></svg></div>
                            </div>
                        ))}

                        {/* Back out button */}
                        <button className="mail-page__exit-btn" onClick={onClose}>
                            [ CLOSE NETWORK ]
                        </button>
                    </div>

                    {/* RIGHT PANE - MESSAGE BODY */}
                    <div className="mail-page__body-container">
                        <div className="mail-page__body-header">
                            <span>From: {message.from}</span>
                            <span className="mail-page__body-date">{message.date}</span>
                        </div>
                        <div className="mail-page__body-meta">
                            Security Level: {message.security} <br />
                            Subject: {message.subject}
                        </div>

                        <hr className="mail-page__body-divider" />

                        <div className="mail-page__msg-body">
                            {message.body.map((paragraph, index) => (
                                <p key={index}>{paragraph}</p>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
