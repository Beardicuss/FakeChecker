import { useCallback, useEffect, useRef, useState } from 'react';
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
import { useGameState } from './state/useGameState';
import { useTimer } from './state/useTimer';
import { useCaseQueue } from './state/useCaseQueue';
import { useSettings } from './state/useSettings';
import { DEFAULT_PROFILE_AVATAR_ID } from './data/profileAvatars';
import { clearAgentIdentity, saveAgentIdentity } from './utils/agentIdentity';
import { calculateLeaderboardScore, submitLeaderboardScore } from './utils/leaderboardClient';
import { clearGameProgress, saveGameProgress } from './utils/progressStorage';
import clickSoundFile from './assets/audio/click_sound.mp3';
import './App.css';

/**
 * App — Root component and screen router.
 * Flow: boot → name → intro → login → workstation → report → demo end.
 */
export default function App() {
    const game = useGameState();
    const caseQueue = useCaseQueue(game.day, game.agentId);
    const settings = useSettings();
    const [mainMenuInitialPhase, setMainMenuInitialPhase] = useState(0);
    const submittedLeaderboardRunRef = useRef('');

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

    useEffect(() => {
        if (!game.agentId) return;
        saveGameProgress(game.agentId, {
            day: game.day,
            trust: game.trust,
            processed: game.processed,
            correctCount: game.correctCount,
            wrongCount: game.wrongCount,
            skipCount: game.skipCount,
            totalProcessed: game.totalProcessed,
            totalCorrectCount: game.totalCorrectCount,
            totalWrongCount: game.totalWrongCount,
            totalSkipCount: game.totalSkipCount,
            dailyCreditsEarned: game.dailyCreditsEarned,
            currency: game.currency,
            upgrades: game.upgrades,
        });
    }, [
        game.agentId,
        game.day,
        game.trust,
        game.processed,
        game.correctCount,
        game.wrongCount,
        game.skipCount,
        game.totalProcessed,
        game.totalCorrectCount,
        game.totalWrongCount,
        game.totalSkipCount,
        game.dailyCreditsEarned,
        game.currency,
        game.upgrades,
    ]);

    useEffect(() => {
        if (game.screen !== 'demoend' || !game.agentId) return;
        const runKey = `${game.agentId}-${game.totalProcessed}-${game.totalCorrectCount}-${game.totalWrongCount}-${game.totalSkipCount}`;
        if (submittedLeaderboardRunRef.current === runKey) return;

        const score = calculateLeaderboardScore({
            correctCount: game.totalCorrectCount,
            wrongCount: game.totalWrongCount,
            skipCount: game.totalSkipCount,
            trust: game.trust,
            processed: game.totalProcessed,
        });

        submittedLeaderboardRunRef.current = runKey;
        submitLeaderboardScore({
            agentId: game.agentId,
            agentName: game.agentName,
            avatarId: game.agentAvatarId,
            score,
            trust: game.trust,
            processed: game.totalProcessed,
            correctCount: game.totalCorrectCount,
            wrongCount: game.totalWrongCount,
            skipCount: game.totalSkipCount,
            completedAt: new Date().toISOString(),
        }).catch(error => {
            console.error('Leaderboard submit failed:', error);
        });
    }, [game]);

    // Global click sound effect - only active after login
    useEffect(() => {
        const allowedScreens = ['login', 'name', 'mainmenu', 'workstation', 'report', 'upgrades', 'gameover', 'demoend'];
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

    const handleNameSubmit = useCallback((identity) => {
        game.setAgentName(identity.name);
        game.setAgentId(identity.id);
        game.setAgentEmail('');
        game.setAgentAvatarId(identity.avatarId || game.agentAvatarId || DEFAULT_PROFILE_AVATAR_ID);
        saveAgentIdentity({
            name: identity.name,
            id: identity.id,
            avatarId: identity.avatarId || game.agentAvatarId || DEFAULT_PROFILE_AVATAR_ID,
        });
        game.setScreen('intro');
    }, [game]);

    const handleIntroAccept = useCallback(() => {
        setMainMenuInitialPhase(0);
        game.setScreen('mainmenu');
    }, [game]);

    const handleMenuStart = useCallback(() => {
        game.setScreen('workstation');
    }, [game]);

    const handleRenameAgent = useCallback((profile) => {
        game.setAgentName(profile.name);
        game.setAgentAvatarId(profile.avatarId);
        saveAgentIdentity({
            name: profile.name,
            id: game.agentId,
            avatarId: profile.avatarId,
        });
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
        continueAfterDay();
    }, [continueAfterDay]);

    const handleRestart = useCallback(() => {
        clearGameProgress(game.agentId);
        setMainMenuInitialPhase(0);
        game.setScreen('splash');
        game.setTrust(40);
        game.setDay(1);
        game.setAgentEmail('');
        game.resetRun();
        submittedLeaderboardRunRef.current = '';
        caseQueue.resetQueue();
        timer.resetTimer();
    }, [game, caseQueue, timer]);

    const handleFactoryReset = useCallback(() => {
        clearGameProgress(game.agentId);
        clearAgentIdentity();
        game.setAgentName('');
        game.setAgentEmail('');
        game.setAgentId('');
        game.setAgentAvatarId(DEFAULT_PROFILE_AVATAR_ID);
        handleRestart();
    }, [game, handleRestart]);

    const handleQuitToMainMenu = useCallback(() => {
        timer.stopTimer();
        timer.resetTimer();
        setMainMenuInitialPhase(1);
        game.setScreen('mainmenu');
    }, [game, timer]);

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
                        agentAvatarId={game.agentAvatarId}
                        externalMail={caseQueue.dynamicMail}
                        onStart={handleMenuStart}
                        onReset={handleFactoryReset}
                        initialPhase={mainMenuInitialPhase}
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
                        onQuitMainMenu={handleQuitToMainMenu}
                        onRenameAgent={handleRenameAgent}
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
            case 'gameover':
                return <GameOver reason={game.gameOverReason} onRestart={handleRestart} />;
            case 'demoend':
                return (
                    <DemoEnd
                        trust={game.trust}
                        correctCount={game.totalCorrectCount}
                        wrongCount={game.totalWrongCount}
                        skipCount={game.totalSkipCount}
                        processed={game.totalProcessed}
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
