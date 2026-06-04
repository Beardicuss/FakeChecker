import React, { useEffect, useRef, useState } from 'react';
import emblemImg from '../assets/backgrounds/ministry-emblem.png';
import mainTheme from '../assets/audio/main-theme.mp3';
import terminalWakeSfx from '../assets/audio/terminal_wake.mp3';
import gameBg from '../assets/backgrounds/game-background.png';
import monitorBg1 from '../assets/backgrounds/menu_monitor.png';
import monitorBg2 from '../assets/backgrounds/menu_monitor2.png';
import './MainMenu.css';

export default function MainMenu({ onStart, onReset, settings }) {
    const [view, setView] = useState('main'); // 'main' or 'settings'
    const [phase, setPhase] = useState(0); // 0: room, 1: monitoroff, 2: monitoron
    const audioRef = useRef(null);

    const { sfxVolume, setSfxVolume, musicVolume, setMusicVolume, textSize, setTextSize } = settings;

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
            <div className="main-menu__bg-room" style={{ backgroundImage: `url(${gameBg})` }} />

            {(phase === 1 || phase === 1.5) && <div className="main-menu__bg-monitor" style={{ backgroundImage: `url(${monitorBg1})` }} />}
            {(phase === 2 || phase === 3) && <div className="main-menu__bg-monitor" style={{ backgroundImage: `url(${monitorBg2})` }} />}

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
                    <h1 className="main-menu__title glow-text" style={{ fontSize: 'var(--font-size-xl)' }}>SYSTEM SETTINGS</h1>
                    <div className="main-menu__settings-group" style={{ display: 'flex', flexDirection: 'row', gap: '32px' }}>
                        <div style={{ flex: 1 }}>
                            <label className="main-menu__label">MUSIC VOLUME ({Math.round(musicVolume * 100)}%)</label>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.05"
                                value={musicVolume}
                                onChange={(e) => setMusicVolume(parseFloat(e.target.value))}
                                className="main-menu__slider"
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label className="main-menu__label">SFX VOLUME ({Math.round(sfxVolume * 100)}%)</label>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.05"
                                value={sfxVolume}
                                onChange={(e) => setSfxVolume(parseFloat(e.target.value))}
                                className="main-menu__slider"
                            />
                        </div>
                    </div>

                    <div className="main-menu__settings-group">
                        <label className="main-menu__label">TERMINAL TEXT SIZE</label>
                        <div className="main-menu__btn-group">
                            <button
                                className={`main-menu__btn ${textSize === 'small' ? 'active' : ''}`}
                                onClick={() => setTextSize('small')}
                            >SMALL</button>
                            <button
                                className={`main-menu__btn ${textSize === 'medium' ? 'active' : ''}`}
                                onClick={() => setTextSize('medium')}
                            >MEDIUM</button>
                            <button
                                className={`main-menu__btn ${textSize === 'large' ? 'active' : ''}`}
                                onClick={() => setTextSize('large')}
                            >LARGE</button>
                        </div>
                    </div>

                    <div className="main-menu__settings-group" style={{ marginTop: '24px' }}>
                        <button className="main-menu__btn main-menu__btn--danger" onClick={handleReset}>
                            [ FACTORY RESET PROGRESS ]
                        </button>
                    </div>

                    <button className="main-menu__btn" style={{ marginTop: '32px' }} onClick={() => setView('main')}>
                        [ RETURN TO MENU ]
                    </button>
                </div>
            )}

            {(phase === 2 || phase === 3) && view === 'main' && (
                <div className="main-menu__content">
                    <img src={emblemImg} alt="Ministry Logo" className="main-menu__logo" />
                    <h1 className="main-menu__title glow-text">FAKE CHECKER</h1>
                    <h2 className="main-menu__subtitle">MINISTRY OF VERITY TERMINAL</h2>

                    <div className="main-menu__options">
                        <button className="main-menu__btn" onClick={handleStartShift}>[ START SHIFT ]</button>
                        <button className="main-menu__btn" onClick={() => alert('HOW TO PLAY:\nInspect documents. Mark as REAL or FAKE based on directives. Keep Ministry Trust high.')}>[ HOW TO PLAY ]</button>
                        <button className="main-menu__btn" onClick={() => alert('CREDITS:\nMinistry of Verity Propaganda Department.')}>[ CREDITS ]</button>
                        <button className="main-menu__btn" onClick={() => setView('settings')}>[ SETTINGS ]</button>
                    </div>
                </div>
            )}
        </div>
    );
}
