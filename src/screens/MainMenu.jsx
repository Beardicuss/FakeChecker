import { useState, useEffect, useRef } from 'react';
import emblemImg from '../assets/backgrounds/ministry-emblem.png';
import qrIcon from '../assets/icons/QR_icon.jpg';
import verityIcon from '../assets/icons/verity-icon.png';
import mailIcon from '../assets/icons/mail.png';
import settingsIcon from '../assets/icons/settings.png';
import trustLowIcon from '../assets/icons/trust-low.png';
import trustMediumIcon from '../assets/icons/trust-medium.png';
import trustHighIcon from '../assets/icons/trust-high.png';
import mainTheme from '../assets/audio/main-theme.mp3';
import terminalWakeSfx from '../assets/audio/terminal_wake.mp3';
import calendarIcon from '../assets/icons/calendar.png';
import creditsIcon from '../assets/icons/credits.png';
import howToPlayIcon from '../assets/icons/how_to_play.png';
import leaderboardIcon from '../assets/icons/leaderboard.png';
import gameBgVideo from '../assets/backgrounds/game-background.webm';
import monitorBg1 from '../assets/backgrounds/menu_monitor.webp';
import monitorBg2 from '../assets/backgrounds/menu_monitor2.webp';
import mailMonitorBg from '../assets/backgrounds/mail_monitor.webp';
import SettingsMenu from '../components/SettingsMenu';
import MailPage from '../components/MailPage';
import CalendarPage from '../components/calendar/CalendarPage';

// Temp testing imports
import FanCleaning from '../components/minigames/FanCleaning';
import TerminalReboot from '../components/minigames/TerminalReboot';
import GeneratorStart from '../components/minigames/GeneratorStart';
import CableConnect from '../components/minigames/CableConnect';

import './MainMenu.css';

