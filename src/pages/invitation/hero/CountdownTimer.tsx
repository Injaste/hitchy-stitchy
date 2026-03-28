import { useState, useEffect } from "react";

import { Card, CardContent } from "@/components/ui/card";

import OdometerDigit from "./OdometerDigit";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const CountdownTimer = ({ targetDate }: { targetDate: Date }) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [expired, setExpired] = useState(false);

  const timeKeys = Object.keys(timeLeft) as (keyof TimeLeft)[];

  useEffect(() => {
    const tick = () => {
      const distance = targetDate.getTime() - Date.now();
      if (distance <= 0) {
        setExpired(true);
        return;
      }
      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor(
          (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
        ),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      });
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  const renderOdometer = (val: number, pad: number = 2) => {
    const digits = val.toString().padStart(pad, "0").split("").map(Number);

    return (
      <div className="flex">
        {digits.map((digit, i) => (
          <OdometerDigit key={i} value={digit} />
        ))}
      </div>
    );
  };

  if (expired) return null;

  return (
    <div className="grid grid-cols-4 gap-1 sm:gap-3 justify-center min-w-xs max-w-md mt-8 mx-auto">
      {timeKeys.map((unit) => (
        <Card key={unit} className="bg-card/50 backdrop-blur-md" size="sm">
          <CardContent className="flex flex-col items-center">
            <span className="font-mono text-2xl sm:text-3xl font-bold text-foreground tabular-nums">
              {renderOdometer(timeLeft[unit], 2)}
            </span>
            <span className="text-[9px] sm:text-[10px] uppercase tracking-widest text-muted-foreground font-bold mt-1">
              {unit}
            </span>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default CountdownTimer;
