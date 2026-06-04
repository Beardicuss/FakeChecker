/**
 * CRT visual effect timing helpers.
 * Used by CrtOverlay to trigger random screen flickers/glitches.
 */

export function getRandomFlickerDelay() {
    return 3000 + Math.random() * 8000; // 3-11 seconds between flickers
}

export function getFlickerDuration() {
    return 50 + Math.random() * 150; // 50-200ms flicker
}

export function getGlitchChance() {
    return Math.random() < 0.15; // 15% chance of a glitch on each flicker
}
