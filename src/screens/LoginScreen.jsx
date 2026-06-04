import React, { useState } from 'react';
import './LoginScreen.css';

/**
 * Login screen — Agent code + password entry.
 */
export default function LoginScreen({ agentName, onLogin }) {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (password.toUpperCase() === 'TRUTH-7A') {
            setError('');
            onLogin();
        } else {
            setError('ACCESS DENIED — Invalid credentials.');
        }
    };

    return (
        <div className="login-screen" id="login-screen">
            <h1 className="login-screen__title glow-text">SYSTEM LOGIN</h1>
            <div className="login-screen__info">
                <span className="login-screen__label">AGENT:</span>
                <span className="login-screen__value">{agentName}</span>
            </div>
            <form className="login-screen__form" onSubmit={handleSubmit}>
                <div className="login-screen__field">
                    <label className="login-screen__label" htmlFor="login-password">PASSWORD:</label>
                    <input
                        className="login-screen__input"
                        type="text"
                        id="login-password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="Enter access code..."
                        autoFocus
                    />
                </div>
                {error && <div className="login-screen__error">{error}</div>}
                <button className="login-screen__btn" type="submit" id="btn-login">
                    [ LOGIN ]
                </button>
            </form>
            <div className="login-screen__hint">
                Check your Internal Mail for credentials.
            </div>
        </div>
    );
}
