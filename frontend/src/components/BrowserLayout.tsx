import React from 'react';
import { RotateCcw, Home, Shield } from 'lucide-react';
import { TabBar } from './TabBar';
import { AddressBar } from './AddressBar';
import { CloakButton } from './CloakButton';
import { ProxyContent } from './ProxyContent';
import { SearchResults } from './SearchResults';
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

export function BrowserLayout() {
  const { tabs, activeTabId, activeTab, addTab, closeTab, switchTab, updateTab } = useTabManager();
  const proxyMutation = useProxyRequest();
  const searchMutation = useSearchRequest();

  const navigate = async (input: string, tabId?: string) => {
    const targetId = tabId ?? activeTabId;
    const trimmed = input.trim();
    if (!trimmed) return;

    const isUrlInput = isUrl(trimmed);
    const normalizedUrl = isUrlInput ? normalizeUrl(trimmed) : trimmed;
    const displayUrl = isUrlInput ? normalizedUrl : `search: ${trimmed}`;

    updateTab(targetId, {
      isLoading: true,
      error: null,
      url: displayUrl,
      title: isUrlInput ? new URL(normalizedUrl).hostname : `${trimmed} - Search`,
      isNewTab: false,
      searchResults: null,
      searchQuery: null,
    });

    try {
      if (isUrlInput) {
        const content = await proxyMutation.mutateAsync(normalizedUrl);
        const titleMatch = content.match(/<title[^>]*>([^<]+)<\/title>/i);
        const title = titleMatch ? titleMatch[1].trim().slice(0, 40) : new URL(normalizedUrl).hostname;
        updateTab(targetId, {
          content,
          isLoading: false,
          url: normalizedUrl,
          title,
          isNewTab: false,
          searchResults: null,
          searchQuery: null,
        });
      } else {
        const response = await searchMutation.mutateAsync(trimmed);
        updateTab(targetId, {
          content: null,
          searchResults: response.items,
          searchQuery: trimmed,
          isLoading: false,
          url: `search: ${trimmed}`,
          title: `${trimmed} - Search`,
          isNewTab: false,
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
    if (activeTab?.url && !activeTab.isNewTab) {
      if (activeTab.searchQuery) {
        navigate(activeTab.searchQuery, activeTabId);
      } else {
        navigate(activeTab.url, activeTabId);
      }
    }
  };

  const handleHome = () => {
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

  const showSearchResults =
    activeTab &&
    !activeTab.isLoading &&
    !activeTab.error &&
    activeTab.searchResults !== null &&
    activeTab.searchQuery !== null;

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
          </div>

          {/* Address Bar */}
          <AddressBar
            url={activeTab?.url ?? ''}
            isLoading={activeTab?.isLoading ?? false}
            onNavigate={(input) => navigate(input, activeTabId)}
          />

          {/* Cloak Button */}
          <CloakButton />
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {activeTab && showSearchResults ? (
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
          <div className={`w-1.5 h-1.5 rounded-full ${activeTab?.isLoading ? 'bg-cheetah-orange animate-pulse' : 'bg-green-500/60'}`} />
          <span className="text-[10px] text-muted-foreground font-mono truncate max-w-xs">
            {activeTab?.isLoading ? 'Loading...' : activeTab?.url || 'Ready'}
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