export default function MainMenu({ onStart, onReset, settings, trust }) {
    const [view, setView] = useState('main'); // 'main', 'settings', 'credits', 'howToPlay', 'mail', 'calendar'
    const [phase, setPhase] = useState(0); // 0: room, 1: monitoroff, 2: monitoron
    const [debugMinigame, setDebugMinigame] = useState(null); // 'fan', 'terminal', 'generator', 'cables'
    const audioRef = useRef(null);

    const { sfxVolume, musicVolume } = settings;

    // Trust calculation
    const trustLvl = trust < 30 ? 'Low' : trust < 70 ? 'Medium' : 'High';
    const trustIcon = trust < 30 ? trustLowIcon : trust < 70 ? trustMediumIcon : trustHighIcon;

    // Audio setup
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = musicVolume;
            audioRef.current.play().catch((e) => {
                console.warn('Audio autoplay blocked by browser until user interacts', e);
            });
        }
    }, [musicVolume]);

    // Phase transition: 0 -> 1 after 3 seconds
    useEffect(() => {
        if (phase === 0) {
            const timer = setTimeout(() => {
                setPhase(1);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [phase]);

    const handleScreenClick = () => {
        if (phase === 1) {
            setPhase(1.5); // transition phase: black screen without text

            // Play the heavy terminal wake sound
            const wakeAudio = new Audio(terminalWakeSfx);
            wakeAudio.volume = sfxVolume;
            wakeAudio.play().catch(() => { });

            setTimeout(() => {
                setPhase(2);
                // Ensure main audio plays when user interacts
                if (audioRef.current) {
                    audioRef.current.play().catch(() => { });
                }
            }, 2500);
        }
    };

    const handleReset = () => {
        if (window.confirm('Are you sure you want to completely erase all progress and logs? This action is irreversible.')) {
            onReset();
            alert('Local credentials wiped. Terminals reset.');
        }
    };

    const handleStartShift = () => {
        setPhase(3); // Trigger zoom animation
        setTimeout(() => {
            onStart();
        }, 1000);
    };

    return (
        <div
            className={`main-menu main-menu--phase-${phase}`}
            id="main-menu"
            onClick={handleScreenClick}
        >
            <video
                className="main-menu__bg-room"
                src={gameBgVideo}
                autoPlay
                loop
                muted
                playsInline
            />

            {(phase === 1 || phase === 1.5) && <div className="main-menu__bg-monitor" style={{ backgroundImage: `url(${monitorBg1})` }} />}
            {(phase === 2 || phase === 3) && <div className="main-menu__bg-monitor" style={{ backgroundImage: `url(${view === 'mail' ? mailMonitorBg : monitorBg2})` }} />}

            <audio ref={audioRef} src={mainTheme} loop />

            {/* Phase 1 Overlay (Invisible click target) */}
            {phase === 1 && (
                <div className="main-menu__click-overlay glow-text">
                    [ CLICK TERMINAL TO WAKE ]
                </div>
            )}

            {/* Phase 2: Menu Content */}
            {(phase === 2 || phase === 3) && view === 'settings' && (
                <div className="main-menu__content">
                    <SettingsMenu
                        settings={settings}
                        isIngame={false}
                        onFactoryReset={handleReset}
                        onClose={() => setView('main')}
                    />
                </div>
            )}

            {/* Phase 2: Mail Content */}
            {(phase === 2 || phase === 3) && view === 'mail' && (
                <div className="main-menu__content">
                    <MailPage onClose={() => setView('main')} />
                </div>
            )}

            {/* Phase 2: Calendar Content */}
            {(phase === 2 || phase === 3) && view === 'calendar' && (
                <div className="main-menu__content">
                    <CalendarPage onClose={() => setView('main')} />
                </div>
            )}

            {(phase === 2 || phase === 3) && view === 'main' && (
                <div className="main-menu__content">
                    <img src={emblemImg} alt="Ministry Logo" className="main-menu__bg-logo" />
                    <div className="main-menu__grid">
                        {/* Row 1 */}
                        <button className="main-menu__grid-item" onClick={handleStartShift}>
                            <img src={verityIcon} alt="Access System" />
                            <span>Access System</span>
                        </button>
                        <button className="main-menu__grid-item" onClick={() => setView('calendar')}>
                            <img src={calendarIcon} alt="Calendar" />
                            <span>Calendar</span>
                        </button>
                        <button className="main-menu__grid-item" onClick={() => setView('mail')}>
                            <img src={mailIcon} alt="Mail" />
                            <span>Mail</span>
                        </button>

                        {/* Row 2 */}
                        <button className="main-menu__grid-item" onClick={() => setView('howToPlay')}>
                            <img src={howToPlayIcon} alt="How To Play" />
                            <span>How To Play</span>
                        </button>

                        {/* Empty Spacer for Center - Temporarily hijacked for debug */}
                        <div className="main-menu__grid-spacer" style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', justifyContent: 'center', alignContent: 'center', background: 'rgba(0,0,0,0.5)', padding: '4px' }}>
                            <span style={{ width: '100%', textAlign: 'center', fontSize: '10px', color: '#ff4444' }}>TEST ROOM</span>
                            <button onClick={(e) => { e.stopPropagation(); setDebugMinigame('fan'); }} style={{ fontSize: '12px', padding: '2px 6px', cursor: 'pointer' }}>Fan</button>
                            <button onClick={(e) => { e.stopPropagation(); setDebugMinigame('terminal'); }} style={{ fontSize: '12px', padding: '2px 6px', cursor: 'pointer' }}>Term</button>
                            <button onClick={(e) => { e.stopPropagation(); setDebugMinigame('generator'); }} style={{ fontSize: '12px', padding: '2px 6px', cursor: 'pointer' }}>Gen</button>
                            <button onClick={(e) => { e.stopPropagation(); setDebugMinigame('cables'); }} style={{ fontSize: '12px', padding: '2px 6px', cursor: 'pointer' }}>Cab</button>
                        </div>

                        <button className="main-menu__grid-item" onClick={() => setView('credits')}>
                            <img src={creditsIcon} alt="Credits" />
                            <span>Credits</span>
                        </button>

                        {/* Row 3 */}
                        <button className="main-menu__grid-item" onClick={() => setView('settings')}>
                            <img src={settingsIcon} alt="Settings" />
                            <span>Settings</span>
                        </button>
                        <button className="main-menu__grid-item" onClick={() => { /* Leaderboard click handler */ }}>
                            <img src={leaderboardIcon} alt="Leaderboard" />
                            <span>Leaderboard</span>
                        </button>
                        <div className="main-menu__grid-item main-menu__grid-item--trust">
                            <div className="main-menu__trust-top">
                                <img src={trustIcon} alt={`Trust - ${trustLvl}`} />
                                <span className="main-menu__trust-percent glow-text">{trust}%</span>
                            </div>
                            <span>Trust - {trustLvl}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Phase 2: Credits Content */}
            {(phase === 2 || phase === 3) && view === 'credits' && (
                <div className="main-menu__content main-menu__content--credits">
                    <img src={qrIcon} alt="QR Code" className="main-menu__credits-qr" />

                    <div className="main-menu__credits-text">
                        <p>MINISTRY OF VERITY</p>
                        <p style={{ marginBottom: 'var(--space-lg)' }}>ARCHIVED DEVELOPMENT RECORD</p>

                        <p className="glow-text" style={{ fontSize: 'var(--font-size-lg)', letterSpacing: '4px' }}>FAKE CHECKER</p>
                        <p style={{ marginBottom: 'var(--space-lg)' }}>A browser-based verification simulation</p>

                        <p>Created in several days by a two-person team</p>
                        <p style={{ marginBottom: 'var(--space-lg)' }}>for a 2026 game jam in Georgia.</p>

                        <p style={{ color: 'var(--text-dim)', letterSpacing: '2px', marginBottom: 'var(--space-sm)' }}>PROJECT PERSONNEL</p>

                        <p>Giorgi Talakhadze</p>
                        <p style={{ color: 'var(--text-dim)', marginBottom: 'var(--space-md)' }}>Game Designer</p>

                        <p>Archil Berozashvili</p>
                        <p style={{ color: 'var(--text-dim)', marginBottom: 'var(--space-lg)' }}>Developer &amp; Systems Engineer</p>

                        <p>The Ministry acknowledges their contribution</p>
                        <p style={{ marginBottom: 'var(--space-lg)' }}>to the preservation of informational order.</p>

                        <p>Additional system improvements, expanded directives</p>
                        <p style={{ marginBottom: 'var(--space-lg)' }}>and further verification protocols may follow.</p>

                        <p style={{ marginBottom: 'var(--space-lg)' }}>Thank you for completing your service.</p>

                        <p style={{ color: 'var(--text-dim)' }}>If you would like to help the Ministry to improve this Game,</p>
                        <p style={{ color: 'var(--text-dim)', marginBottom: 'var(--space-md)' }}>please use the link or QR code below.</p>

                        <p style={{ marginBottom: 'var(--space-lg)' }}>Your Honest input will be noted by highest ranks of Ministry of Verity.</p>

                        <p className="glow-text" style={{ letterSpacing: '4px', marginBottom: 'var(--space-md)' }}>OBSERVA. DENUNTIA. OBEDI.</p>

                        <p><a href="https://rb.gy/44mtnx" target="_blank" rel="noreferrer" className="main-menu__credits-link">https://rb.gy/44mtnx</a></p>
                    </div>

                    <button className="main-menu__btn" style={{ flex: 'none', marginTop: 'var(--space-sm)', width: 'auto', alignSelf: 'center' }} onClick={() => setView('main')}>
                        [ RETURN ]
                    </button>
                </div>
            )}

            {/* Phase 2: How To Play Content */}
            {(phase === 2 || phase === 3) && view === 'howToPlay' && (
                <div className="main-menu__content main-menu__content--credits">
                    <img src={emblemImg} alt="Ministry Logo" className="main-menu__logo" style={{ width: '80px', height: '80px', flexShrink: 0 }} />

                    <div className="main-menu__credits-text">
                        <p style={{ letterSpacing: '2px', marginBottom: 'var(--space-md)' }}>MINISTRY OF VERITY</p>
                        <p className="glow-text" style={{ fontSize: 'var(--font-size-lg)', letterSpacing: '4px', marginBottom: 'var(--space-lg)' }}>OPERATOR PROTOCOL</p>

                        <p style={{ color: 'var(--text-dim)', letterSpacing: '2px', marginBottom: 'var(--space-sm)' }}>[ CORE DIRECTIVE ]</p>
                        <p style={{ marginBottom: 'var(--space-lg)' }}>Review incoming civilian documents and verify their authenticity against the Ministry&apos;s strict guidelines.</p>

                        <p style={{ color: 'var(--text-dim)', letterSpacing: '2px', marginBottom: 'var(--space-sm)' }}>[ VERIFICATION PROCESS ]</p>
                        <p style={{ marginBottom: 'var(--space-xs)' }}>1. Inspect the provided documents on your workstation.</p>
                        <p style={{ marginBottom: 'var(--space-xs)' }}>2. Cross-reference the claims against active directives.</p>
                        <p style={{ marginBottom: 'var(--space-lg)' }}>3. Stamp the document as [ REAL ] or [ FAKE ].</p>

                        <p style={{ color: 'var(--text-dim)', letterSpacing: '2px', marginBottom: 'var(--space-sm)' }}>[ CONSEQUENCES OF ERROR ]</p>
                        <p style={{ marginBottom: 'var(--space-xs)' }}>Mistakes will result in a deduction of Ministry Trust.</p>
                        <p style={{ marginBottom: 'var(--space-lg)' }}>If Trust reaches zero, your clearance is permanently revoked.</p>

                        <p style={{ color: 'var(--text-dim)', letterSpacing: '2px', marginBottom: 'var(--space-sm)' }}>[ ANOMALY WARNING ]</p>
                        <p style={{ marginBottom: 'var(--space-md)' }}>Workstation anomalies (e.g. system faults, signal loss, cooling issues) may occur randomly. You must resolve them before the time limit expires to avoid severe time penalties.</p>

                        <p className="glow-text" style={{ letterSpacing: '4px', marginBottom: 'var(--space-md)' }}>OBSERVA. DENUNTIA. OBEDI.</p>
                    </div>

                    <button className="main-menu__btn" style={{ flex: 'none', marginTop: 'var(--space-sm)', width: 'auto', alignSelf: 'center' }} onClick={() => setView('main')}>
                        [ OVERSTOOD ]
                    </button>
                </div>
            )}
            {/* Active Minigame Testing Overlay */}
            {debugMinigame === 'fan' && <FanCleaning onComplete={() => setDebugMinigame(null)} onPenalty={() => setDebugMinigame(null)} />}
            {debugMinigame === 'terminal' && <TerminalReboot onComplete={() => setDebugMinigame(null)} onPenalty={() => setDebugMinigame(null)} />}
            {debugMinigame === 'generator' && <GeneratorStart onComplete={() => setDebugMinigame(null)} onPenalty={() => setDebugMinigame(null)} />}
            {debugMinigame === 'cables' && <CableConnect onComplete={() => setDebugMinigame(null)} onPenalty={() => setDebugMinigame(null)} />}

        </div>
    );
}
