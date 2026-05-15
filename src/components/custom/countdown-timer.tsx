import { useState, useEffect } from "react";

import { Card, CardContent } from "@/components/ui/card";

import Odometer from "../animations/animate-odometer";

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

  if (expired) return null;

  return (
    <div className="grid grid-cols-4 gap-1 sm:gap-3 justify-center min-w-xs max-w-md mt-8 mx-auto">
      {timeKeys.map((unit) => (
        <Card key={unit} className="bg-card/50 backdrop-blur-md" size="sm">
          <CardContent className="flex flex-col items-center">
            <span className="font-mono text-2xl sm:text-3xl font-bold text-foreground tabular-nums">
              <Odometer value={timeLeft[unit]} pad={2} />
            </span>
            <span className="text-3xs sm:text-2xs uppercase tracking-widest text-muted-foreground font-bold mt-1">
              {unit}
            </span>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default CountdownTimer;
