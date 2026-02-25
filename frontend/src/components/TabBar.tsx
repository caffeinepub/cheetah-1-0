import React from 'react';
import { X, Plus } from 'lucide-react';
import { TabState } from '../hooks/useTabManager';

interface TabBarProps {
  tabs: TabState[];
  activeTabId: string;
  onSwitchTab: (id: string) => void;
  onCloseTab: (id: string) => void;
  onAddTab: () => void;
}

export function TabBar({ tabs, activeTabId, onSwitchTab, onCloseTab, onAddTab }: TabBarProps) {
  return (
    <div className="flex items-end h-9 bg-cheetah-darker overflow-x-auto scrollbar-thin flex-shrink-0">
      <div className="flex items-end min-w-0 flex-1">
        {tabs.map(tab => {
          const isActive = tab.id === activeTabId;
          return (
            <div
              key={tab.id}
              onClick={() => onSwitchTab(tab.id)}
              className={`
                group relative flex items-center gap-1.5 px-3 h-8 min-w-[120px] max-w-[200px] cursor-pointer
                border-r border-cheetah-border flex-shrink-0 select-none transition-colors
                ${isActive
                  ? 'bg-cheetah-dark text-foreground tab-active-glow'
                  : 'bg-cheetah-darker text-muted-foreground hover:bg-cheetah-surface hover:text-foreground'
                }
              `}
            >
              {/* Favicon placeholder */}
              <div className={`w-3 h-3 rounded-full flex-shrink-0 ${isActive ? 'bg-cheetah-orange' : 'bg-cheetah-border'}`} />

              <span className="text-xs font-medium truncate flex-1 min-w-0">
                {tab.isLoading ? 'Loading...' : (tab.title || 'New Tab')}
              </span>

              <button
                onClick={e => { e.stopPropagation(); onCloseTab(tab.id); }}
                className={`
                  flex-shrink-0 w-4 h-4 rounded flex items-center justify-center
                  opacity-0 group-hover:opacity-100 transition-opacity
                  hover:bg-cheetah-surface2 text-muted-foreground hover:text-foreground
                  ${isActive ? 'opacity-60' : ''}
                `}
              >
                <X size={10} />
              </button>

              {tab.isLoading && (
                <div className="absolute bottom-0 left-0 h-0.5 bg-cheetah-orange animate-pulse-orange w-full" />
              )}
            </div>
          );
        })}
      </div>

      <button
        onClick={onAddTab}
        className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-cheetah-orange hover:bg-cheetah-surface transition-colors"
        title="New Tab"
      >
        <Plus size={14} />
      </button>
    </div>
  );
}
