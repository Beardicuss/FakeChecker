import { useState } from 'react';
import {
    createAgentIdentity,
    formatAgentTag,
    getSavedIdentityForName,
    issueAgentId,
    loadAgentIdentity,
    sanitizeAgentName,
} from '../utils/agentIdentity';
import './NameEntry.css';

/**
 * Agent name input screen.
 */
export default function NameEntry({ onSubmit }) {
    const savedIdentity = loadAgentIdentity();
    const [name, setName] = useState(savedIdentity?.name || '');
    const [draftAgentId] = useState(() => savedIdentity?.id || issueAgentId());

    const handleSubmit = (e) => {
        e.preventDefault();
        const cleanName = sanitizeAgentName(name);
        const savedForName = getSavedIdentityForName(cleanName);
        if (cleanName) onSubmit(createAgentIdentity(cleanName, savedForName?.id || draftAgentId));
    };

    const cleanName = sanitizeAgentName(name);
    const savedForName = getSavedIdentityForName(cleanName);
    const visibleAgentId = savedForName?.id || draftAgentId;
    const agentTag = cleanName ? formatAgentTag(cleanName, visibleAgentId) : visibleAgentId;

    return (
        <div className="name-entry" id="name-entry">
            <div className="name-entry__prompt">
                <p className="name-entry__text glow-text">
                    &gt; Please enter your name into the system.
                </p>
            </div>
            <form className="name-entry__form" onSubmit={handleSubmit}>
                <input
                    className="name-entry__input"
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Enter agent name..."
                    maxLength={24}
                    autoFocus
                    id="agent-name-input"
                />
                <div className="name-entry__identity">
                    <span>ISSUED ID</span>
                    <strong>{agentTag}</strong>
                    <small>ID number is locked to this agent.</small>
                </div>
                <button
                    className="name-entry__btn"
                    type="submit"
                    disabled={!name.trim()}
                    id="btn-proceed"
                >
                    [ PROCEED ]
                </button>
            </form>
        </div>
    );
}
