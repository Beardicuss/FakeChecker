import { useState } from 'react';
import leaderboardBg from '../../assets/leaderboard/background.webp';
import buttonBg from '../../assets/leaderboard/button.webp';
import cupIcon from '../../assets/leaderboard/cup.webp';
import closeIcon from '../../assets/leaderboard/close.webp';
import globalIcon from '../../assets/leaderboard/global.webp';
import dailyIcon from '../../assets/leaderboard/daily.webp';
import userIcon from '../../assets/leaderboard/user.webp';
import weeklyIcon from '../../assets/leaderboard/weekly.webp';
import './Leaderboard.css';

const LEADERBOARD_ROWS = [
    { rank: 1, player: 'DANTE', score: '9,850', date: '2026-06-13' },
    { rank: 2, player: 'PIXELMASTER', score: '7,420', date: '2026-06-12' },
    { rank: 3, player: 'RETRO_GAMER', score: '6,310', date: '2026-06-11' },
    { rank: 4, player: '8BIT_KING', score: '5,780', date: '2026-06-10' },
    { rank: 5, player: 'GAME_OVER', score: '4,590', date: '2026-06-09' },
];

const TABS = [
    { id: 'global', label: 'Global', icon: globalIcon },
    { id: 'daily', label: 'Daily', icon: dailyIcon },
    { id: 'weekly', label: 'Weekly', icon: weeklyIcon },
];

// Default layout config
const DEFAULT_CONFIG = {
    panelWidth: 810,
    panelHeight: 650,
    bgSize: '100% 100%',
    bgPosX: 'center',
    bgPosY: 'center',
    cupTop: 9.4,
    cupLeft: 6.6,
    cupWidth: 7.8,
    cupHeight: 9.5,
    closeTop: 5.3,
    closeRight: 4.7,
    closeWidth: 6,
    closeHeight: 9,
    tabsLeft: 9.3,
    tabsBottom: 7.9,
    tabsWidth: 81.7,
    tabHeight: 61,
    tabIconSize: 35,
    tabFontSize: 31,
    tabGap: 18,
};

const DEBUG = false;
function DebugPanel({ config, setConfig }) {
    const makeSlider = (label, key, min, max, step = 0.1, unit = '%') => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <label style={{ width: 110, fontSize: 11 }}>{label}:</label>
            <input
                type="range" min={min} max={max} step={step}
                value={config[key]}
                onChange={e => setConfig(prev => ({ ...prev, [key]: Number(e.target.value) }))}
                style={{ flex: 1 }}
            />
            <span style={{ width: 55, fontSize: 11, textAlign: 'right' }}>{config[key]}{unit}</span>
        </div>
    );

    return (
        <div style={{
            position: 'fixed', top: 10, right: 10, zIndex: 100000,
            background: 'rgba(0,0,0,0.92)', color: '#0f0', padding: 12,
            borderRadius: 6, border: '1px solid #0f0', fontFamily: 'monospace',
            fontSize: 11, width: 340, maxHeight: '90vh', overflowY: 'auto',
        }}>
            <div style={{ fontWeight: 'bold', fontSize: 13, marginBottom: 8, textAlign: 'center' }}>
                🎛️ LEADERBOARD DEBUG
            </div>

            <div style={{ borderBottom: '1px solid #0f04', marginBottom: 6, paddingBottom: 4, fontWeight: 'bold' }}>Panel</div>
            {makeSlider('Panel Width', 'panelWidth', 400, 2000, 10, 'px')}
            {makeSlider('Panel Height', 'panelHeight', 200, 1500, 10, 'px')}

            <div style={{ borderBottom: '1px solid #0f04', marginBottom: 6, paddingBottom: 4, fontWeight: 'bold' }}>Cup Icon</div>
            {makeSlider('Cup Top', 'cupTop', 0, 30)}
            {makeSlider('Cup Left', 'cupLeft', 0, 30)}
            {makeSlider('Cup W', 'cupWidth', 2, 20)}
            {makeSlider('Cup H', 'cupHeight', 2, 20)}

            <div style={{ borderBottom: '1px solid #0f04', marginBottom: 6, paddingBottom: 4, fontWeight: 'bold' }}>Close Button</div>
            {makeSlider('Close Top', 'closeTop', 0, 30)}
            {makeSlider('Close Right', 'closeRight', 0, 30)}
            {makeSlider('Close W', 'closeWidth', 2, 20)}
            {makeSlider('Close H', 'closeHeight', 2, 20)}

            <div style={{ borderBottom: '1px solid #0f04', marginBottom: 6, paddingBottom: 4, fontWeight: 'bold' }}>Tabs Bar</div>
            {makeSlider('Tabs Left', 'tabsLeft', 0, 30)}
            {makeSlider('Tabs Bottom', 'tabsBottom', 0, 20)}
            {makeSlider('Tabs Width', 'tabsWidth', 30, 100)}
            {makeSlider('Tab Height', 'tabHeight', 20, 100, 1, 'px')}
            {makeSlider('Tab Icon', 'tabIconSize', 10, 80, 1, 'px')}
            {makeSlider('Tab Font', 'tabFontSize', 8, 36, 1, 'px')}
            {makeSlider('Tab Gap', 'tabGap', 0, 40, 1, 'px')}

            <button
                style={{ marginTop: 8, padding: '4px 10px', background: '#0f0', color: '#000', border: 'none', cursor: 'pointer', fontFamily: 'monospace', width: '100%' }}
                onClick={() => {
                    const output = {};
                    for (const [k, v] of Object.entries(config)) output[k] = v;
                    navigator.clipboard.writeText(JSON.stringify(output, null, 2));
                }}
            >
                📋 Copy Config JSON
            </button>
        </div>
    );
}

