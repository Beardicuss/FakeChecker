import './DemoEnd.css';

/**
 * Demo completion screen with badge and feedback link.
 */
export default function DemoEnd({ trust, correctCount, wrongCount, skipCount, processed, onRestart }) {
    const total = correctCount + wrongCount;
    const accuracy = total > 0 ? Math.round((correctCount / total) * 100) : 0;

    // Badge logic
    let badge, badgeDesc;
    if (accuracy >= 90 && trust >= 60) {
        badge = '🏆 MODEL EMPLOYEE';
        badgeDesc = 'Exemplary performance. The Ministry is proud.';
    } else if (accuracy >= 70) {
        badge = '🔰 RELIABLE AGENT';
        badgeDesc = 'Steady and obedient. A fine worker.';
    } else if (accuracy >= 50) {
        badge = '⚠ PROBATIONARY AGENT';
        badgeDesc = 'Room for improvement. The Ministry watches.';
    } else {
        badge = '❌ UNRELIABLE ELEMENT';
        badgeDesc = 'Your loyalty is in question.';
    }

    return (
        <div className="demo-end" id="demo-end">
            <h1 className="demo-end__title glow-text">DEMO COMPLETE</h1>

            <div className="demo-end__badge-container">
                <div className="demo-end__badge">{badge}</div>
                <p className="demo-end__badge-desc">{badgeDesc}</p>
            </div>

            <div className="demo-end__stats">
                <div className="demo-end__stat">
                    <span>Final Trust:</span> <span>{trust}%</span>
                </div>
                <div className="demo-end__stat">
                    <span>Accuracy:</span> <span>{accuracy}%</span>
                </div>
                <div className="demo-end__stat">
                    <span>Packages Processed:</span> <span>{processed}</span>
                </div>
                <div className="demo-end__stat">
                    <span>Skipped:</span> <span>{skipCount}</span>
                </div>
            </div>

            <p className="demo-end__message">
                This was only a glimpse of the full system. Your feedback is our only fuel.
            </p>

            <p className="demo-end__motto glow-text">
                Observa. Denuncia. Obedi.
            </p>

            <div className="demo-end__actions">
                <button className="demo-end__btn" onClick={onRestart} id="btn-play-again">
                    [ PLAY AGAIN ]
                </button>
            </div>
        </div>
    );
}
