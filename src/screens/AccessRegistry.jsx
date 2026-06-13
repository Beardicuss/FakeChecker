import { useMemo, useState } from 'react';
import './AccessRegistry.css';

const REGISTRY_KEY = 'fack-checker-agent-registry-v1';

function normalizeEmail(email) {
    return email.trim().toLowerCase();
}

function normalizeName(name) {
    return name.trim().toUpperCase();
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function readRegistry() {
    try {
        const parsed = JSON.parse(localStorage.getItem(REGISTRY_KEY) || '[]');
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function writeRegistry(records) {
    localStorage.setItem(REGISTRY_KEY, JSON.stringify(records));
}

function generateAgentId(email, name) {
    const seed = `${email}:${name}:${Date.now()}`;
    let hash = 0;

    for (let i = 0; i < seed.length; i += 1) {
        hash = ((hash << 5) - hash) + seed.charCodeAt(i);
        hash |= 0;
    }

    return `MV-${Math.abs(hash).toString(36).toUpperCase().padStart(6, '0').slice(0, 6)}`;
}

export default function AccessRegistry({ agentName, onRegistered, onBeginShift, onClose }) {
    const [email, setEmail] = useState('');
    const [registeredAgent, setRegisteredAgent] = useState(null);
    const [error, setError] = useState('');

    const displayName = useMemo(() => normalizeName(agentName || 'UNKNOWN'), [agentName]);

    const handleSubmit = (event) => {
        event.preventDefault();

        const normalizedEmail = normalizeEmail(email);
        if (!isValidEmail(normalizedEmail)) {
            setError('INVALID EMAIL ADDRESS');
            setRegisteredAgent(null);
            return;
        }

        const registry = readRegistry();
        const emailRecord = registry.find(record => record.email === normalizedEmail);
        const nameRecord = registry.find(record => record.name === displayName);

        if (emailRecord && emailRecord.name !== displayName) {
            setError(`EMAIL ALREADY ASSIGNED TO ${emailRecord.name}`);
            setRegisteredAgent(null);
            return;
        }

        if (nameRecord && nameRecord.email !== normalizedEmail) {
            setError(`AGENT NAME ${displayName} IS ALREADY CLAIMED`);
            setRegisteredAgent(null);
            return;
        }

        const record = emailRecord || {
            id: generateAgentId(normalizedEmail, displayName),
            name: displayName,
            email: normalizedEmail,
            createdAt: new Date().toISOString(),
        };

        if (!emailRecord) {
            writeRegistry([...registry, record]);
        }

        setError('');
        setRegisteredAgent(record);
        onRegistered?.(record);
    };

    const handleBeginShift = () => {
        if (!registeredAgent) return;
        onBeginShift?.();
    };

    return (
        <div className="access-registry" id="access-registry">
            <h1 className="access-registry__title glow-text">ACCESS REGISTRY</h1>
            <p className="access-registry__directive">
                Agent name <span>{displayName}</span> requires an email-bound clearance ID.
            </p>

            <form className="access-registry__form" onSubmit={handleSubmit}>
                <label className="access-registry__label" htmlFor="access-email">
                    EMAIL ADDRESS
                </label>
                <input
                    id="access-email"
                    className="access-registry__input"
                    type="email"
                    value={email}
                    onChange={event => setEmail(event.target.value)}
                    placeholder="agent@example.com"
                    autoComplete="email"
                    autoFocus
                />
                <button className="access-registry__btn" type="submit">
                    [ ISSUE ID ]
                </button>
            </form>

            {error && (
                <div className="access-registry__message access-registry__message--error">
                    {error}
                </div>
            )}

            {registeredAgent && (
                <div className="access-registry__card">
                    <div>
                        <span>AGENT</span>
                        <strong>{registeredAgent.name}</strong>
                    </div>
                    <div>
                        <span>CLEARANCE ID</span>
                        <strong>{registeredAgent.id}</strong>
                    </div>
                    <div>
                        <span>EMAIL HASH RECORD</span>
                        <strong>{registeredAgent.email}</strong>
                    </div>
                </div>
            )}

            <div className="access-registry__actions">
                <button className="access-registry__btn access-registry__btn--secondary" type="button" onClick={onClose}>
                    [ RETURN ]
                </button>
                <button
                    className="access-registry__btn"
                    type="button"
                    disabled={!registeredAgent}
                    onClick={handleBeginShift}
                >
                    [ ACCESS SYSTEM ]
                </button>
            </div>
        </div>
    );
}
