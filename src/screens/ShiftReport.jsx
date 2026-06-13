import statCorrect from '../assets/icons/stat-correct.webp';
import statErrors from '../assets/icons/stat-errors.webp';
import statProcessed from '../assets/icons/stat-processed.webp';
import './ShiftReport.css';

/**
 * End-of-day shift report showing approved decisions and stats with icons.
 */
export default function ShiftReport({ processed, correctCount, wrongCount, trust, day, onContinue }) {
    const total = correctCount + wrongCount;
    const accuracy = total > 0 ? Math.round((correctCount / total) * 100) : 0;

    return (
        <div className="shift-report" id="shift-report">
            <h1 className="shift-report__title glow-text">SHIFT REPORT — DAY {day}</h1>

            <div className="shift-report__stats">
                <div className="shift-report__row">
                    <div className="shift-report__label-group">
                        <img src={statCorrect} alt="Correct" className="shift-report__icon" />
                        <span className="shift-report__label">Approved Decisions:</span>
                    </div>
                    <span className="shift-report__value">{correctCount}</span>
                </div>
                <div className="shift-report__row">
                    <div className="shift-report__label-group">
                        <img src={statErrors} alt="Wrong" className="shift-report__icon" />
                        <span className="shift-report__label">Rejected Decisions:</span>
                    </div>
                    <span className="shift-report__value shift-report__value--warn">{wrongCount}</span>
                </div>
                <div className="shift-report__row">
                    <div className="shift-report__label-group">
                        <img src={statProcessed} alt="Processed" className="shift-report__icon" />
                        <span className="shift-report__label">Total Processed:</span>
                    </div>
                    <span className="shift-report__value">{processed}</span>
                </div>
                <div className="shift-report__divider" />

                <div className="shift-report__row">
                    <div className="shift-report__label-group">
                        <span className="shift-report__label" style={{ marginLeft: '32px' }}>Accuracy:</span>
                    </div>
                    <span className="shift-report__value">{accuracy}%</span>
                </div>
                <div className="shift-report__row">
                    <div className="shift-report__label-group">
                        <span className="shift-report__label" style={{ marginLeft: '32px' }}>Ministry Trust:</span>
                    </div>
                    <span className="shift-report__value">{trust}%</span>
                </div>
            </div>

            <div className="shift-report__comment">
                {accuracy >= 80
                    ? '«Efficient. The Ministry is pleased.»'
                    : accuracy >= 50
                        ? '«Acceptable performance. Room for improvement.»'
                        : '«Your record has been noted. Do better.»'}
            </div>

            <button className="shift-report__btn" onClick={onContinue} id="btn-continue">
                [ VIEW DEMO RESULTS ]
            </button>
        </div>
    );
}
