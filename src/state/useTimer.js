import { useState, useEffect, useCallback, useRef } from 'react';

const WORKDAY_DURATION = 120; // 2 minutes in seconds

/**
 * Workday countdown timer hook.
 * Returns seconds remaining and control functions.
 */
export function useTimer(onTimeUp) {
    const [seconds, setSeconds] = useState(WORKDAY_DURATION);
    const [isRunning, setIsRunning] = useState(false);
    const intervalRef = useRef(null);
    const onTimeUpRef = useRef(onTimeUp);

    // Keep ref in sync without triggering render
    useEffect(() => {
        onTimeUpRef.current = onTimeUp;
    });

    useEffect(() => {
        if (!isRunning) return;

        intervalRef.current = setInterval(() => {
            setSeconds(prev => {
                if (prev <= 1) {
                    clearInterval(intervalRef.current);
                    setIsRunning(false);
                    onTimeUpRef.current?.();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(intervalRef.current);
    }, [isRunning]);

    const startTimer = useCallback(() => setIsRunning(true), []);
    const stopTimer = useCallback(() => setIsRunning(false), []);
    const resetTimer = useCallback(() => {
        setIsRunning(false);
        setSeconds(WORKDAY_DURATION);
    }, []);

    const deductTime = useCallback((amount) => {
        setSeconds(prev => {
            if (prev <= 0) return 0;

            const next = Math.max(0, prev - amount);
            if (next === 0) {
                clearInterval(intervalRef.current);
                setIsRunning(false);
                onTimeUpRef.current?.();
            }
            return next;
        });
    }, []);

    const isLowTime = seconds <= 60;

    return { seconds, isRunning, isLowTime, startTimer, stopTimer, resetTimer, deductTime };
}
