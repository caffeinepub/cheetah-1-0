import React from 'react';
import { ExternalLink, Search, AlertCircle } from 'lucide-react';
import { GoogleSearchResult } from '../hooks/useTabManager';

interface SearchResultsProps {
  query: string;
  results: GoogleSearchResult[];
  totalResults?: string;
  onNavigate: (url: string) => void;
}

export function SearchResults({ query, results, totalResults, onNavigate }: SearchResultsProps) {
  if (results.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-cheetah-dark p-8">
        <div className="flex flex-col items-center gap-4 max-w-md text-center">
          <div className="w-12 h-12 rounded-full bg-cheetah-surface border border-cheetah-border flex items-center justify-center">
            <AlertCircle size={22} className="text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">No results found</p>
            <p className="text-xs text-muted-foreground mt-1">
              No results for <span className="text-cheetah-orange font-mono">"{query}"</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-cheetah-dark cheetah-scrollbar">
      <div className="max-w-3xl mx-auto px-6 py-6">
        {/* Search header */}
        <div className="flex items-center gap-2 mb-5 pb-4 border-b border-cheetah-border/50">
          <Search size={14} className="text-cheetah-orange flex-shrink-0" />
          <span className="text-sm text-foreground font-mono">
            Results for <span className="text-cheetah-orange">"{query}"</span>
          </span>
          {totalResults && (
            <span className="text-xs text-muted-foreground ml-auto">
              ~{totalResults} results
            </span>
          )}
        </div>

        {/* Results list */}
        <div className="flex flex-col gap-5">
          {results.map((result, index) => (
            <SearchResultItem
              key={`${result.link}-${index}`}
              result={result}
              onNavigate={onNavigate}
            />
          ))}
        </div>

        {/* Footer note */}
        <div className="mt-8 pt-4 border-t border-cheetah-border/30 text-center">
          <p className="text-[10px] text-muted-foreground font-mono">
            Powered by Google Custom Search · Cheetah
          </p>
        </div>
      </div>
    </div>
  );
}

interface SearchResultItemProps {
  result: GoogleSearchResult;
  onNavigate: (url: string) => void;
}

function SearchResultItem({ result, onNavigate }: SearchResultItemProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (result.link) {
      onNavigate(result.link);
    }
  };

  return (
    <article className="group flex flex-col gap-1.5">
      {/* Display URL */}
      <div className="flex items-center gap-1.5">
        <div className="w-4 h-4 rounded-sm bg-cheetah-surface border border-cheetah-border/60 flex items-center justify-center flex-shrink-0">
          <ExternalLink size={9} className="text-muted-foreground" />
        </div>
        <span className="text-[11px] text-muted-foreground font-mono truncate">
          {result.displayLink || result.link}
        </span>
      </div>

      {/* Title — clickable */}
      <button
        onClick={handleClick}
        className="text-left text-sm font-semibold text-cheetah-orange hover:text-cheetah-yellow transition-colors leading-snug group-hover:underline underline-offset-2"
      >
        {result.title}
      </button>

      {/* Snippet */}
      {result.snippet && (
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
          {result.snippet}
        </p>
      )}
    </article>
  );
}
