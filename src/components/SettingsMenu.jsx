import React from 'react';
import './SettingsMenu.css';

export default function SettingsMenu({ settings, isIngame, onQuitMainMenu, onFactoryReset, onClose }) {
    const { sfxVolume, setSfxVolume, musicVolume, setMusicVolume, textSize, setTextSize } = settings;

    return (
        <div className="settings-menu">
            <h1 className="settings-menu__title glow-text">SYSTEM SETTINGS</h1>
            <div className="settings-menu__group settings-menu__group--row">
                <div className="settings-menu__slider-container">
                    <label className="settings-menu__label">MUSIC VOLUME ({Math.round(musicVolume * 100)}%)</label>
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={musicVolume}
                        onChange={(e) => setMusicVolume(parseFloat(e.target.value))}
                        className="settings-menu__slider"
                    />
                </div>
                <div className="settings-menu__slider-container">
                    <label className="settings-menu__label">SFX VOLUME ({Math.round(sfxVolume * 100)}%)</label>
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={sfxVolume}
                        onChange={(e) => setSfxVolume(parseFloat(e.target.value))}
                        className="settings-menu__slider"
                    />
                </div>
            </div>

            <div className="settings-menu__group">
                <label className="settings-menu__label">TERMINAL TEXT SIZE</label>
                <div className="settings-menu__btn-group">
                    <button
                        className={`settings-menu__btn ${textSize === 'small' ? 'active' : ''}`}
                        onClick={() => setTextSize('small')}
                    >SMALL</button>
                    <button
                        className={`settings-menu__btn ${textSize === 'medium' ? 'active' : ''}`}
                        onClick={() => setTextSize('medium')}
                    >MEDIUM</button>
                    <button
                        className={`settings-menu__btn ${textSize === 'large' ? 'active' : ''}`}
                        onClick={() => setTextSize('large')}
                    >LARGE</button>
                </div>
            </div>

            <div className="settings-menu__group settings-menu__group--action">
                {isIngame ? (
                    <button className="settings-menu__btn settings-menu__btn--danger" onClick={onQuitMainMenu}>
                        [ QUIT TO MAIN MENU ]
                    </button>
                ) : (
                    <button className="settings-menu__btn settings-menu__btn--danger" onClick={onFactoryReset}>
                        [ FACTORY RESET PROGRESS ]
                    </button>
                )}
            </div>

            <button className="settings-menu__btn settings-menu__btn--close" onClick={onClose}>
                [ RETURN ]
            </button>
        </div>
    );
}
