import { useState, useEffect } from 'react';

export function useSettings() {
    const [sfxVolume, setSfxVolume] = useState(() => {
        const saved = localStorage.getItem('fc_sfxVolume');
        return saved !== null ? parseFloat(saved) : 0.8;
    });

    const [musicVolume, setMusicVolume] = useState(() => {
        const saved = localStorage.getItem('fc_musicVolume');
        return saved !== null ? parseFloat(saved) : 0.5;
    });

    const [textSize, setTextSize] = useState(() => {
        const saved = localStorage.getItem('fc_textSize');
        return saved || 'medium'; // 'small', 'medium', 'large'
    });

    useEffect(() => {
        localStorage.setItem('fc_sfxVolume', sfxVolume);
    }, [sfxVolume]);

    useEffect(() => {
        localStorage.setItem('fc_musicVolume', musicVolume);
    }, [musicVolume]);

    useEffect(() => {
        localStorage.setItem('fc_textSize', textSize);
        // Clear any previous size classes and set the new one
        document.body.classList.remove('text-size--small', 'text-size--medium', 'text-size--large');
        document.body.classList.add(`text-size--${textSize}`);
    }, [textSize]);

    return { sfxVolume, setSfxVolume, musicVolume, setMusicVolume, textSize, setTextSize };
}
