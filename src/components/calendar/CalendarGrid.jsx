import React from 'react';

export default function CalendarGrid({ pos, isDebug }) {
    const totalDays = 30; // June has 30 days
    const days = Array.from({ length: totalDays }, (_, i) => i + 1);
    const currentDay = 11; // June 11, 2026

    const debugStyle = isDebug ? {
        position: 'absolute',
        top: `${pos.gridTop}%`,
        left: `${pos.gridLeft}%`,
        width: `${pos.gridWidth}%`,
        height: `${pos.gridHeight}%`,
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gridTemplateRows: 'repeat(5, 1fr)',
        gap: `${pos.rowGap}% ${pos.colGap}%`,
        background: 'rgba(0,255,0,0.1)'
    } : undefined;

    return (
        <div className="calendar-grid" style={debugStyle}>
            {days.map(day => (
                <div
                    key={day}
                    className={`calendar-day ${day === currentDay ? 'calendar-day--current' : ''}`}
                >
                    {day}
                </div>
            ))}
        </div>
    );
}
