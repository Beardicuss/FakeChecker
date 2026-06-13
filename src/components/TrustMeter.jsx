import trustHigh from '../assets/icons/trust-high.webp';
import trustMedium from '../assets/icons/trust-medium.webp';
import trustLow from '../assets/icons/trust-low.webp';
import redBlock from '../assets/icons/red.webp';
import yellowBlock from '../assets/icons/yellow.webp';
import greenBlock from '../assets/icons/green.webp';
import './TrustMeter.css';

const TRUST_ICONS = { high: trustHigh, mid: trustMedium, low: trustLow };
const TOTAL_BLOCKS = 10;

/**
 * Ministry Trust percentage rendered as a discrete 10-block meter.
 */
export default function TrustMeter({ trust }) {
    const level = trust > 60 ? 'high' : trust > 25 ? 'mid' : 'low';

    // Calculate how many blocks to illuminate based on percentage
    const activeBlocksCount = Math.round((trust / 100) * TOTAL_BLOCKS);

    const blocks = Array.from({ length: TOTAL_BLOCKS }, (_, i) => {
        let asset = redBlock;
        if (i >= 3 && i < 7) asset = yellowBlock;
        if (i >= 7) asset = greenBlock;

        const isActive = i < activeBlocksCount;
        return { id: i, asset, isActive };
    });

    return (
        <div className="trust-meter" id="trust-meter">
            <img
                src={TRUST_ICONS[level]}
                alt="Trust level"
                className="trust-meter__icon"
            />
            <div className="trust-meter__info">
                <label className="trust-meter__label">MINISTRY TRUST</label>
                <div className="trust-meter__blocks">
                    {blocks.map(b => (
                        <img
                            key={b.id}
                            src={b.asset}
                            className={`trust-meter__block ${!b.isActive ? 'trust-meter__block--inactive' : ''}`}
                            alt="trust-block"
                        />
                    ))}
                </div>
                <span className="trust-meter__value">{trust}%</span>
            </div>
        </div>
    );
}
