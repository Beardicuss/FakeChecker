import { useState, useCallback, useRef, useEffect } from 'react';
import CaseViewer from '../components/CaseViewer';
import DecisionButtons from '../components/DecisionButtons';
import TrustMeter from '../components/TrustMeter';
import TimerDisplay from '../components/TimerDisplay';
import QuotaTracker from '../components/QuotaTracker';
import IncidentPanel from '../components/IncidentPanel';
import DirectivePanel from '../components/DirectivePanel';
import ProfileIcon from '../components/ProfileIcon';
import ProfilePage from '../components/ProfilePage';
import MailIcon from '../components/MailIcon';
import Stamp from '../components/Stamp';
import MailPage from '../components/MailPage';
import CalendarIcon from '../components/calendar/CalendarIcon';
import CalendarPage from '../components/calendar/CalendarPage';
import IncidentOverlay from '../components/minigames/IncidentOverlay';
import SettingsMenu from '../components/SettingsMenu';
import { useIncidents } from '../state/useIncidents';
import verityIcon from '../assets/icons/verity-icon.webp';
import settingsIcon from '../assets/icons/settings.webp';
import gameplayTheme from '../assets/audio/fake-checking-theme.mp3';
import './Workstation.css';

/**
 * Main gameplay screen — composes all HUD elements around the case viewer.
 */
