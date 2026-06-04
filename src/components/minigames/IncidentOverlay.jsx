import React from 'react';
import FanCleaning from './FanCleaning';
import GeneratorStart from './GeneratorStart';
import CableConnect from './CableConnect';
import TerminalReboot from './TerminalReboot';

/**
 * Dispatches the correct minigame overlay based on the active incident type.
 */
export default function IncidentOverlay({ activeIncident, onResolve, onPenalty }) {
    if (!activeIncident) return null;

    switch (activeIncident) {
        case 'fan':
            return <FanCleaning onComplete={onResolve} onPenalty={onPenalty} />;
        case 'generator':
            return <GeneratorStart onComplete={onResolve} onPenalty={onPenalty} />;
        case 'cables':
            return <CableConnect onComplete={onResolve} onPenalty={onPenalty} />;
        case 'terminal':
            return <TerminalReboot onComplete={onResolve} onPenalty={onPenalty} />;
        default:
            return null;
    }
}
