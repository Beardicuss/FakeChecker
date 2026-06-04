import React, { useState, useCallback, useEffect, useMemo } from 'react';
import redWire from '../../assets/minigames/cables/red.png';
import yellowWire from '../../assets/minigames/cables/yellow.png';
import greenWire from '../../assets/minigames/cables/green.png';
import blueWire from '../../assets/minigames/cables/blue.png';
import purpleWire from '../../assets/minigames/cables/purple.png';
import './Minigames.css';

const WIRE_DATA = [
    { id: 'red', img: redWire, label: 'RED' },
    { id: 'yellow', img: yellowWire, label: 'YELLOW' },
    { id: 'green', img: greenWire, label: 'GREEN' },
    { id: 'blue', img: blueWire, label: 'BLUE' },
    { id: 'purple', img: purpleWire, label: 'PURPLE' },
];

function shuffleArray(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

/**
 * Cable Connect minigame — match wires from left to right by color.
 */
export default function CableConnect({ onComplete }) {
    const [selectedLeft, setSelectedLeft] = useState(null);
    const [matched, setMatched] = useState(new Set());
    const [done, setDone] = useState(false);

    // Pick 4 random wires and shuffle the right column
    const leftWires = useMemo(() => shuffleArray(WIRE_DATA).slice(0, 4), []);
    const rightWires = useMemo(() => shuffleArray(leftWires), [leftWires]);

    useEffect(() => {
        if (matched.size === leftWires.length && !done) {
            setDone(true);
            setTimeout(() => onComplete(), 1200);
        }
    }, [matched, leftWires.length, done, onComplete]);

    const handleLeftClick = useCallback((wireId) => {
        if (matched.has(wireId)) return;
        setSelectedLeft(wireId);
    }, [matched]);

    const handleRightClick = useCallback((wireId) => {
        if (matched.has(wireId) || !selectedLeft) return;
        if (wireId === selectedLeft) {
            setMatched(prev => new Set([...prev, wireId]));
        }
        setSelectedLeft(null);
    }, [selectedLeft, matched]);

    return (
        <div className="minigame-overlay">
            <div className="minigame-overlay__title">📺 SCREEN FLICKERING</div>
            <div className="minigame-overlay__subtitle">Match the cables by color — click left, then right!</div>

            <div className="minigame-overlay__arena">
                <div className="cables__board">
                    <div className="cables__column">
                        {leftWires.map(wire => (
                            <div
                                key={`left-${wire.id}`}
                                className={`cables__wire ${selectedLeft === wire.id ? 'cables__wire--selected' : ''} ${matched.has(wire.id) ? 'cables__wire--matched' : ''}`}
                                onClick={() => handleLeftClick(wire.id)}
                            >
                                <img src={wire.img} alt={wire.label} />
                                <span>{wire.label}</span>
                            </div>
                        ))}
                    </div>

                    <div className="cables__center-line" />

                    <div className="cables__column">
                        {rightWires.map(wire => (
                            <div
                                key={`right-${wire.id}`}
                                className={`cables__wire ${matched.has(wire.id) ? 'cables__wire--matched' : ''}`}
                                onClick={() => handleRightClick(wire.id)}
                            >
                                <img src={wire.img} alt={wire.label} />
                                <span>{wire.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="minigame-overlay__progress-bar">
                <div
                    className={`minigame-overlay__progress-fill ${done ? 'minigame-overlay__progress-fill--success' : ''}`}
                    style={{ width: `${(matched.size / leftWires.length) * 100}%` }}
                />
            </div>

            <div className="minigame-overlay__timer">
                {done
                    ? <span className="minigame-overlay__result">[ CONNECTION RESTORED ]</span>
                    : `CONNECTED: ${matched.size} / ${leftWires.length}`
                }
            </div>
        </div>
    );
}
