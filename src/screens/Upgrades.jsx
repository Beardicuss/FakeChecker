import { useCallback } from 'react';

// Tier 1 (Partial) icons
import fanFilterImg from '../assets/upgrades/fan-filter.png';
import fanFilterSelImg from '../assets/upgrades/fan-filter-selected.png';
import genBatteryImg from '../assets/upgrades/gen-backup-battery.png';
import genBatterySelImg from '../assets/upgrades/gen-backup-battery-selected.png';
import cablesInsImg from '../assets/upgrades/cables-insulation.png';
import cablesInsSelImg from '../assets/upgrades/cables-insulation-selected.png';
import termCacheImg from '../assets/upgrades/term-cache-clean.png';
import termCacheSelImg from '../assets/upgrades/term-cache-clean-selected.png';

// Tier 2 (Full) icons
import fanWaterImg from '../assets/upgrades/fan-water-cooling.png';
import fanWaterSelImg from '../assets/upgrades/fan-water-cooling-selected.png';
import genUpsImg from '../assets/upgrades/gen-ups.png';
import genUpsSelImg from '../assets/upgrades/gen-ups-selected.png';
import cablesFiberImg from '../assets/upgrades/cables-fiber.png';
import cablesFiberSelImg from '../assets/upgrades/cables-fiber-selected.png';
import termOsImg from '../assets/upgrades/term-os-update.png';
import termOsSelImg from '../assets/upgrades/term-os-update-selected.png';

import './Upgrades.css';

const UPGRADE_CONFIG = [
    {
        key: 'fan',
        label: 'COOLING SYSTEM',
        tiers: [
            { name: 'Dust Filter', desc: 'Reduces overheating frequency', cost: 30, img: fanFilterImg, imgSel: fanFilterSelImg },
            { name: 'Water Cooling', desc: 'Eliminates overheating entirely', cost: 80, img: fanWaterImg, imgSel: fanWaterSelImg },
        ],
    },
    {
        key: 'generator',
        label: 'POWER SUPPLY',
        tiers: [
            { name: 'Backup Battery', desc: 'Reduces power failure frequency', cost: 30, img: genBatteryImg, imgSel: genBatterySelImg },
            { name: 'UPS Module', desc: 'Eliminates power failures entirely', cost: 80, img: genUpsImg, imgSel: genUpsSelImg },
        ],
    },
    {
        key: 'cables',
        label: 'WIRING SYSTEM',
        tiers: [
            { name: 'Cable Insulation', desc: 'Reduces screen flickering frequency', cost: 30, img: cablesInsImg, imgSel: cablesInsSelImg },
            { name: 'Fiber Optic Link', desc: 'Eliminates flickering entirely', cost: 80, img: cablesFiberImg, imgSel: cablesFiberSelImg },
        ],
    },
    {
        key: 'terminal',
        label: 'OPERATING SYSTEM',
        tiers: [
            { name: 'Cache Cleanup', desc: 'Reduces system freezes frequency', cost: 30, img: termCacheImg, imgSel: termCacheSelImg },
            { name: 'OS Update', desc: 'Eliminates system freezes entirely', cost: 80, img: termOsImg, imgSel: termOsSelImg },
        ],
    },
];

/**
 * Upgrades shop screen — purchase partial or full upgrades between shifts.
 */
export default function Upgrades({ currency, setCurrency, upgrades, setUpgrades, onContinue }) {

    const handlePurchase = useCallback((systemKey, tier) => {
        const config = UPGRADE_CONFIG.find(c => c.key === systemKey);
        const tierData = config.tiers[tier - 1];
        if (currency < tierData.cost) return;
        if (upgrades[systemKey] >= tier) return;

        setCurrency(prev => prev - tierData.cost);
        setUpgrades(prev => ({ ...prev, [systemKey]: tier }));
    }, [currency, upgrades, setCurrency, setUpgrades]);

    return (
        <div className="upgrades" id="upgrades-screen">
            <h1 className="upgrades__title glow-text">WORKSTATION UPGRADES</h1>
            <p className="upgrades__credits">CREDITS: <span className="upgrades__credits-value">{currency}</span></p>

            <div className="upgrades__grid">
                {UPGRADE_CONFIG.map(system => {
                    const currentTier = upgrades[system.key];

                    return (
                        <div key={system.key} className="upgrades__category">
                            <h2 className="upgrades__category-title">{system.label}</h2>

                            <div className="upgrades__tiers">
                                {system.tiers.map((tierData, idx) => {
                                    const tier = idx + 1;
                                    const isPurchased = currentTier >= tier;
                                    const isLocked = tier === 2 && currentTier < 1;
                                    const canAfford = currency >= tierData.cost;

                                    return (
                                        <div
                                            key={tier}
                                            className={`upgrades__card ${isPurchased ? 'upgrades__card--purchased' : ''} ${isLocked ? 'upgrades__card--locked' : ''} ${!canAfford && !isPurchased ? 'upgrades__card--expensive' : ''}`}
                                            onClick={() => !isPurchased && !isLocked && canAfford && handlePurchase(system.key, tier)}
                                        >
                                            <img
                                                src={isPurchased ? tierData.imgSel : tierData.img}
                                                alt={tierData.name}
                                                className="upgrades__card-img"
                                            />
                                            <div className="upgrades__card-info">
                                                <span className="upgrades__card-name">{tierData.name}</span>
                                                <span className="upgrades__card-desc">{tierData.desc}</span>
                                                <span className="upgrades__card-cost">
                                                    {isPurchased ? '[ INSTALLED ]' : isLocked ? '[ REQUIRES TIER 1 ]' : `COST: ${tierData.cost}`}
                                                </span>
                                            </div>
                                            <span className="upgrades__card-tier">{tier === 1 ? 'PARTIAL' : 'FULL'}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>

            <button className="upgrades__continue-btn" onClick={onContinue}>
                [ CONTINUE TO NEXT SHIFT ]
            </button>
        </div>
    );
}
