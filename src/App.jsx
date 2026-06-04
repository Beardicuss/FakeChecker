import React, { useCallback, useEffect } from 'react';
import CrtOverlay from './components/CrtOverlay';
import MainMenu from './screens/MainMenu';
import BootSequence from './screens/BootSequence';
import NameEntry from './screens/NameEntry';
import IntroDirective from './screens/IntroDirective';
import LoginScreen from './screens/LoginScreen';
import Workstation from './screens/Workstation';
import ShiftReport from './screens/ShiftReport';
import GameOver from './screens/GameOver';
import DemoEnd from './screens/DemoEnd';
import { useGameState } from './state/useGameState';
import { useTimer } from './state/useTimer';
import { useCaseQueue } from './state/useCaseQueue';
import { useSettings } from './state/useSettings';
import clickSoundFile from './assets/audio/click_sound.mp3';
import './App.css';

/**
 * App — Root component and screen router.
 * Flow: boot → name → intro → login → workstation → report → demo end.
 */
export default function App() {
    const game = useGameState();
    const caseQueue = useCaseQueue();
    const settings = useSettings();

    const handleEndOfDay = useCallback(() => {
        game.handleEndOfDay();
        timer.stopTimer();
    }, [game]);

    const timer = useTimer(handleEndOfDay);

    // Global click sound effect - only active after login
    useEffect(() => {
        const allowedScreens = ['login', 'name', 'mainmenu', 'workstation', 'report', 'gameover', 'demoend'];
        if (!allowedScreens.includes(game.screen)) return;

        const audio = new Audio(clickSoundFile);

        const playClick = (e) => {
            // Play click sound on any button, range slider, or interactive element
            const target = e.target.closest('button, input[type="checkbox"], input[type="range"], .workstation__ready, .mail-icon, .decision-btn');
            if (target) {
                const clickSfx = audio.cloneNode();
                clickSfx.volume = settings.sfxVolume;
                clickSfx.play().catch(() => { });
            }
        };

        document.addEventListener('click', playClick);
        return () => document.removeEventListener('click', playClick);
    }, [settings.sfxVolume, game.screen]);

    // === Screen handlers === //

    const handleBootComplete = useCallback(() => {
        game.setScreen('name');
    }, [game]);

    const handleNameSubmit = useCallback((name) => {
        game.setAgentName(name);
        game.setScreen('intro');
    }, [game]);

    const handleIntroAccept = useCallback(() => {
        game.setScreen('login');
    }, [game]);

    const handleLogin = useCallback(() => {
        game.setScreen('mainmenu');
    }, [game]);

    const handleMenuStart = useCallback(() => {
        game.setScreen('workstation');
    }, [game]);

    const handleDecision = useCallback((choice, ministryVerdict) => {
        game.handleDecision(choice, ministryVerdict);
        caseQueue.advanceCase();
    }, [game, caseQueue]);

    const handleReportContinue = useCallback(() => {
        game.setScreen('demoend');
    }, [game]);

    const handleRestart = useCallback(() => {
        game.setScreen('boot');
        game.setTrust(40);
        game.setDay(1);
        game.resetDay();
        caseQueue.resetQueue();
        timer.resetTimer();
    }, [game, caseQueue, timer]);

    // === Screen rendering === //

    const renderScreen = () => {
        switch (game.screen) {
            case 'mainmenu':
                return (
                    <MainMenu
                        onStart={handleMenuStart}
                        onReset={handleRestart}
                        settings={settings}
                    />
                );
            case 'boot':
                return <BootSequence onComplete={handleBootComplete} />;
            case 'name':
                return <NameEntry onSubmit={handleNameSubmit} />;
            case 'intro':
                return <IntroDirective onAccept={handleIntroAccept} />;
            case 'login':
                return <LoginScreen agentName={game.agentName} onLogin={handleLogin} />;
            case 'workstation':
                return (
                    <Workstation
                        currentCase={caseQueue.currentCase}
                        isTutorial={caseQueue.isTutorial}
                        trust={game.trust}
                        seconds={timer.seconds}
                        isLowTime={timer.isLowTime}
                        processed={game.processed}
                        quota={game.DAILY_QUOTA}
                        day={game.day}
                        onDecision={handleDecision}
                        isQueueEmpty={caseQueue.isQueueEmpty}
                        onStartTimer={timer.startTimer}
                    />
                );
            case 'report':
                return (
                    <ShiftReport
                        processed={game.processed}
                        correctCount={game.correctCount}
                        wrongCount={game.wrongCount}
                        skippedCount={game.skippedCount}
                        trust={game.trust}
                        day={game.day}
                        onContinue={handleReportContinue}
                    />
                );
            case 'gameover':
                return <GameOver reason={game.gameOverReason} onRestart={handleRestart} />;
            case 'demoend':
                return (
                    <DemoEnd
                        trust={game.trust}
                        correctCount={game.correctCount}
                        wrongCount={game.wrongCount}
                        processed={game.processed}
                        onRestart={handleRestart}
                    />
                );
            default:
                return <BootSequence onComplete={handleBootComplete} />;
        }
    };

    return (
        <CrtOverlay>
            {renderScreen()}
        </CrtOverlay>
    );
}