export default function LeaderboardPage({ onClose }) {
    const [activeTab, setActiveTab] = useState('global');
    const [config, setConfig] = useState(DEFAULT_CONFIG);

    const c = DEBUG ? config : DEFAULT_CONFIG;

    return (
        <div className="leaderboard-window">
            {DEBUG && <DebugPanel config={config} setConfig={setConfig} />}
            <div
                className="leaderboard-window__panel"
                style={{
                    backgroundImage: `url(${leaderboardBg})`,
                    width: `${c.panelWidth}px`,
                    height: `${c.panelHeight}px`,
                    minWidth: `${c.panelWidth}px`,
                    minHeight: `${c.panelHeight}px`,
                    flexShrink: 0,
                    aspectRatio: 'auto',
                    backgroundSize: c.bgSize,
                    backgroundPosition: `${c.bgPosX} ${c.bgPosY}`,
                }}
            >
                <img
                    className="leaderboard-window__cup"
                    src={cupIcon}
                    alt=""
                    style={{ top: `${c.cupTop}%`, left: `${c.cupLeft}%`, width: `${c.cupWidth}%`, height: `${c.cupHeight}%` }}
                />
                <button
                    className="leaderboard-window__close"
                    onClick={onClose}
                    aria-label="Close leaderboard"
                    style={{ top: `${c.closeTop}%`, right: `${c.closeRight}%`, width: `${c.closeWidth}%`, height: `${c.closeHeight}%` }}
                >
                    <img src={closeIcon} alt="" />
                </button>

                <h2 className="leaderboard-window__title">Leaderboard</h2>

                <div className="leaderboard-window__headers" aria-hidden="true">
                    <span>Rank</span>
                    <span>Player</span>
                    <span>Score</span>
                    <span>Date</span>
                </div>

                <div className="leaderboard-window__rows">
                    {LEADERBOARD_ROWS.map(row => (
                        <div className="leaderboard-window__row" key={`${activeTab}-${row.rank}`}>
                            <span className={`leaderboard-window__rank leaderboard-window__rank--${row.rank}`}>
                                {row.rank}
                            </span>
                            <span className="leaderboard-window__player">
                                <img src={userIcon} alt="" />
                                {row.player}
                            </span>
                            <span className="leaderboard-window__score">{row.score}</span>
                            <span className="leaderboard-window__date">{row.date}</span>
                        </div>
                    ))}
                </div>

                <div
                    className="leaderboard-window__tabs"
                    style={{
                        left: `${c.tabsLeft}%`,
                        bottom: `${c.tabsBottom}%`,
                        width: `${c.tabsWidth}%`,
                        gap: `${c.tabGap}px`,
                    }}
                >
                    {TABS.map(tab => (
                        <button
                            className={`leaderboard-window__tab ${activeTab === tab.id ? 'leaderboard-window__tab--active' : ''}`}
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                backgroundImage: `url(${buttonBg})`,
                                height: `${c.tabHeight}px`,
                                fontSize: `${c.tabFontSize}px`,
                            }}
                        >
                            <img src={tab.icon} alt="" style={{ width: `${c.tabIconSize}px`, height: `${c.tabIconSize}px` }} />
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
