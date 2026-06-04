import React from 'react';
import mailIcon from '../assets/icons/mail.png';
import './MailIcon.css';

/**
 * Clickable mail icon with optional "new mail" indicator.
 */
export default function MailIcon({ hasNew, onClick }) {
    return (
        <button
            className={`mail-icon ${hasNew ? 'mail-icon--new' : ''}`}
            onClick={onClick}
            aria-label="Open internal mail"
            id="mail-icon"
        >
            <img src={mailIcon} alt="Mail" className="mail-icon__img" />
            {hasNew && <span className="mail-icon__badge">!</span>}
        </button>
    );
}
