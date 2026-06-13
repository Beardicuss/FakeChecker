import trueIcon from '../assets/icons/true.webp';
import fakeIcon from '../assets/icons/fake.webp';
import misleadingIcon from '../assets/icons/misleading.webp';
import unverifiedIcon from '../assets/icons/unverified.webp';
import './DecisionButtons.css';

/**
 * TRUE / FALSE / MISLEADING / UNVERIFIED action buttons.
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
                className="decision-btn decision-btn--false"
                onClick={() => onDecision('FALSE')}
                disabled={disabled}
                id="btn-false"
            >
                <img src={fakeIcon} alt="False" className="decision-btn__icon" />
                FALSE
            </button>
            <button
                className="decision-btn decision-btn--misleading"
                onClick={() => onDecision('MISLEADING')}
                disabled={disabled}
                id="btn-misleading"
            >
                <img src={misleadingIcon} alt="Misleading" className="decision-btn__icon" />
                MISLEADING
            </button>
            <button
                className="decision-btn decision-btn--unverified"
                onClick={() => onDecision('UNVERIFIED')}
                disabled={disabled}
                id="btn-unverified"
            >
                <img src={unverifiedIcon} alt="Unverified" className="decision-btn__icon" />
                UNVERIFIED
            </button>
        </div>
    );
}
