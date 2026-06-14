import { useState } from 'react';
import CalendarCalibrator from './CalendarCalibrator';
import CalendarHeader from './CalendarHeader';
import CalendarGrid from './CalendarGrid';
import calendarBg from '../../assets/backgrounds/calendar_bg.webp';
import './Calendar.css';

const DEFAULT_POS = {
    bgSize: 118,
    bgPosX: 50,
    bgPosY: 50,
    headerTop: 20.5,
    headerLeft: 37.0,
    headerWidth: 26.5,
    headerFontSize: 28.5,
    gridTop: 28.0,
    gridLeft: 18.5,
    gridWidth: 64.5,
    gridHeight: 23.0,
    rowGap: 1.0,
    colGap: 0.0,
    shiftDayFontSize: 18.5,
    shiftTitleFontSize: 18.0,
    shiftStateFontSize: 14.5,
    briefTop: 52.5,
    briefLeft: 20.0,
    briefWidth: 61.0,
    briefTitleFontSize: 25.5,
    briefBodyFontSize: 16.0,
    exitBtnBottom: 4.0,
};

const SHIFT_BRIEFS = {
    1: {
        title: 'Orientation Shift',
        status: 'Active intake protocol',
        note: 'Learn the flow, inspect claims carefully, and watch for photo evidence in the queue.',
    },
    2: {
        title: 'Verification Pressure',
        status: 'Expanded archive review',
        note: 'More football claims enter rotation. Keep trust stable and avoid careless approvals.',
    },
    3: {
        title: 'Final Audit',
        status: 'Presentation deadline',
        note: 'Final demo shift. Your completed run is submitted to the real leaderboard.',
    },
};

export default function CalendarPage({ day = 1, debug = false, onClose }) {
    const [pos, setPos] = useState(DEFAULT_POS);
    const safeDay = Math.max(1, Math.min(3, day || 1));
    const currentBrief = SHIFT_BRIEFS[safeDay];
    const briefStyle = {
        top: `${pos.briefTop}%`,
        left: `${pos.briefLeft}%`,
        width: `${pos.briefWidth}%`,
        '--calendar-brief-title-size': `${pos.briefTitleFontSize}px`,
        '--calendar-brief-body-size': `${pos.briefBodyFontSize}px`,
    };

    return (
        <div className="calendar-window">
            {debug && <CalendarCalibrator pos={pos} setPos={setPos} />}

            <div
                className="calendar-window__content"
                style={{
                    backgroundImage: `url(${calendarBg})`,
                    backgroundSize: `${pos.bgSize}%`,
                    backgroundPosition: `${pos.bgPosX}% ${pos.bgPosY}%`,
                }}
            >
                <CalendarHeader pos={pos} />
                <CalendarGrid pos={pos} day={safeDay} />

                <section className="calendar-brief" style={briefStyle} aria-label="Shift brief">
                    <div className="calendar-brief__eyebrow">CURRENT SHIFT</div>
                    <h3>{currentBrief.title}</h3>
                    <p className="calendar-brief__status">{currentBrief.status}</p>
                    <dl>
                        <div>
                            <dt>Quota</dt>
                            <dd>8 required</dd>
                        </div>
                        <div>
                            <dt>Time</dt>
                            <dd>02:00</dd>
                        </div>
                        <div>
                            <dt>Evidence</dt>
                            <dd>Text + photo cases</dd>
                        </div>
                    </dl>
                    <p className="calendar-brief__note">{currentBrief.note}</p>
                </section>
            </div>

            <button
                className="calendar-window__exit-btn"
                style={{ bottom: `${pos.exitBtnBottom}%` }}
                onClick={onClose}
            >
                [ CLOSE CALENDAR ]
            </button>
        </div>
    );
}
