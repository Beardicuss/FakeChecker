import trueIcon from '../assets/icons/true.webp';
import fakeIcon from '../assets/icons/fake.webp';
import skipIcon from '../assets/icons/skip.webp';
import './DecisionButtons.css';

/**
 * TRUE / FAKE / SKIP action buttons.
 */
export default function DecisionButtons({ onDecision, disabled }) {
    return (
        <div className="decision-buttons" id="decision-buttons">
            <button
                className="decision-btn decision-btn--true"
                onClick={() => onDecision('TRUE')}
                disabled={disabled}
                id="btn-true"
            >
                <img src={trueIcon} alt="True" className="decision-btn__icon" />
                TRUE
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
