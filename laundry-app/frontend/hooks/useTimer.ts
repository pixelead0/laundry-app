import { useEffect, useState } from 'react';

export const useTimer = (targetDate: string | null) => {
    const [timeLeft, setTimeLeft] = useState<number | null>(null);
    const [isOverdue, setIsOverdue] = useState(false);

    useEffect(() => {
        if (!targetDate) {
            setTimeLeft(null);
            setIsOverdue(false);
            return;
        }

        const tick = () => {
            let endTimeStr = targetDate;
            if (!endTimeStr.endsWith('Z') && !endTimeStr.includes('+') && !endTimeStr.includes('-')) {
                endTimeStr += 'Z';
            }
            const end = new Date(endTimeStr).getTime();
            const now = new Date().getTime();
            const diff = end - now;

            setTimeLeft(Math.floor(diff / 1000));
            setIsOverdue(diff < 0);
        };

        tick();
        const timer = setInterval(tick, 1000);
        return () => clearInterval(timer);
    }, [targetDate]);

    const formatTime = (seconds: number) => {
        const absSec = Math.abs(seconds);
        const mins = Math.floor(absSec / 60);
        const secs = absSec % 60;
        const sign = seconds < 0 ? '-' : '';
        return `${sign}${mins}m ${secs}s`;
    };

    return {
        secondsLeft: timeLeft,
        isOverdue,
        formattedTime: timeLeft !== null ? formatTime(timeLeft) : '---'
    };
};
