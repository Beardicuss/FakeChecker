import { useState } from 'react';

const panelStyle = {
    position: 'fixed', top: 10, right: 10, zIndex: 9999,
    background: 'rgba(0,0,0,0.88)', border: '1px solid #444',
    borderRadius: 8, padding: '10px 14px', width: 320,
    fontFamily: 'monospace', fontSize: 11, color: '#ccc',
    maxHeight: '90vh', overflowY: 'auto',
    textAlign: 'left'
};

const rowStyle = { display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 };
const labelStyle = { width: 110, flexShrink: 0, color: '#888' };
const valStyle = { width: 44, textAlign: 'right', color: '#fff' };

function Slider({ label, value, onChange, min = 0, max = 120, step = 0.5 }) {
    return (
        <div style={rowStyle}>
            <span style={labelStyle}>{label}</span>
            <input
                type="range" min={min} max={max} step={step}
                value={value}
                onChange={e => onChange(parseFloat(e.target.value))}
                style={{ flex: 1 }}
            />
            <span style={valStyle}>{value.toFixed(1)}</span>
        </div>
    );
}

export default function CalendarCalibrator({ pos, setPos }) {
    const [copied, setCopied] = useState(false);

    const update = (key, val) => setPos(p => ({ ...p, [key]: val }));

    const css = `
.calendar-grid {
    top: ${pos.gridTop.toFixed(1)}%;
    left: ${pos.gridLeft.toFixed(1)}%;
    width: ${pos.gridWidth.toFixed(1)}%;
    height: ${pos.gridHeight.toFixed(1)}%;
    gap: ${pos.rowGap.toFixed(1)}% ${pos.colGap.toFixed(1)}%;
}
.calendar-header {
    top: ${pos.headerTop.toFixed(1)}%;
    left: ${pos.headerLeft.toFixed(1)}%;
    width: ${pos.headerWidth.toFixed(1)}%;
}
.calendar-window__exit-btn {
    bottom: ${pos.exitBtnBottom.toFixed(1)}%;
}
`;

    const copy = () => {
        navigator.clipboard.writeText(css);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    return (
        <div style={panelStyle} onClick={e => e.stopPropagation()}>
            <div style={{ color: '#ff6644', fontWeight: 'bold', marginBottom: 8 }}>⚙ CALENDAR CALIBRATOR</div>

            <div style={{ color: '#44aaff', margin: '8px 0 4px' }}>— TITLE HEADER —</div>
            <Slider label="Header Top" value={pos.headerTop} onChange={v => update('headerTop', v)} />
            <Slider label="Header Left" value={pos.headerLeft} onChange={v => update('headerLeft', v)} />
            <Slider label="Header Width" value={pos.headerWidth} onChange={v => update('headerWidth', v)} />

            <div style={{ color: '#ff9944', margin: '12px 0 4px' }}>— DATE GRID —</div>
            <Slider label="Grid Top" value={pos.gridTop} onChange={v => update('gridTop', v)} />
            <Slider label="Grid Left" value={pos.gridLeft} onChange={v => update('gridLeft', v)} />
            <Slider label="Grid Width" value={pos.gridWidth} onChange={v => update('gridWidth', v)} />
            <Slider label="Grid Height" value={pos.gridHeight} onChange={v => update('gridHeight', v)} />
            <Slider label="Row Gap" value={pos.rowGap} onChange={v => update('rowGap', v)} min={0} max={20} />
            <Slider label="Col Gap" value={pos.colGap} onChange={v => update('colGap', v)} min={0} max={20} />

            <div style={{ color: '#ff44ff', margin: '12px 0 4px' }}>— EXIT BUTTON —</div>
            <Slider label="Button Bottom" value={pos.exitBtnBottom} onChange={v => update('exitBtnBottom', v)} min={-20} max={100} />

            <div style={{ marginTop: 10, borderTop: '1px solid #333', paddingTop: 8 }}>
                <button
                    onClick={copy}
                    style={{
                        width: '100%', padding: '6px 0', background: copied ? '#1a4a1a' : '#1a1a2a',
                        border: '1px solid #444', borderRadius: 4, color: copied ? '#44ff44' : '#ccc',
                        cursor: 'pointer', fontFamily: 'monospace', fontSize: 11,
                    }}
                >
                    {copied ? '✓ COPIED CSS!' : '⧉ COPY CSS OVERRIDES'}
                </button>
                <div style={{ marginTop: 6, color: '#555', fontSize: 10 }}>
                    Paste into Calendar.css, then set DEBUG=false
                </div>
            </div>
        </div>
    );
}
