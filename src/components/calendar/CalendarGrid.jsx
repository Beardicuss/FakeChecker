import { useState, useEffect } from 'react';

export default function CalendarGrid({ pos, isDebug }) {
    const totalDays = 30; // June has 30 days
    const days = Array.from({ length: totalDays }, (_, i) => i + 1);
    const currentDay = new Date().getDate(); // Dynamically matches real world time (e.g. 12)

    const [events, setEvents] = useState([]);

    useEffect(() => {
        const API_URL = import.meta.env.VITE_AI_WORKER_URL || 'http://127.0.0.1:8787';
        fetch(`${API_URL}/api/daily`)
            .then(res => res.json())
            .then(data => {
                if (data && data.questions) {
                    // Map generated AI questions to the real world days ahead
                    const today = new Date().getDate();
                    setEvents([today, today + 1, today + 2, today + 3, today + 4]);
                }
            })
            .catch(err => console.error(err));
    }, []);
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
                    className={`calendar-day ${day === currentDay ? 'calendar-day--current' : ''} ${events.includes(day) ? 'calendar-day--event' : ''}`}
                >
                    {day}
                    {events.includes(day) && <div className="calendar-day__dot"></div>}
                </div>
            ))}
        </div>
    );
}
