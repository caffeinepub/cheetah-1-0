import React from 'react';
import { Home } from 'lucide-react';

interface HomeIconButtonProps {
  onClick: () => void;
}

export function HomeIconButton({ onClick }: HomeIconButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-4 left-4 z-30 w-10 h-10 flex items-center justify-center rounded-xl home-icon-btn shadow-lg transition-all duration-150 hover:scale-105 active:scale-95"
      title="Navigation"
      aria-label="Open navigation menu"
    >
      <Home size={18} />
    </button>
  );
}
