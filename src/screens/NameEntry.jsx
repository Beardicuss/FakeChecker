import { useState } from 'react';
import { createAgentIdentity, formatAgentTag, issueAgentId, sanitizeAgentName } from '../utils/agentIdentity';
import './NameEntry.css';

/**
 * Agent name input screen.
 */
export default function NameEntry({ onSubmit }) {
    const [name, setName] = useState('');
    const [agentId] = useState(() => issueAgentId());

    const handleSubmit = (e) => {
        e.preventDefault();
        const cleanName = sanitizeAgentName(name);
        if (cleanName) onSubmit(createAgentIdentity(cleanName, agentId));
    };

    const cleanName = sanitizeAgentName(name);
    const agentTag = cleanName ? formatAgentTag(cleanName, agentId) : agentId;

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
