import { useCallback, useEffect, useRef } from 'react';
import CrtOverlay from './components/CrtOverlay';
import Splash from './screens/Splash';
import MainMenu from './screens/MainMenu';
import BootSequence from './screens/BootSequence';
import NameEntry from './screens/NameEntry';
import IntroDirective from './screens/IntroDirective';
// LoginScreen removed — intro goes directly to main menu
import Workstation from './screens/Workstation';
import ShiftReport from './screens/ShiftReport';
import Upgrades from './screens/Upgrades';
import GameOver from './screens/GameOver';
import DemoEnd from './screens/DemoEnd';
import AccessRegistry from './screens/AccessRegistry';
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
    const caseQueue = useCaseQueue(game.day);
    const settings = useSettings();

    // Use a ref so handleEndOfDay can call timer.stopTimer()
    // without a circular declaration dependency
    const timerRef = useRef(null);

    const handleEndOfDay = useCallback(() => {
        game.handleEndOfDay();
        timerRef.current?.stopTimer();
    }, [game]);

    const timer = useTimer(handleEndOfDay);
    useEffect(() => {
        timerRef.current = timer;
    });

    // Global click sound effect - only active after login
    useEffect(() => {
        const allowedScreens = ['login', 'name', 'mainmenu', 'workstation', 'report', 'upgrades', 'register', 'gameover', 'demoend'];
        if (!allowedScreens.includes(game.screen)) return;

        const audio = new Audio(clickSoundFile);

        const playClick = (e) => {
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

    const handleSplashComplete = useCallback(() => {
        game.setScreen('boot');
    }, [game]);

    const handleBootComplete = useCallback(() => {
        game.setScreen('name');
    }, [game]);

    const handleNameSubmit = useCallback((name) => {
        game.setAgentName(name);
        game.setScreen('intro');
    }, [game]);

    const handleIntroAccept = useCallback(() => {
        game.setScreen('mainmenu');
    }, [game]);

    const handleMenuStart = useCallback(() => {
        game.setScreen('workstation');
    }, [game]);

    const handleAgentRegistered = useCallback((record) => {
        game.setAgentName(record.name);
        game.setAgentEmail(record.email);
        game.setAgentId(record.id);
    }, [game]);

    const handleDecision = useCallback((choice, ministryVerdict) => {
        game.handleDecision(choice, ministryVerdict);
        caseQueue.advanceCase();
    }, [game, caseQueue]);

    const handleReportContinue = useCallback(() => {
        game.setScreen('upgrades');
    }, [game]);

    const continueAfterDay = useCallback(() => {
        if (game.day >= game.FINAL_PRESENTATION_DAY) {
            game.setScreen('demoend');
            return;
        }

        game.setDay(prev => prev + 1);
        game.resetDay();
        timer.resetTimer();
        game.setScreen('workstation');
    }, [game, timer]);

    const handleUpgradesContinue = useCallback(() => {
        if (!game.agentId) {
            game.setScreen('register');
            return;
        }

        continueAfterDay();
    }, [continueAfterDay, game]);

    const handleRegistryContinue = useCallback(() => {
        continueAfterDay();
    }, [continueAfterDay]);

    const handleRestart = useCallback(() => {
        game.setScreen('splash');
        game.setTrust(40);
        game.setDay(1);
        game.setAgentEmail('');
        game.setAgentId('');
        game.resetDay();
        caseQueue.resetQueue();
        timer.resetTimer();
    }, [game, caseQueue, timer]);

    // === Screen rendering === //

    const renderScreen = () => {
        switch (game.screen) {
            case 'splash':
                return <Splash onComplete={handleSplashComplete} />;
            case 'mainmenu':
                return (
                    <MainMenu
                        agentName={game.agentName}
                        agentEmail={game.agentEmail}
                        agentId={game.agentId}
                        externalMail={caseQueue.dynamicMail}
                        onStart={handleMenuStart}
                        onReset={handleRestart}
                        settings={settings}
                        trust={game.trust}
                    />
                );
            case 'boot':
                return <BootSequence onComplete={handleBootComplete} />;
            case 'name':
                return <NameEntry onSubmit={handleNameSubmit} />;
            case 'intro':
                return <IntroDirective onAccept={handleIntroAccept} />;

            case 'workstation':
                return (
                    <Workstation
                        key={`day-${game.day}`}
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
                        onPauseTimer={timer.stopTimer}
                        onResumeTimer={timer.startTimer}
                        onPenalty={timer.deductTime}
                        upgrades={game.upgrades}
                        settings={settings}
                        agentName={game.agentName}
                        agentEmail={game.agentEmail}
                        agentId={game.agentId}
                        externalMail={caseQueue.dynamicMail}
                        onQuitMainMenu={handleRestart}
                    />
                );
            case 'report':
                return (
                    <ShiftReport
                        processed={game.processed}
                        correctCount={game.correctCount}
                        wrongCount={game.wrongCount}
                        skipCount={game.skipCount}
                        trust={game.trust}
                        day={game.day}
                        isFinalDay={game.day >= game.FINAL_PRESENTATION_DAY}
                        onContinue={handleReportContinue}
                    />
                );
            case 'upgrades':
                return (
                    <Upgrades
                        currency={game.currency}
                        setCurrency={game.setCurrency}
                        upgrades={game.upgrades}
                        setUpgrades={game.setUpgrades}
                        onContinue={handleUpgradesContinue}
                    />
                );
            case 'register':
                return (
                    <AccessRegistry
                        agentName={game.agentName}
                        onRegistered={handleAgentRegistered}
                        onContinue={handleRegistryContinue}
                        onClose={handleRegistryContinue}
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
                        skipCount={game.skipCount}
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
