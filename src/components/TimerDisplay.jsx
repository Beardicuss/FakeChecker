import hourglassIcon from '../assets/icons/hourglass.webp';
import { formatTime } from '../utils/formatTime';
import './TimerDisplay.css';

/**
 * Countdown clock with hourglass icon and red flash warning.
 */
export default function TimerDisplay({ seconds, isLowTime }) {
    return (
        <div className={`timer-display ${isLowTime ? 'timer-display--low' : ''}`} id="timer-display">
            <img src={hourglassIcon} alt="Timer" className="timer-display__icon" />
            <div className="timer-display__info">
                <label className="timer-display__label">SHIFT TIME</label>
                <span className="timer-display__time">{formatTime(seconds)}</span>
            </div>
        </div>
    );
}
