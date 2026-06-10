import { useState } from 'react';
import './NameEntry.css';

/**
 * Agent name input screen.
 */
export default function NameEntry({ onSubmit }) {
    const [name, setName] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (name.trim()) onSubmit(name.trim());
    };

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
