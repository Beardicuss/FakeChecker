import React, { useState } from 'react';
import './IntroDirective.css';

const INTRO_TEXT = `Citizen-Agent, you have been selected for service in the Ministry of Verity.

Your task is simple, yet vital: separate Truth from Falsehood.

Each day, information will flow across your desk. Some of it is pure, some is poisoned. You must decide what is TRUE ✅ and what is FAKE ❌. Your judgment will directly affect the stability of the System.

⚠ Remain alert: the machine that supports your labor is old, fragile, and will betray you with failures. When it does, you must restore it quickly through technical procedures. Delay is dangerous. Error is unforgivable.

Remember: The People trust the Ministry. The Ministry trusts you. Fail, and doubt will spread. Succeed, and the light of Verity will shine brighter.

Your vigilance is our strength.

To begin your service, you must acknowledge and accept these terms. Refusal is noted as non-cooperation.`;

/**
 * Ministry intro document with checkbox acceptance.
 */
export default function IntroDirective({ onAccept }) {
    const [accepted, setAccepted] = useState(false);

    return (
        <div className="intro-directive" id="intro-directive">
            <h1 className="intro-directive__header glow-text">
                MINISTRY OF VERITY — DIRECTIVE №1
            </h1>
            <div className="intro-directive__scroll">
                {INTRO_TEXT.split('\n\n').map((para, i) => (
                    <p key={i} className="intro-directive__para">{para}</p>
                ))}
            </div>
            <div className="intro-directive__footer">
                <label className="intro-directive__checkbox-label">
                    <input
                        type="checkbox"
                        checked={accepted}
                        onChange={e => setAccepted(e.target.checked)}
                        className="intro-directive__checkbox"
                        id="accept-checkbox"
                    />
                    I agree to the terms outlined in this document
                </label>
                <button
                    className="intro-directive__btn"
                    disabled={!accepted}
                    onClick={onAccept}
                    id="btn-accept-terms"
                >
                    [ ACCEPT TERMS ]
                </button>
            </div>
        </div>
    );
}
