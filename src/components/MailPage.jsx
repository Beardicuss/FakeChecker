import './MailPage.css';

/**
 * Internal mail inbox UI overlaying the main workstation area.
 */
export default function MailPage({ onClose }) {
    return (
        <div className="mail-page">
            <div className="mail-page__content">
                <div className="mail-page__header">
                    <h2 className="glow-text">INBOX - SECURE RELAY</h2>
                    <button className="mail-page__close" onClick={onClose}>[ CLOSE ]</button>
                </div>
                <div className="mail-page__list">
                    <div className="mail-page__message">
                        <div className="mail-page__msg-header">
                            <span className="mail-page__sender">FROM: shodan@verity.gov</span>
                            <span className="mail-page__date">DAY 1</span>
                        </div>
                        <div className="mail-page__msg-subject">SUBJECT: Welcome to the fold</div>
                        <div className="mail-page__msg-body">
                            Agent, your workstation is now online.<br /><br />
                            We are counting on you to uphold the truth. Analyze the packages, verify the sources, and refer to your Directive on the right side of the screen.<br /><br />
                            Mistakes lower Ministry trust. Do not make mistakes.<br /><br />
                            GLORY TO VERITY.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
