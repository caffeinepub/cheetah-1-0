import React, { useState } from 'react';
import { useCloaking, CloakMode } from '../hooks/useCloaking';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu';
import { ChevronDown } from 'lucide-react';

const CLOAK_MODES: { value: CloakMode; label: string }[] = [
  { value: 'about:blank', label: 'about:blank' },
  { value: 'https://error', label: 'https://error' },
  { value: '123456789101112', label: '123456789101112' },
];

export function CloakButton() {
  const { cloak } = useCloaking();
  const [selectedMode, setSelectedMode] = useState<CloakMode>('about:blank');

  const handleCloak = () => {
    cloak(selectedMode);
  };

  return (
    <TooltipProvider>
      <div className="flex items-center gap-0.5">
        {/* Falcon cloak trigger */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={handleCloak}
              className="
                flex items-center justify-center w-8 h-8 rounded-l
                bg-cheetah-surface border border-cheetah-border border-r-0
                text-muted-foreground hover:text-cheetah-orange hover:border-cheetah-orange/50
                transition-all duration-150 hover:cheetah-glow
                text-sm font-bold select-none
              "
              title={`Cloak as ${selectedMode}`}
            >
              🦅
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="bg-cheetah-surface border-cheetah-border text-xs">
            Cloak as <span className="text-cheetah-orange font-mono">{selectedMode}</span>
          </TooltipContent>
        </Tooltip>

        {/* Mode selector dropdown */}
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <button
                  className="
                    flex items-center justify-center w-5 h-8 rounded-r
                    bg-cheetah-surface border border-cheetah-border
                    text-muted-foreground hover:text-cheetah-orange hover:border-cheetah-orange/50
                    transition-all duration-150
                    select-none
                  "
                  aria-label="Select cloaking mode"
                >
                  <ChevronDown className="w-3 h-3" />
                </button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="bg-cheetah-surface border-cheetah-border text-xs">
              Cloaking mode
            </TooltipContent>
          </Tooltip>

          <DropdownMenuContent
            align="end"
            className="bg-cheetah-surface border-cheetah-border text-foreground min-w-[180px]"
          >
            <DropdownMenuLabel className="text-cheetah-orange text-xs font-semibold tracking-wide uppercase px-2 py-1.5">
              🦅 Falcon Cloak Mode
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-cheetah-border" />
            <DropdownMenuRadioGroup
              value={selectedMode}
              onValueChange={(v) => setSelectedMode(v as CloakMode)}
            >
              {CLOAK_MODES.map((mode) => (
                <DropdownMenuRadioItem
                  key={mode.value}
                  value={mode.value}
                  className="
                    font-mono text-xs cursor-pointer
                    focus:bg-cheetah-orange/10 focus:text-cheetah-orange
                    data-[state=checked]:text-cheetah-orange
                  "
                >
                  {mode.label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </TooltipProvider>
  );
}
