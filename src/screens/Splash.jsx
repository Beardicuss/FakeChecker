import { useEffect } from 'react';
import emblemImg from '../assets/backgrounds/ministry-emblem.webp';
import './Splash.css';

export default function Splash({ onComplete }) {
    useEffect(() => {
        const handleClick = () => {
            onComplete();
        };
        window.addEventListener('click', handleClick);
        window.addEventListener('keydown', handleClick);

        return () => {
            window.removeEventListener('click', handleClick);
            window.removeEventListener('keydown', handleClick);
        };
    }, [onComplete]);

    return (
        <div className="splash-screen">
            <img src={emblemImg} alt="Ministry Emblem" className="splash-screen__emblem" />
        </div>
    );
}
