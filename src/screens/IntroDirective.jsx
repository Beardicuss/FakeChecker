import { useState } from 'react';
import './IntroDirective.css';

const INTRO_TEXT = `Citizen-Agent, you have been selected for service in the Ministry of Verity.

Your task is precise, vital, and without appeal: classify incoming information before it contaminates public record.

Each day, civilian reports, match claims, leaked statements, altered media, and unstable rumors will pass across your desk. Some are TRUE. Some are FAKE. If the evidence is unclear, you may SKIP the package, but hesitation is recorded. You will distinguish evidence from noise, distortion from error, and uncertainty from deception.

Inspect sources. Compare timelines. Notice missing confirmations, exaggerated language, anonymous claims, and records that contradict official archives. A careless stamp can strengthen a lie. A delayed stamp can let doubt spread.

Remain alert: the machine that supports your labor is old, fragile, and prone to failure. When it falters, restore it quickly through technical procedure. Delay is dangerous. Error is recorded.

Remember: The People trust the Ministry. The Ministry trusts you. Fail, and disorder will multiply. Succeed, and the light of Verity will shine brighter.

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

