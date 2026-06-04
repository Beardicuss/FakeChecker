import React, { useState, useCallback } from 'react';
import CaseViewer from '../components/CaseViewer';
import DecisionButtons from '../components/DecisionButtons';
import TrustMeter from '../components/TrustMeter';
import TimerDisplay from '../components/TimerDisplay';
import QuotaTracker from '../components/QuotaTracker';
import IncidentPanel from '../components/IncidentPanel';
import DirectivePanel from '../components/DirectivePanel';
import MailIcon from '../components/MailIcon';
import Stamp from '../components/Stamp';
import MailPage from '../components/MailPage';
import verityIcon from '../assets/icons/verity-icon.png';
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
}) {
    const [stamp, setStamp] = useState({ visible: false, type: 'correct' });
    const [buttonsDisabled, setButtonsDisabled] = useState(false);
    const [shiftStarted, setShiftStarted] = useState(false);
    const [showMailPage, setShowMailPage] = useState(false);

    const handleStartShift = useCallback(() => {
        setShiftStarted(true);
        onStartTimer?.();
    }, [onStartTimer]);

    const handleDecision = useCallback((choice) => {
        if (!currentCase) return;
        setButtonsDisabled(true);

        const isCorrect = choice === currentCase.ministryVerdict;
        setStamp({ visible: true, type: isCorrect ? 'correct' : 'wrong' });

        onDecision(choice, currentCase.ministryVerdict);
    }, [currentCase, onDecision]);

    const handleStampComplete = useCallback(() => {
        setStamp({ visible: false, type: 'correct' });
        setButtonsDisabled(false);
    }, []);

    return (
        <div className="workstation" id="workstation">
            {/* Top bar */}
            <header className="workstation__header">
                <TimerDisplay seconds={seconds} isLowTime={isLowTime} />
                <div className="workstation__header-center">
                    <span className="workstation__day-label glow-text">DAY {day}</span>
                </div>
                <div className="workstation__header-right">
                    <QuotaTracker processed={processed} quota={quota} />
                    <TrustMeter trust={trust} />
                </div>
            </header>

            {/* Main content area */}
            <div className="workstation__body">
                {/* Left sidebar */}
                <aside className="workstation__sidebar-left">
                    <IncidentPanel />
                    <MailIcon hasNew={false} onClick={() => setShowMailPage(true)} />
                </aside>

                {/* Center: case + decisions */}
                <main className="workstation__main">
                    {showMailPage ? (
                        <MailPage onClose={() => setShowMailPage(false)} />
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
