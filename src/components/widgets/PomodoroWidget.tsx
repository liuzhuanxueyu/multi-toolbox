import { useState, useEffect, useCallback } from 'react';
import { Card, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';

const WORK_TIME = 25 * 60; // 25 分钟
const BREAK_TIME = 5 * 60; // 5 分钟

export function PomodoroWidget() {
  const [timeLeft, setTimeLeft] = useState(WORK_TIME);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const reset = useCallback(() => {
    setTimeLeft(isBreak ? BREAK_TIME : WORK_TIME);
    setIsRunning(false);
  }, [isBreak]);

  const toggle = () => setIsRunning((prev) => !prev);

  const switchMode = () => {
    setIsBreak((prev) => !prev);
    setTimeLeft(isBreak ? WORK_TIME : BREAK_TIME);
    setIsRunning(false);
  };

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          // 可以在这里添加通知
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning]);

  return (
    <Card variant="bordered">
      <CardTitle className="flex items-center gap-2">
        🍅 番茄钟
      </CardTitle>
      <CardContent>
        <div className="text-center space-y-4">
          <div className="text-4xl font-mono font-bold text-[var(--text-primary)]">
            {formatTime(timeLeft)}
          </div>
          <p className="text-sm text-[var(--text-secondary)]">
            {isBreak ? '休息时间' : '专注时间'}
          </p>
          <div className="flex gap-2 justify-center">
            <Button size="sm" onClick={toggle}>
              {isRunning ? '暂停' : '开始'}
            </Button>
            <Button size="sm" variant="secondary" onClick={reset}>
              重置
            </Button>
            <Button size="sm" variant="ghost" onClick={switchMode}>
              {isBreak ? '工作' : '休息'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

