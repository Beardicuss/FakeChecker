const SHIFTS = [
    { day: 1, title: 'Orientation' },
    { day: 2, title: 'Pressure' },
    { day: 3, title: 'Final Audit' },
];

export default function CalendarGrid({ day = 1, pos }) {
    const gridStyle = {
        top: `${pos.gridTop}%`,
        left: `${pos.gridLeft}%`,
        width: `${pos.gridWidth}%`,
        height: `${pos.gridHeight}%`,
        gap: `${pos.rowGap}% ${pos.colGap}%`,
        '--calendar-shift-day-size': `${pos.shiftDayFontSize}px`,
        '--calendar-shift-title-size': `${pos.shiftTitleFontSize}px`,
        '--calendar-shift-state-size': `${pos.shiftStateFontSize}px`,
    };

    return (
        <div className="calendar-grid calendar-grid--shifts" style={gridStyle}>
            {SHIFTS.map(shift => {
                const state = shift.day < day ? 'complete' : shift.day === day ? 'active' : 'upcoming';
                return (
                    <div key={shift.day} className={`calendar-shift calendar-shift--${state}`}>
                        <span className="calendar-shift__day">DAY {shift.day}</span>
                        <strong>{shift.title}</strong>
                        <span className="calendar-shift__state">
                            {state === 'complete' ? 'COMPLETED' : state === 'active' ? 'IN PROGRESS' : 'LOCKED'}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}
