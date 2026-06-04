import React from 'react';
import trueIcon from '../assets/icons/true.png';
import fakeIcon from '../assets/icons/fake.png';
import skipIcon from '../assets/icons/skip.png';
import './DecisionButtons.css';

/**
 * REAL / FAKE / SKIP action buttons with custom pixel-art icons.
 */
export default function DecisionButtons({ onDecision, disabled }) {
    return (
        <div className="decision-buttons" id="decision-buttons">
            <button
                className="decision-btn decision-btn--real"
                onClick={() => onDecision('REAL')}
                disabled={disabled}
                id="btn-real"
            >
                <img src={trueIcon} alt="Real" className="decision-btn__icon" />
                REAL
            </button>
            <button
                className="decision-btn decision-btn--fake"
                onClick={() => onDecision('FAKE')}
                disabled={disabled}
                id="btn-fake"
            >
                <img src={fakeIcon} alt="Fake" className="decision-btn__icon" />
                FAKE
            </button>
            <button
                className="decision-btn decision-btn--skip"
                onClick={() => onDecision('SKIP')}
                disabled={disabled}
                id="btn-skip"
            >
                <img src={skipIcon} alt="Skip" className="decision-btn__icon" />
                SKIP
            </button>
        </div>
    );
}
