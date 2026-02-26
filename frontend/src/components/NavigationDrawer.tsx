import React, { useEffect } from 'react';
import { Home, Globe, Gamepad2, Search, X } from 'lucide-react';

interface NavItem {
  id: 'home' | 'proxy' | 'games' | 'search';
  label: string;
  icon: React.ReactNode;
  description: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    id: 'home',
    label: 'Home',
    icon: <Home size={18} />,
    description: 'Return to the start page',
  },
  {
    id: 'proxy',
    label: 'Browser',
    icon: <Globe size={18} />,
    description: 'Browse the web',
  },
  {
    id: 'games',
    label: 'Games',
    icon: <Gamepad2 size={18} />,
    description: 'Play unblocked games',
  },
  {
    id: 'search',
    label: 'Search',
    icon: <Search size={18} />,
    description: 'Search the web',
  },
];

interface NavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: 'home' | 'proxy' | 'games' | 'search') => void;
}

export function NavigationDrawer({ isOpen, onClose, onNavigate }: NavigationDrawerProps) {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-200 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Drawer panel */}
      <div
        className={`fixed left-0 top-0 bottom-0 z-50 w-64 flex flex-col nav-drawer-bg border-r nav-drawer-border shadow-2xl transition-transform duration-250 ease-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b nav-drawer-border">
          <div className="flex items-center gap-2">
            <img
              src="/assets/generated/cheetah-logo.dim_128x128.png"
              alt="Cheetah"
              className="w-6 h-6 object-contain"
              onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
            <span className="text-sm font-bold text-cheetah-orange tracking-wider">CHEETAH</span>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-cheetah-surface transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-2 py-3 flex flex-col gap-1">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => {
                onNavigate(item.id);
                onClose();
              }}
              className="flex items-center gap-3 px-3 py-3 rounded-lg text-left w-full group transition-colors hover:bg-cheetah-surface"
            >
              <span className="text-cheetah-orange/70 group-hover:text-cheetah-orange transition-colors flex-shrink-0">
                {item.icon}
              </span>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-medium text-foreground">{item.label}</span>
                <span className="text-xs text-muted-foreground truncate">{item.description}</span>
              </div>
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-4 py-3 border-t nav-drawer-border">
          <p className="text-[10px] text-muted-foreground text-center">
            Built with ❤️ using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname || 'cheetah-proxy')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-cheetah-orange/70 hover:text-cheetah-orange transition-colors"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </>
  );
}
