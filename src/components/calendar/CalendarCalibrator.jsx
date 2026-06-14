import { useState } from 'react';

const panelStyle = {
    position: 'fixed',
    top: 10,
    right: 10,
    zIndex: 9999,
    width: 360,
    maxHeight: '92vh',
    overflowY: 'auto',
    background: 'rgba(0,0,0,0.9)',
    border: '1px solid #cc2222',
    borderRadius: 8,
    padding: '10px 14px',
    color: '#ddd',
    fontFamily: 'monospace',
    fontSize: 11,
    textAlign: 'left',
};

const rowStyle = { display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 };
const labelStyle = { width: 132, flexShrink: 0, color: '#aaa' };
const valStyle = { width: 48, textAlign: 'right', color: '#fff' };

function Slider({ label, value, onChange, min = 0, max = 120, step = 0.5 }) {
    return (
        <div style={rowStyle}>
            <span style={labelStyle}>{label}</span>
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={event => onChange(parseFloat(event.target.value))}
                style={{ flex: 1 }}
            />
            <span style={valStyle}>{Number(value).toFixed(1)}</span>
        </div>
    );
}

function Section({ children, title }) {
    return (
        <section style={{ marginTop: 10 }}>
            <div style={{ color: '#cc2222', marginBottom: 5, letterSpacing: 1 }}>{title}</div>
            {children}
        </section>
    );
}

export default function CalendarCalibrator({ pos, setPos }) {
    const [copied, setCopied] = useState(false);
    const update = (key, value) => setPos(prev => ({ ...prev, [key]: value }));

    const css = `.calendar-window__content {
    background-size: ${pos.bgSize.toFixed(1)}%;
    background-position: ${pos.bgPosX.toFixed(1)}% ${pos.bgPosY.toFixed(1)}%;
}
.calendar-header {
    top: ${pos.headerTop.toFixed(1)}%;
    left: ${pos.headerLeft.toFixed(1)}%;
    width: ${pos.headerWidth.toFixed(1)}%;
    font-size: ${pos.headerFontSize.toFixed(1)}px;
}
.calendar-grid--shifts {
    top: ${pos.gridTop.toFixed(1)}%;
    left: ${pos.gridLeft.toFixed(1)}%;
    width: ${pos.gridWidth.toFixed(1)}%;
    height: ${pos.gridHeight.toFixed(1)}%;
    gap: ${pos.rowGap.toFixed(1)}% ${pos.colGap.toFixed(1)}%;
}
.calendar-shift__day { font-size: ${pos.shiftDayFontSize.toFixed(1)}px; }
.calendar-shift strong { font-size: ${pos.shiftTitleFontSize.toFixed(1)}px; }
.calendar-shift__state { font-size: ${pos.shiftStateFontSize.toFixed(1)}px; }
.calendar-brief {
    top: ${pos.briefTop.toFixed(1)}%;
    left: ${pos.briefLeft.toFixed(1)}%;
    width: ${pos.briefWidth.toFixed(1)}%;
}
.calendar-brief h3 { font-size: ${pos.briefTitleFontSize.toFixed(1)}px; }
.calendar-brief__status,
.calendar-brief__note { font-size: ${pos.briefBodyFontSize.toFixed(1)}px; }
.calendar-window__exit-btn { bottom: ${pos.exitBtnBottom.toFixed(1)}%; }`;

    const copy = () => {
        navigator.clipboard.writeText(css);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    return (
        <div style={panelStyle} onClick={event => event.stopPropagation()}>
            <div style={{ color: '#ffdddd', fontWeight: 'bold', marginBottom: 8 }}>
                CALENDAR DEBUG PANEL
            </div>

            <Section title="BACKGROUND">
                <Slider label="BG Size" value={pos.bgSize} onChange={value => update('bgSize', value)} min={60} max={160} />
                <Slider label="BG Pos X" value={pos.bgPosX} onChange={value => update('bgPosX', value)} min={0} max={100} />
                <Slider label="BG Pos Y" value={pos.bgPosY} onChange={value => update('bgPosY', value)} min={0} max={100} />
            </Section>

            <Section title="HEADER TEXT">
                <Slider label="Header Top" value={pos.headerTop} onChange={value => update('headerTop', value)} />
                <Slider label="Header Left" value={pos.headerLeft} onChange={value => update('headerLeft', value)} />
                <Slider label="Header Width" value={pos.headerWidth} onChange={value => update('headerWidth', value)} />
                <Slider label="Header Size" value={pos.headerFontSize} onChange={value => update('headerFontSize', value)} min={10} max={40} />
            </Section>

            <Section title="SHIFT CARDS">
                <Slider label="Cards Top" value={pos.gridTop} onChange={value => update('gridTop', value)} />
                <Slider label="Cards Left" value={pos.gridLeft} onChange={value => update('gridLeft', value)} />
                <Slider label="Cards Width" value={pos.gridWidth} onChange={value => update('gridWidth', value)} />
                <Slider label="Cards Height" value={pos.gridHeight} onChange={value => update('gridHeight', value)} />
                <Slider label="Row Gap" value={pos.rowGap} onChange={value => update('rowGap', value)} min={0} max={12} />
                <Slider label="Col Gap" value={pos.colGap} onChange={value => update('colGap', value)} min={0} max={12} />
                <Slider label="Day Text Size" value={pos.shiftDayFontSize} onChange={value => update('shiftDayFontSize', value)} min={8} max={28} />
                <Slider label="Title Size" value={pos.shiftTitleFontSize} onChange={value => update('shiftTitleFontSize', value)} min={8} max={30} />
                <Slider label="State Size" value={pos.shiftStateFontSize} onChange={value => update('shiftStateFontSize', value)} min={8} max={24} />
            </Section>

            <Section title="BRIEF TEXT">
                <Slider label="Brief Top" value={pos.briefTop} onChange={value => update('briefTop', value)} />
                <Slider label="Brief Left" value={pos.briefLeft} onChange={value => update('briefLeft', value)} />
                <Slider label="Brief Width" value={pos.briefWidth} onChange={value => update('briefWidth', value)} />
                <Slider label="Brief Title Size" value={pos.briefTitleFontSize} onChange={value => update('briefTitleFontSize', value)} min={10} max={42} />
                <Slider label="Brief Body Size" value={pos.briefBodyFontSize} onChange={value => update('briefBodyFontSize', value)} min={8} max={26} />
            </Section>

            <Section title="EXIT BUTTON">
                <Slider label="Button Bottom" value={pos.exitBtnBottom} onChange={value => update('exitBtnBottom', value)} min={-10} max={30} />
            </Section>

            <button
                onClick={copy}
                style={{
                    width: '100%',
                    marginTop: 10,
                    padding: '7px 0',
                    background: copied ? '#173d17' : '#241414',
                    border: '1px solid #cc2222',
                    color: copied ? '#66ff66' : '#eee',
                    cursor: 'pointer',
                    fontFamily: 'monospace',
                    fontSize: 11,
                }}
            >
                {copied ? 'COPIED CSS' : 'COPY CSS OVERRIDES'}
            </button>
        </div>
    );
}
