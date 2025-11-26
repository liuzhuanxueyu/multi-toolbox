import { useState, useEffect } from 'react';
import { Card, CardTitle, CardContent } from '../ui/Card';

interface CountdownProps {
  targetDate?: string;
  title?: string;
}

export function CountdownWidget({ 
  targetDate = new Date(new Date().getFullYear(), 11, 31).toISOString(),
  title = '年末倒计时'
}: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculate = () => {
      const now = new Date().getTime();
      const target = new Date(targetDate).getTime();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      });
    };

    calculate();
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return (
    <Card variant="bordered">
      <CardTitle className="flex items-center gap-2">
        ⏰ {title}
      </CardTitle>
      <CardContent>
        <div className="grid grid-cols-4 gap-2 text-center">
          {[
            { value: timeLeft.days, label: '天' },
            { value: timeLeft.hours, label: '时' },
            { value: timeLeft.minutes, label: '分' },
            { value: timeLeft.seconds, label: '秒' },
          ].map((item) => (
            <div key={item.label}>
              <div className="text-2xl font-bold text-[var(--text-primary)]">
                {item.value}
              </div>
              <div className="text-xs text-[var(--text-secondary)]">{item.label}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

