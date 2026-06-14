import { useEffect, useRef, useState } from 'react';
import './TrailerScreen.css';

import trailerWebm from '../assets/video/trailer.webm';

const TRAILER_VIDEO_SRC = trailerWebm;
const TRAILER_POSTER_SRC = '';

export default function TrailerScreen({ onContinue }) {
    const hasTrailer = Boolean(TRAILER_VIDEO_SRC);
    const [showSkipPrompt, setShowSkipPrompt] = useState(false);
    const skipArmedRef = useRef(false);
    const skipPromptTimerRef = useRef(null);

    const clearSkipPromptTimer = () => {
        if (!skipPromptTimerRef.current) return;
        window.clearTimeout(skipPromptTimerRef.current);
        skipPromptTimerRef.current = null;
    };

    const armSkipPrompt = () => {
        skipArmedRef.current = true;
        setShowSkipPrompt(true);
        clearSkipPromptTimer();
        skipPromptTimerRef.current = window.setTimeout(() => {
            skipArmedRef.current = false;
            setShowSkipPrompt(false);
            skipPromptTimerRef.current = null;
        }, 3000);
    };

    const handleSkipAttempt = () => {
        if (skipArmedRef.current) {
            clearSkipPromptTimer();
            onContinue();
            return;
        }

        armSkipPrompt();
    };

    const handleKeyDown = (event) => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        handleSkipAttempt();
    };

    useEffect(() => () => clearSkipPromptTimer(), []);

    return (
        <section
            className="trailer-screen"
            id="trailer-screen"
            tabIndex={0}
            onPointerDown={handleSkipAttempt}
            onKeyDown={handleKeyDown}
        >
            <div className="trailer-screen__frame">
                <div className="trailer-screen__header">
                    <span>MINISTRY TRANSMISSION</span>
                    <strong>PRE-SHIFT VIDEO BRIEFING</strong>
                </div>

                <div className="trailer-screen__viewer">
                    {hasTrailer ? (
                        <video
                            className="trailer-screen__video"
                            src={TRAILER_VIDEO_SRC}
                            poster={TRAILER_POSTER_SRC || undefined}
                            autoPlay
                            playsInline
                            disablePictureInPicture
                            controlsList="nodownload noplaybackrate noremoteplayback"
                            onEnded={onContinue}
                        />
                    ) : (
                        <div className="trailer-screen__placeholder" aria-label="Trailer video placeholder">
                            <span className="trailer-screen__placeholder-mark">NO SIGNAL</span>
                            <p>Trailer feed path pending.</p>
                        </div>
                    )}
                </div>

                {showSkipPrompt && (
                    <div className="trailer-screen__skip-prompt" role="status" aria-live="polite">
                        CLICK AGAIN TO SKIP
                    </div>
                )}

                <button className="trailer-screen__btn" type="button">
                    [ CONTINUE TO AGENT REGISTRY ]
                </button>
            </div>
        </section>
    );
}