export default function Workstation({
    currentCase,
    isTutorial,
    trust,
    seconds,
    isLowTime,
    processed,
    quota,
    day,
    onDecision,
    isQueueEmpty,
    onStartTimer,
    onPauseTimer,
    onResumeTimer,
    upgrades,
    settings,
    agentName,
    agentEmail,
    agentId,
    agentAvatarId,
    externalMail,
    onQuitMainMenu,
    onPenalty,
    onRenameAgent,
}) {
    const [stamp, setStamp] = useState({ visible: false, type: 'correct' });
    const [buttonsDisabled, setButtonsDisabled] = useState(false);
    const [shiftStarted, setShiftStarted] = useState(false);
    const [showProfilePage, setShowProfilePage] = useState(false);
    const [showMailPage, setShowMailPage] = useState(false);
    const [showCalendarPage, setShowCalendarPage] = useState(false);
    const [showSettings, setShowSettings] = useState(false);

    const audioRef = useRef(null);

    // Audio setup
    useEffect(() => {
        if (audioRef.current && shiftStarted) {
            audioRef.current.volume = settings.musicVolume;
            if (audioRef.current.paused) {
                audioRef.current.play().catch((e) => {
                    console.warn('Game audio autoplay blocked', e);
                });
            }
        }
    }, [shiftStarted, settings.musicVolume]);

    const incidents = useIncidents(shiftStarted, upgrades, onPenalty);

    const { resolveIncident, openIncident, warningElapsed } = incidents;

    const activeIncident = incidents.activeIncident;
    const warningIncident = incidents.warningIncident;

    // Pause timer when incident is active or settings are open
    const handleIncidentResolve = useCallback(() => {
        resolveIncident();
        if (shiftStarted && !showSettings && !showProfilePage && !showMailPage && !showCalendarPage) {
            onResumeTimer?.();
        }
    }, [resolveIncident, shiftStarted, showSettings, showProfilePage, showMailPage, showCalendarPage, onResumeTimer]);

    const handleOpenSettings = () => {
        setShowSettings(true);
        onPauseTimer?.();
    };

    const handleCloseSettings = () => {
        setShowSettings(false);
        if (shiftStarted && !showProfilePage && !showMailPage && !showCalendarPage && !activeIncident) {
            onResumeTimer?.();
        }
    };

    const handleOpenProfile = useCallback(() => {
        setShowProfilePage(true);
        if (shiftStarted) onPauseTimer?.();
    }, [shiftStarted, onPauseTimer]);

    const handleCloseProfile = useCallback(() => {
        setShowProfilePage(false);
        if (shiftStarted && !showSettings && !showMailPage && !showCalendarPage && !activeIncident) {
            onResumeTimer?.();
        }
    }, [shiftStarted, showSettings, showMailPage, showCalendarPage, activeIncident, onResumeTimer]);

    const handleSaveProfile = useCallback((profile) => {
        onRenameAgent?.(profile);
        setShowProfilePage(false);
        if (shiftStarted && !showSettings && !showMailPage && !showCalendarPage && !activeIncident) {
            onResumeTimer?.();
        }
    }, [onRenameAgent, shiftStarted, showSettings, showMailPage, showCalendarPage, activeIncident, onResumeTimer]);

    const handleOpenMail = useCallback(() => {
        setShowMailPage(true);
        if (shiftStarted) onPauseTimer?.();
    }, [shiftStarted, onPauseTimer]);

    const handleCloseMail = useCallback(() => {
        setShowMailPage(false);
        if (shiftStarted && !showSettings && !showProfilePage && !showCalendarPage && !activeIncident) {
            onResumeTimer?.();
        }
    }, [shiftStarted, showSettings, showProfilePage, showCalendarPage, activeIncident, onResumeTimer]);

    const handleOpenCalendar = useCallback(() => {
        setShowCalendarPage(true);
        if (shiftStarted) onPauseTimer?.();
    }, [shiftStarted, onPauseTimer]);

    const handleCloseCalendar = useCallback(() => {
        setShowCalendarPage(false);
        if (shiftStarted && !showSettings && !showProfilePage && !showMailPage && !activeIncident) {
            onResumeTimer?.();
        }
    }, [shiftStarted, showSettings, showProfilePage, showMailPage, activeIncident, onResumeTimer]);

    const handleLightClick = useCallback(() => {
        openIncident();
        onPauseTimer?.();
    }, [openIncident, onPauseTimer]);

    const handleStartShift = useCallback(() => {
        setShiftStarted(true);
        onStartTimer?.();
    }, [onStartTimer]);

    const handleDecision = useCallback((choice) => {
        if (!currentCase) return;
        setButtonsDisabled(true);

        const isCorrect = choice === currentCase.ministryVerdict;
        setStamp({ visible: true, type: choice === 'SKIP' ? 'skip' : isCorrect ? 'correct' : 'wrong' });

        onDecision(choice, currentCase.ministryVerdict);
    }, [currentCase, onDecision]);

    const handleStampComplete = useCallback(() => {
        setStamp({ visible: false, type: 'correct' });
        setButtonsDisabled(false);
    }, []);

    return (
        <div className="workstation" id="workstation">
            <audio ref={audioRef} src={gameplayTheme} loop />

            {/* Incident Minigame Overlay */}
            <IncidentOverlay
                activeIncident={activeIncident}
                onResolve={handleIncidentResolve}
                onPenalty={onPenalty}
            />

            {/* Top bar */}
            <header className="workstation__header">
                <TimerDisplay seconds={seconds} isLowTime={isLowTime} />
                <div className="workstation__header-center">
                    <span className="workstation__day-label glow-text">DAY {day}</span>
                </div>
                <div className="workstation__header-right">
                    <QuotaTracker processed={processed} quota={quota} />
                    <TrustMeter trust={trust} />
                    <button className="workstation__settings-btn" onClick={handleOpenSettings}>
                        <img src={settingsIcon} alt="Settings" className="workstation__settings-icon" />
                    </button>
                </div>
            </header>

            {/* Main content area */}
            <div className="workstation__body">
                {/* Left sidebar */}
                <aside className="workstation__sidebar-left">
                    <IncidentPanel
                        activeIncident={warningIncident || activeIncident}
                        onLightClick={handleLightClick}
                        warningElapsed={warningElapsed}
                    />
                    <ProfileIcon onClick={handleOpenProfile} />
                    <MailIcon hasNew={false} onClick={handleOpenMail} />
                    <CalendarIcon hasNew={false} onClick={handleOpenCalendar} />
                </aside>

                {/* Center: case + decisions */}
                <main className="workstation__main">
                    {showSettings ? (
                        <div className="workstation__settings-overlay">
                            <SettingsMenu
                                settings={settings}
                                isIngame={true}
                                onQuitMainMenu={onQuitMainMenu}
                                onClose={handleCloseSettings}
                            />
                        </div>
                    ) : showProfilePage ? (
                        <ProfilePage
                            agentName={agentName}
                            agentId={agentId}
                            avatarId={agentAvatarId}
                            onSave={handleSaveProfile}
                            onClose={handleCloseProfile}
                        />
                    ) : showMailPage ? (
                        <MailPage
                            agentName={agentName}
                            agentEmail={agentEmail}
                            agentId={agentId}
                            externalMessages={externalMail}
                            onClose={handleCloseMail}
                        />
                    ) : showCalendarPage ? (
                        <CalendarPage onClose={handleCloseCalendar} />
                    ) : !shiftStarted ? (
                        <div className="workstation__ready" onClick={handleStartShift}>
                            <img src={verityIcon} alt="Start Shift" className="workstation__ready-icon" />
                            <p className="workstation__ready-text glow-text">[ CLICK TO BEGIN SHIFT ]</p>
                        </div>
                    ) : isQueueEmpty ? (
                        <div className="workstation__empty">
                            <p className="glow-text">NO MORE PACKAGES</p>
                            <p>Shift will end when timer expires.</p>
                        </div>
                    ) : (
                        <>
                            <CaseViewer caseData={currentCase} isTutorial={isTutorial} />
                            <DecisionButtons onDecision={handleDecision} disabled={buttonsDisabled || !currentCase} />
                        </>
                    )}
                </main>

                {/* Right sidebar */}
                <aside className="workstation__sidebar-right">
                    <DirectivePanel day={day} />
                </aside>
            </div>

            {/* Stamp overlay */}
            <Stamp type={stamp.type} visible={stamp.visible} onComplete={handleStampComplete} />
        </div>
    );
}

