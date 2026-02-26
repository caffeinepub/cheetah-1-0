import React, { useState, useEffect } from 'react';

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

function HomeClockWidget() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const hours = pad(now.getHours());
  const minutes = pad(now.getMinutes());
  const ampm = now.getHours() >= 12 ? 'PM' : 'AM';
  const h12 = now.getHours() % 12 || 12;

  return (
    <div className="flex items-center gap-2 text-home-clock select-none">
      <span className="text-lg font-light tracking-widest font-mono">
        {pad(h12)}:{minutes} {ampm}
      </span>
    </div>
  );
}

interface HomePageProps {
  onNavigate: (page: 'proxy' | 'games' | 'search') => void;
}

export function HomePage({ onNavigate }: HomePageProps) {
  return (
    <div className="home-bg relative flex flex-col items-center justify-between w-full h-full overflow-hidden">
      {/* Radial glow overlay */}
      <div className="absolute inset-0 home-radial-glow pointer-events-none" />

      {/* Top: Clock */}
      <div className="relative z-10 flex flex-col items-center pt-8 gap-1">
        <HomeClockWidget />
      </div>

      {/* Center: Branding */}
      <div className="relative z-10 flex flex-col items-center gap-4 text-center px-6">
        <h1 className="home-title-gradient text-7xl sm:text-8xl font-black tracking-tight leading-none select-none">
          CHEETAH
        </h1>
        <p className="text-home-subtitle text-base font-light tracking-wide">
          Fast. Free. Always on.
        </p>
      </div>

      {/* Bottom: Info */}
      <div className="relative z-10 flex items-center gap-3 pb-8 text-home-info text-sm font-light tracking-wide select-none">
        <span>v1.0</span>
        <span className="opacity-40">|</span>
        <span className="flex items-center gap-1.5">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="opacity-70">
            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
          </svg>
          Discord
        </span>
      </div>
    </div>
  );
}
