import React from 'react';
import FanCleaning from './FanCleaning';
import GeneratorStart from './GeneratorStart';
import CableConnect from './CableConnect';
import TerminalReboot from './TerminalReboot';

/**
 * Dispatches the correct minigame overlay based on the active incident type.
 */
export default function IncidentOverlay({ activeIncident, onResolve }) {
    if (!activeIncident) return null;

    switch (activeIncident) {
        case 'fan':
            return <FanCleaning onComplete={onResolve} />;
        case 'generator':
            return <GeneratorStart onComplete={onResolve} />;
        case 'cables':
            return <CableConnect onComplete={onResolve} />;
        case 'terminal':
            return <TerminalReboot onComplete={onResolve} />;
        default:
            return null;
    }
}
