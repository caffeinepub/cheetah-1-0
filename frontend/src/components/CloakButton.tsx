import React from 'react';
import { useCloaking } from '../hooks/useCloaking';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';

export function CloakButton() {
  const { cloak } = useCloaking();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={cloak}
            className="
              flex items-center justify-center w-8 h-8 rounded
              bg-cheetah-surface border border-cheetah-border
              text-muted-foreground hover:text-cheetah-orange hover:border-cheetah-orange/50
              transition-all duration-150 hover:cheetah-glow
              text-sm font-bold select-none
            "
            title="Cloak as about:blank"
          >
            🦅
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="bg-cheetah-surface border-cheetah-border text-xs">
          Cloak as about:blank
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
