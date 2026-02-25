import React, { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { Search, Globe, ArrowRight, X } from 'lucide-react';

interface AddressBarProps {
  url: string;
  isLoading: boolean;
  onNavigate: (input: string) => void;
  onStop?: () => void;
}

function isUrl(input: string): boolean {
  const trimmed = input.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return true;
  const domainPattern = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z]{2,})+/;
  return domainPattern.test(trimmed) && !trimmed.includes(' ');
}

export function AddressBar({ url, isLoading, onNavigate, onStop }: AddressBarProps) {
  const [inputValue, setInputValue] = useState(url);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync with external URL changes when not focused
  useEffect(() => {
    if (!isFocused) {
      setInputValue(url);
    }
  }, [url, isFocused]);

  const handleSubmit = () => {
    const val = inputValue.trim();
    if (!val) return;
    onNavigate(val);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
    if (e.key === 'Escape') {
      setInputValue(url);
      inputRef.current?.blur();
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
    setTimeout(() => inputRef.current?.select(), 0);
  };

  const handleBlur = () => {
    setIsFocused(false);
    // Reset to the current URL (not the search: prefix version)
    setInputValue(url);
  };

  const isSearch = inputValue && !isUrl(inputValue);

  return (
    <div
      className={`
        flex items-center gap-2 flex-1 h-8 px-3 rounded
        bg-cheetah-surface border border-cheetah-border
        transition-all duration-150
        ${isFocused ? 'address-bar-focus border-cheetah-orange/50' : 'hover:border-cheetah-border/80'}
      `}
    >
      <div className="flex-shrink-0 text-muted-foreground">
        {isLoading ? (
          <div className="w-3.5 h-3.5 border-2 border-cheetah-orange/30 border-t-cheetah-orange rounded-full animate-spin" />
        ) : isSearch && isFocused ? (
          <Search size={13} className="text-cheetah-orange" />
        ) : (
          <Globe size={13} />
        )}
      </div>

      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={e => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder="Search or enter URL..."
        className="
          flex-1 bg-transparent text-xs font-mono text-foreground placeholder:text-muted-foreground
          outline-none border-none min-w-0
        "
        spellCheck={false}
        autoComplete="off"
      />

      {isFocused && inputValue && (
        <button
          onMouseDown={e => { e.preventDefault(); setInputValue(''); }}
          className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
          tabIndex={-1}
        >
          <X size={12} />
        </button>
      )}

      {isFocused && inputValue && (
        <button
          onMouseDown={e => {
            e.preventDefault();
            handleSubmit();
          }}
          className="flex-shrink-0 text-cheetah-orange hover:text-cheetah-yellow transition-colors"
          tabIndex={-1}
        >
          <ArrowRight size={13} />
        </button>
      )}

      {isLoading && !isFocused && onStop && (
        <button
          onClick={onStop}
          className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
          tabIndex={-1}
        >
          <X size={12} />
        </button>
      )}
    </div>
  );
}
