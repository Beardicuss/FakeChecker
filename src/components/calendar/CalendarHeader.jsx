
export default function CalendarHeader({ pos }) {
    const month = "JUNE";
    const year = "2026";

    const headerStyle = {
        top: `${pos.headerTop}%`,
        left: `${pos.headerLeft}%`,
        width: `${pos.headerWidth}%`,
        fontSize: `${pos.headerFontSize}px`,
    };

    return (
        <div className="calendar-header" style={headerStyle}>
            <span>{month}</span>
            <span>{year}</span>
        </div>
    );
}
