import { useState } from 'react';
import CalendarHeader from './CalendarHeader';
import CalendarGrid from './CalendarGrid';
import calendarBg from '../../assets/backgrounds/calendar_bg.webp';
import './Calendar.css';

const DEBUG = false; // Set to true to re-calibrate

const DEFAULT_POS = {
    headerTop: 21.5,
    headerLeft: 33.5,
    headerWidth: 34.0,
    gridTop: 27.5,
    gridLeft: 25.5,
    gridWidth: 49.5,
    gridHeight: 53.5,
    rowGap: 0.5,
    colGap: 0.5,
    exitBtnBottom: 1.0,  // Added exit button bottom positioning
};

export default function CalendarPage({ onClose }) {
    const [pos] = useState(DEFAULT_POS);

    return (
        <div className="calendar-window">
            {/* DEBUG && <CalendarCalibrator pos={pos} setPos={setPos} /> */}

            <div className="calendar-window__content" style={{ backgroundImage: `url(${calendarBg})` }}>
                <CalendarHeader pos={pos} isDebug={DEBUG} />
                <CalendarGrid pos={pos} isDebug={DEBUG} />
            </div>

            <button
                className="calendar-window__exit-btn"
                style={DEBUG ? { bottom: `${pos.exitBtnBottom}%` } : undefined}
                onClick={onClose}
            >
                [ CLOSE CALENDAR ]
            </button>
        </div>
    );
}
