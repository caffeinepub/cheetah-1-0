import React, { useState } from 'react';
import { RotateCcw, Home, Shield, Gamepad2 } from 'lucide-react';
import { TabBar } from './TabBar';
import { AddressBar } from './AddressBar';
import { CloakButton } from './CloakButton';
import { ProxyContent } from './ProxyContent';
import { SearchResults } from './SearchResults';
import { GamesPage } from './GamesPage';
import { ClockWidget } from './ClockWidget';
import { useTabManager } from '../hooks/useTabManager';
import { useProxyRequest, useSearchRequest } from '../hooks/useQueries';

function isUrl(input: string): boolean {
  const trimmed = input.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return true;
  const domainPattern = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z]{2,})+/;
  return domainPattern.test(trimmed) && !trimmed.includes(' ');
}

function normalizeUrl(input: string): string {
  const trimmed = input.trim();
  if (trimmed.startsWith('http://')) {
    return 'https://' + trimmed.slice('http://'.length);
  }
  if (trimmed.startsWith('https://')) return trimmed;
  if (isUrl(trimmed)) return `https://${trimmed}`;
  return trimmed;
}

function extractTitle(html: string, fallback: string): string {
  const match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return match ? match[1].trim().slice(0, 50) : fallback;
}

function getHostname(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

export function BrowserLayout() {
  const { tabs, activeTabId, activeTab, addTab, closeTab, switchTab, updateTab } = useTabManager();
  const proxyMutation = useProxyRequest();
  const searchMutation = useSearchRequest();
  const [showGames, setShowGames] = useState(false);

  const navigate = async (input: string, tabId?: string) => {
    const targetId = tabId ?? activeTabId;
    const trimmed = input.trim();
    if (!trimmed) return;

    // Close games page when navigating to a URL
    setShowGames(false);

    // Don't navigate to "search: ..." prefixed strings
    const cleanInput = trimmed.startsWith('search: ') ? trimmed.slice('search: '.length) : trimmed;

    const isUrlInput = isUrl(cleanInput);
    const normalizedUrl = isUrlInput ? normalizeUrl(cleanInput) : cleanInput;

    // Set loading state immediately
    updateTab(targetId, {
      isLoading: true,
      error: null,
      url: isUrlInput ? normalizedUrl : cleanInput,
      title: isUrlInput ? getHostname(normalizedUrl) : `${cleanInput} - Search`,
      isNewTab: false,
      searchResults: null,
      searchQuery: null,
      content: null,
    });

    try {
      if (isUrlInput) {
        const response = await proxyMutation.mutateAsync(normalizedUrl);
        const { body, contentType } = response;

        // Extract title from HTML responses
        const title = contentType.includes('html')
          ? extractTitle(body, getHostname(normalizedUrl))
          : getHostname(normalizedUrl);

        updateTab(targetId, {
          content: body,
          isLoading: false,
          url: normalizedUrl,
          title,
          isNewTab: false,
          searchResults: null,
          searchQuery: null,
          error: null,
        });
      } else {
        const response = await searchMutation.mutateAsync(cleanInput);
        updateTab(targetId, {
          content: null,
          searchResults: response.items,
          searchQuery: cleanInput,
          isLoading: false,
          url: cleanInput,
          title: `${cleanInput} - Search`,
          isNewTab: false,
          error: null,
        });
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load page';
      updateTab(targetId, {
        isLoading: false,
        error: errorMsg,
        isNewTab: false,
      });
    }
  };

  const handleReload = () => {
    if (activeTab && !activeTab.isNewTab) {
      if (activeTab.searchQuery) {
        navigate(activeTab.searchQuery, activeTabId);
      } else if (activeTab.url) {
        navigate(activeTab.url, activeTabId);
      }
    }
  };

  const handleHome = () => {
    setShowGames(false);
    updateTab(activeTabId, {
      content: null,
      url: '',
      title: 'New Tab',
      isNewTab: true,
      error: null,
      isLoading: false,
      searchResults: null,
      searchQuery: null,
    });
  };

  const handleToggleGames = () => {
    setShowGames(prev => !prev);
  };

  const showSearchResults =
    !showGames &&
    activeTab &&
    !activeTab.isLoading &&
    !activeTab.error &&
    activeTab.searchResults !== null &&
    activeTab.searchQuery !== null;

  // Determine what URL to show in the address bar
  const addressBarUrl = activeTab?.searchQuery
    ? activeTab.searchQuery
    : (activeTab?.url ?? '');

  return (
    <div className="flex flex-col h-screen bg-cheetah-dark overflow-hidden">
      {/* Browser Chrome */}
      <div className="flex-shrink-0 bg-cheetah-darker border-b border-cheetah-border">
        {/* Title Bar */}
        <div className="flex items-center gap-2 px-3 py-1.5 border-b border-cheetah-border/50">
          <img
            src="/assets/generated/cheetah-logo.dim_128x128.png"
            alt="Cheetah"
            className="w-5 h-5 object-contain flex-shrink-0"
            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
          <span className="text-xs font-bold text-cheetah-orange tracking-wider">CHEETAH</span>
          <span className="text-xs text-muted-foreground">1.0</span>
          <div className="flex items-center gap-1 ml-1">
            <Shield size={10} className="text-cheetah-orange/60" />
            <span className="text-[10px] text-muted-foreground">Secure</span>
          </div>
          {/* Clock in title bar — right-aligned */}
          <div className="ml-auto pr-1">
            <ClockWidget />
          </div>
        </div>

        {/* Tab Bar */}
        <TabBar
          tabs={tabs}
          activeTabId={activeTabId}
          onSwitchTab={switchTab}
          onCloseTab={closeTab}
          onAddTab={addTab}
        />

        {/* Toolbar */}
        <div className="flex items-center gap-2 px-3 py-2">
          {/* Nav Buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={handleHome}
              className="w-7 h-7 flex items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-cheetah-surface transition-colors"
              title="Home"
            >
              <Home size={13} />
            </button>
            <button
              onClick={handleReload}
              disabled={activeTab?.isLoading}
              className="w-7 h-7 flex items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-cheetah-surface transition-colors disabled:opacity-40"
              title="Reload"
            >
              <RotateCcw size={13} className={activeTab?.isLoading ? 'animate-spin' : ''} />
            </button>
            {/* Games Button */}
            <button
              onClick={handleToggleGames}
              className={`w-7 h-7 flex items-center justify-center rounded transition-colors ${
                showGames
                  ? 'text-cheetah-orange bg-cheetah-orange/15 border border-cheetah-orange/30'
                  : 'text-muted-foreground hover:text-foreground hover:bg-cheetah-surface'
              }`}
              title="Games"
            >
              <Gamepad2 size={13} />
            </button>
          </div>

          {/* Address Bar */}
          <AddressBar
            url={addressBarUrl}
            isLoading={activeTab?.isLoading ?? false}
            onNavigate={(input) => navigate(input, activeTabId)}
          />

          {/* Cloak Button */}
          <CloakButton />
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {showGames ? (
          <GamesPage onNavigate={(url) => navigate(url, activeTabId)} />
        ) : activeTab && showSearchResults ? (
          <SearchResults
            query={activeTab.searchQuery!}
            results={activeTab.searchResults!}
            onNavigate={(url) => navigate(url, activeTabId)}
          />
        ) : (
          activeTab && (
            <ProxyContent
              tab={activeTab}
              onNavigate={(url) => navigate(url, activeTabId)}
            />
          )
        )}
      </div>

      {/* Status Bar */}
      <div className="flex-shrink-0 flex items-center justify-between px-3 py-0.5 bg-cheetah-darker border-t border-cheetah-border/50">
        <div className="flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full ${activeTab?.isLoading ? 'bg-cheetah-orange animate-pulse' : activeTab?.error ? 'bg-destructive/60' : 'bg-green-500/60'}`} />
          <span className="text-[10px] text-muted-foreground font-mono truncate max-w-xs">
            {showGames
              ? 'Games'
              : activeTab?.isLoading
              ? `Loading ${activeTab?.url || ''}...`
              : activeTab?.error
              ? `Error: ${activeTab.url}`
              : activeTab?.url || 'Ready'}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-muted-foreground">{tabs.length} tab{tabs.length !== 1 ? 's' : ''}</span>
          <span className="text-[10px] text-cheetah-orange/60 font-mono">v1.0</span>
        </div>
      </div>
    </div>
  );
}
