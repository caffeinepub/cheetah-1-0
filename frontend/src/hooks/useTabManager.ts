import { useState, useCallback } from 'react';

export interface GoogleSearchResult {
  title: string;
  link: string;
  snippet: string;
  displayLink?: string;
}

export interface TabState {
  id: string;
  title: string;
  url: string;
  content: string | null;
  searchResults: GoogleSearchResult[] | null;
  searchQuery: string | null;
  isLoading: boolean;
  error: string | null;
  isNewTab: boolean;
}

let tabCounter = 1;

function createTab(url = '', title = 'New Tab'): TabState {
  return {
    id: `tab-${tabCounter++}`,
    title,
    url,
    content: null,
    searchResults: null,
    searchQuery: null,
    isLoading: false,
    error: null,
    isNewTab: true,
  };
}

export function useTabManager() {
  const [tabsState, setTabsState] = useState<TabState[]>(() => [createTab()]);
  const [activeId, setActiveId] = useState<string>(() => tabsState[0]?.id ?? '');

  const addTab = useCallback(() => {
    const newTab = createTab();
    setTabsState(prev => [...prev, newTab]);
    setActiveId(newTab.id);
  }, []);

  const closeTab = useCallback((id: string) => {
    setTabsState(prev => {
      if (prev.length === 1) {
        const fresh = createTab();
        setActiveId(fresh.id);
        return [fresh];
      }
      const idx = prev.findIndex(t => t.id === id);
      const next = prev.filter(t => t.id !== id);
      setActiveId(current => {
        if (current === id) {
          const newIdx = Math.min(idx, next.length - 1);
          return next[newIdx]?.id ?? '';
        }
        return current;
      });
      return next;
    });
  }, []);

  const switchTab = useCallback((id: string) => {
    setActiveId(id);
  }, []);

  const updateTab = useCallback((id: string, updates: Partial<TabState>) => {
    setTabsState(prev =>
      prev.map(t => (t.id === id ? { ...t, ...updates } : t))
    );
  }, []);

  const activeTab = tabsState.find(t => t.id === activeId) ?? tabsState[0];

  return {
    tabs: tabsState,
    activeTabId: activeId,
    activeTab,
    addTab,
    closeTab,
    switchTab,
    updateTab,
  };
}
