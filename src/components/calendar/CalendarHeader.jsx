import React from 'react';

export default function CalendarHeader({ pos, isDebug }) {
    const month = "JUNE";
    const year = "2026";

    const debugStyle = isDebug ? {
        top: `${pos.headerTop}%`,
        left: `${pos.headerLeft}%`,
        width: `${pos.headerWidth}%`,
        position: 'absolute',
        display: 'flex',
        justifyContent: 'space-between',
        color: '#fff',
        fontFamily: 'monospace',
        fontSize: '24px',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: '2px',
        background: 'rgba(255,0,0,0.2)'
    } : undefined;

    return (
        <div className="calendar-header" style={debugStyle}>
            <span>{month}</span>
            <span>{year}</span>
        </div>
    );
}
