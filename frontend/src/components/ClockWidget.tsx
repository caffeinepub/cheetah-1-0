import React, { useState, useEffect } from 'react';

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

export function ClockWidget() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const hours = pad(now.getHours());
  const minutes = pad(now.getMinutes());
  const seconds = pad(now.getSeconds());

  const dayName = now.toLocaleDateString(undefined, { weekday: 'short' });
  const month = now.toLocaleDateString(undefined, { month: 'short' });
  const date = now.getDate();

  return (
    <div className="flex flex-col items-end leading-none select-none flex-shrink-0">
      <span className="text-[11px] font-mono font-semibold text-cheetah-orange tracking-wider">
        {hours}:{minutes}
        <span className="text-cheetah-orange/50">:{seconds}</span>
      </span>
      <span className="text-[9px] text-muted-foreground font-mono tracking-wide mt-0.5">
        {dayName} {month} {date}
      </span>
    </div>
  );
}
