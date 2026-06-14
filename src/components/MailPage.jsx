import { useState } from 'react';
import { buildMailMessages } from '../utils/mailGenerator';
import './MailPage.css';

/**
 * Internal mail inbox UI overlaying the main workstation area.
 */
export default function MailPage({ agentName, agentId, agentEmail, externalMessages, onClose }) {
    const messages = buildMailMessages({ agentName, agentId, agentEmail, externalMessages });
    const [activeMsg, setActiveMsg] = useState(messages[0]?.id);
    const message = messages.find(item => item.id === activeMsg) || messages[0];

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

                        <div className="mail-page__list">
                            {messages.map((item, index) => (
                                <button key={item.id} type="button" className={`mail-page__list-item ${activeMsg === item.id ? 'active' : ''}`} onClick={() => setActiveMsg(item.id)}>
                                    <span className="mail-page__list-number">{index + 1}</span>
                                    <span className="mail-page__list-text">{item.label}</span>
                                    <span className="mail-page__list-icon"><svg width="20" height="16" viewBox="0 0 20 16" fill="currentColor"><path d="M2 0C.9 0 0 .9 0 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2h-8L6 0H2z" /></svg></span>
                                </button>
                            ))}
                        </div>

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
