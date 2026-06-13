/**
 * Trust score calculation utilities.
 * Correct = +4, Wrong = -8, Skip = -3, Quota fail = -30, Perfect day = +5.
 */

export const TRUST_DELTAS = {
    correct: 4,
    wrong: -8,
    quotaFail: -30,
    perfectDay: 5,
};

export const INITIAL_TRUST = 40;
export const MIN_TRUST = 0;
export const MAX_TRUST = 100;

export function calculateTrustDelta(playerChoice, ministryVerdict) {
    if (playerChoice === ministryVerdict) return TRUST_DELTAS.correct;
    return TRUST_DELTAS.wrong;
}

export function clampTrust(value) {
    return Math.max(MIN_TRUST, Math.min(MAX_TRUST, value));
}
