import { useState } from 'react';
import './MailPage.css';

/**
 * Internal mail inbox UI overlaying the main workstation area.
 */
export default function MailPage({ onClose }) {
    const [activeMsg, setActiveMsg] = useState(1);

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

                        <div className={`mail-page__list-item ${activeMsg === 1 ? 'active' : ''}`} onClick={() => setActiveMsg(1)}>
                            <div className="mail-page__list-number">1</div>
                            <div className="mail-page__list-text">TUTORIAL</div>
                            <div className="mail-page__list-icon"><svg width="20" height="16" viewBox="0 0 20 16" fill="currentColor"><path d="M2 0C.9 0 0 .9 0 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2h-8L6 0H2z" /></svg></div>
                        </div>

                        <div className={`mail-page__list-item ${activeMsg === 2 ? 'active' : ''}`} onClick={() => setActiveMsg(2)}>
                            <div className="mail-page__list-number">2</div>
                            <div className="mail-page__list-text">CHANGING PASSWORD</div>
                            <div className="mail-page__list-icon"><svg width="20" height="16" viewBox="0 0 20 16" fill="currentColor"><path d="M2 0C.9 0 0 .9 0 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2h-8L6 0H2z" /></svg></div>
                        </div>

                        <div className={`mail-page__list-item ${activeMsg === 3 ? 'active' : ''}`} onClick={() => setActiveMsg(3)}>
                            <div className="mail-page__list-number">3</div>
                            <div className="mail-page__list-text">NEW DIRECTIVES</div>
                            <div className="mail-page__list-icon"><svg width="20" height="16" viewBox="0 0 20 16" fill="currentColor"><path d="M2 0C.9 0 0 .9 0 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2h-8L6 0H2z" /></svg></div>
                        </div>

                        <div className={`mail-page__list-item ${activeMsg === 4 ? 'active' : ''}`} onClick={() => setActiveMsg(4)}>
                            <div className="mail-page__list-number">4</div>
                            <div className="mail-page__list-text">SYSTEM ALERTS</div>
                            <div className="mail-page__list-icon"><svg width="20" height="16" viewBox="0 0 20 16" fill="currentColor"><path d="M2 0C.9 0 0 .9 0 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2h-8L6 0H2z" /></svg></div>
                        </div>

                        {/* Back out button */}
                        <button className="mail-page__exit-btn" onClick={onClose}>
                            [ CLOSE NETWORK ]
                        </button>
                    </div>

                    {/* RIGHT PANE - MESSAGE BODY */}
                    <div className="mail-page__body-container">
                        <div className="mail-page__body-header">
                            <span>From: DIRECTIVE.ENFORCER</span>
                            <span className="mail-page__body-date">[05.07.2025 | 06:00]</span>
                        </div>
                        <div className="mail-page__body-meta">
                            Security Level: SECURE-B <br />
                            Subject: INITIAL ACCESS CREDENTIALS - TUTORIAL PROTOCOL
                        </div>

                        <hr className="mail-page__body-divider" />

                        <div className="mail-page__msg-body">
                            Welcome, Agent.<br /><br />
                            You are receiving this message because your identity has been provisionally authorized for orientation under Directive V-013. Before proceeding, you must authenticate via the Ministry's internal training module.<br /><br />
                            Please locate your temporary credentials below:<br /><br />
                            <span className="glow-text">&gt; LOGIN: AGENT-[PlayerName]</span><br />
                            <span className="glow-text">&gt; PASSWORD: VERITY</span><br /><br />
                            These are valid **for one session only**. Upon successful entry, the terminal sequence will initiate automatically.<br /><br />
                            DO NOT share these credentials with unauthorized personnel.<br /><br />
                            Your progress will be monitored and evaluated. Remember:<br /><br />
                            &gt; **Observa. Denuntia. Obedi.**<br /><br />
                            The Ministry of Verity watches us all.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
