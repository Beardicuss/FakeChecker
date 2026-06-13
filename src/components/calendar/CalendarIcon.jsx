import calendarImg from '../../assets/icons/calendar.webp';
import './CalendarIcon.css';

/**
 * Clickable calendar icon with optional "new" indicator.
 */
export default function CalendarIcon({ hasNew, onClick }) {
    return (
        <button
            className={`calendar-icon ${hasNew ? 'calendar-icon--new' : ''}`}
            onClick={onClick}
            aria-label="Open calendar"
            id="calendar-icon"
        >
            <img src={calendarImg} alt="Calendar" className="calendar-icon__img" />
            {hasNew && <span className="calendar-icon__badge">!</span>}
        </button>
    );
}
