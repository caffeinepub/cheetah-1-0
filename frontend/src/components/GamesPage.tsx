import React from 'react';
import { ExternalLink, Gamepad2, Calculator, BookOpen } from 'lucide-react';

interface GameSite {
  name: string;
  description: string;
  url: string;
  thumb: string;
  icon: React.ReactNode;
  tag: string;
  tagColor: string;
}

const GAME_SITES: GameSite[] = [
  {
    name: 'Math Playground',
    description: 'Fun math games, logic puzzles, and problem-solving activities for students of all ages.',
    url: 'https://www.mathplayground.com',
    thumb: '/assets/generated/math-playground-thumb.dim_320x180.png',
    icon: <Calculator size={18} />,
    tag: 'Math & Logic',
    tagColor: 'bg-cheetah-orange/20 text-cheetah-orange border-cheetah-orange/30',
  },
  {
    name: 'Hood Math',
    description: 'Engaging math practice games designed to make learning arithmetic and algebra enjoyable.',
    url: 'https://www.hoodamath.com',
    thumb: '/assets/generated/hood-math-thumb.dim_320x180.png',
    icon: <BookOpen size={18} />,
    tag: 'Math Games',
    tagColor: 'bg-cheetah-yellow/20 text-cheetah-yellow border-cheetah-yellow/30',
  },
  {
    name: 'Unblocked Games',
    description: 'A collection of free browser games that can be played anywhere, anytime without restrictions.',
    url: 'https://sites.google.com/site/unblockedgames66ez',
    thumb: '/assets/generated/unblocked-games-thumb.dim_320x180.png',
    icon: <Gamepad2 size={18} />,
    tag: 'Arcade & Fun',
    tagColor: 'bg-green-500/20 text-green-400 border-green-500/30',
  },
];

interface GamesPageProps {
  onNavigate: (url: string) => void;
}

export function GamesPage({ onNavigate }: GamesPageProps) {
  return (
    <div className="flex-1 overflow-auto bg-cheetah-dark">
      <div className="max-w-4xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-xl bg-cheetah-surface border border-cheetah-border flex items-center justify-center flex-shrink-0">
            <img
              src="/assets/generated/game-controller-icon.dim_128x128.png"
              alt="Games"
              className="w-8 h-8 object-contain"
              onError={e => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  const icon = document.createElement('span');
                  icon.textContent = '🎮';
                  icon.className = 'text-2xl';
                  parent.appendChild(icon);
                }
              }}
            />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground tracking-tight">Games</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Educational games and fun browser activities
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-cheetah-border mb-8" />

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {GAME_SITES.map(site => (
            <GameCard key={site.url} site={site} onNavigate={onNavigate} />
          ))}
        </div>

        {/* Footer note */}
        <p className="text-center text-[10px] text-muted-foreground mt-10 font-mono">
          Click any card to open the site through the Cheetah proxy
        </p>
      </div>
    </div>
  );
}

interface GameCardProps {
  site: GameSite;
  onNavigate: (url: string) => void;
}

function GameCard({ site, onNavigate }: GameCardProps) {
  return (
    <div
      className="group flex flex-col bg-cheetah-surface border border-cheetah-border rounded-xl overflow-hidden hover:border-cheetah-orange/50 hover:shadow-lg hover:shadow-cheetah-orange/5 transition-all duration-200 cursor-pointer"
      onClick={() => onNavigate(site.url)}
    >
      {/* Thumbnail */}
      <div className="relative w-full aspect-video bg-cheetah-darker overflow-hidden">
        <img
          src={site.thumb}
          alt={site.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={e => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
          }}
        />
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-cheetah-darker/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
        {/* Tag badge */}
        <div className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${site.tagColor} backdrop-blur-sm`}>
          {site.tag}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4 gap-3">
        <div className="flex items-center gap-2">
          <span className="text-cheetah-orange/80">{site.icon}</span>
          <h2 className="text-sm font-bold text-foreground group-hover:text-cheetah-orange transition-colors">
            {site.name}
          </h2>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed flex-1">
          {site.description}
        </p>
        <button
          onClick={e => {
            e.stopPropagation();
            onNavigate(site.url);
          }}
          className="flex items-center justify-center gap-1.5 w-full py-2 text-xs font-semibold bg-cheetah-darker border border-cheetah-border rounded-lg text-muted-foreground hover:text-cheetah-orange hover:border-cheetah-orange/40 hover:bg-cheetah-surface2 transition-all group/btn"
        >
          <ExternalLink size={11} className="group-hover/btn:translate-x-0.5 transition-transform" />
          Open Site
        </button>
      </div>
    </div>
  );
}
