import React from 'react';
import './QuotaTracker.css';

/**
 * Shows packages processed vs daily quota requirement.
 */
export default function QuotaTracker({ processed, quota }) {
    const isMet = processed >= quota;

    return (
        <div className={`quota-tracker ${isMet ? 'quota-tracker--met' : ''}`} id="quota-tracker">
            <label className="quota-tracker__label">QUOTA</label>
            <span className="quota-tracker__count">
                {processed} / {quota}
            </span>
        </div>
    );
}
