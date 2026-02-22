import { useState, useEffect } from 'react';

const CountdownTimer = ({ targetDate, targetTime }) => {
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    const [expired, setExpired] = useState(false);

    useEffect(() => {
        const getTarget = () => {
            const dt = new Date(targetDate);
            if (targetTime) {
                const [h, m] = targetTime.split(':');
                dt.setHours(parseInt(h), parseInt(m), 0);
            }
            return dt;
        };

        const calculate = () => {
            const now = new Date();
            const target = getTarget();
            const diff = target - now;
            if (diff <= 0) { setExpired(true); return; }

            setTimeLeft({
                days: Math.floor(diff / (1000 * 60 * 60 * 24)),
                hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
                seconds: Math.floor((diff % (1000 * 60)) / 1000),
            });
        };

        calculate();
        const timer = setInterval(calculate, 1000);
        return () => clearInterval(timer);
    }, [targetDate, targetTime]);

    if (expired) {
        return (
            <div className="flex items-center justify-center gap-2 py-3">
                <span className="text-lg font-display text-[#39FF14] neon-text animate-pulse">⚽ MATCH TIME!</span>
            </div>
        );
    }

    const units = [
        { label: 'DAYS', value: timeLeft.days },
        { label: 'HRS', value: timeLeft.hours },
        { label: 'MIN', value: timeLeft.minutes },
        { label: 'SEC', value: timeLeft.seconds },
    ];

    return (
        <div className="flex items-center gap-3 md:gap-4">
            {units.map((unit, idx) => (
                <div key={unit.label} className="flex items-center">
                    <div className="text-center">
                        <div className="glass-card rounded-xl px-3 py-2 md:px-4 md:py-3 min-w-[56px] md:min-w-[68px]">
                            <div className="font-display font-bold text-2xl md:text-3xl neon-text">
                                {String(unit.value).padStart(2, '0')}
                            </div>
                            <div className="text-[9px] md:text-[11px] text-gray-500 font-medium tracking-widest mt-0.5">
                                {unit.label}
                            </div>
                        </div>
                    </div>
                    {idx < 3 && (
                        <span className="text-[#39FF14] font-bold text-xl md:text-2xl ml-3 md:ml-4 animate-pulse">:</span>
                    )}
                </div>
            ))}
        </div>
    );
};

export default CountdownTimer;
