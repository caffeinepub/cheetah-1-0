import React, { useRef, useEffect, useCallback } from 'react';
import { TabState } from '../hooks/useTabManager';

interface ProxyContentProps {
  tab: TabState;
  onNavigate: (url: string) => void;
}

export function ProxyContent({ tab, onNavigate }: ProxyContentProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const injectLinkInterceptor = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe || !iframe.contentDocument) return;

    try {
      const doc = iframe.contentDocument;

      // Intercept all link clicks
      const interceptLinks = () => {
        const links = doc.querySelectorAll('a[href]');
        links.forEach(link => {
          const anchor = link as HTMLAnchorElement;
          if (anchor.dataset.navHandled) return;
          anchor.dataset.navHandled = 'true';
          anchor.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const href = anchor.href || anchor.getAttribute('href') || '';
            if (href && href !== '#' && !href.startsWith('javascript:')) {
              onNavigate(href);
            }
          });
        });
      };

      interceptLinks();

      // Also intercept form submissions (search forms)
      const forms = doc.querySelectorAll('form');
      forms.forEach(form => {
        if ((form as HTMLElement).dataset.navHandled) return;
        (form as HTMLElement).dataset.navHandled = 'true';
        form.addEventListener('submit', (e) => {
          e.preventDefault();
          const action = form.action || '';
          const inputs = form.querySelectorAll('input[type="text"], input[type="search"], input:not([type])');
          let query = '';
          inputs.forEach(input => {
            if ((input as HTMLInputElement).value) {
              query = (input as HTMLInputElement).value;
            }
          });
          if (action && query) {
            const url = `${action}?q=${encodeURIComponent(query)}`;
            onNavigate(url);
          } else if (action) {
            onNavigate(action);
          }
        });
      });
    } catch {
      // Cross-origin restrictions - can't intercept
    }
  }, [onNavigate]);

  useEffect(() => {
    if (!tab.content) return;

    const iframe = iframeRef.current;
    if (!iframe) return;

    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) return;

    doc.open();
    doc.write(tab.content);
    doc.close();

    // Wait for content to load then intercept links
    const timer = setTimeout(() => {
      injectLinkInterceptor();
    }, 100);

    return () => clearTimeout(timer);
  }, [tab.content, injectLinkInterceptor]);

  if (tab.isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-cheetah-dark">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 border-2 border-cheetah-orange/20 rounded-full" />
            <div className="absolute inset-0 border-2 border-transparent border-t-cheetah-orange rounded-full animate-spin" />
          </div>
          <div className="text-sm text-muted-foreground font-mono">
            {tab.url ? `Loading ${tab.url}` : 'Loading...'}
          </div>
        </div>
      </div>
    );
  }

  if (tab.error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-cheetah-dark p-8">
        <div className="max-w-md w-full bg-cheetah-surface border border-cheetah-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-destructive/20 flex items-center justify-center text-destructive text-lg">
              ✕
            </div>
            <h2 className="text-base font-semibold text-foreground">Connection Failed</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4 font-mono break-all">{tab.url}</p>
          <div className="bg-cheetah-darker rounded p-3 text-xs text-destructive font-mono">
            {tab.error}
          </div>
        </div>
      </div>
    );
  }

  if (tab.isNewTab && !tab.content) {
    return <NewTabPage onNavigate={onNavigate} />;
  }

  if (!tab.content) {
    return <NewTabPage onNavigate={onNavigate} />;
  }

  return (
    <iframe
      ref={iframeRef}
      className="flex-1 w-full border-none bg-white"
      sandbox="allow-scripts allow-forms allow-same-origin allow-popups"
    />
  );
}

function NewTabPage({ onNavigate }: { onNavigate: (url: string) => void }) {
  const [searchInput, setSearchInput] = React.useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      onNavigate(searchInput.trim());
    }
  };

  const quickLinks = [
    { label: 'Google', url: 'https://www.google.com', icon: '🔍' },
    { label: 'YouTube', url: 'https://www.youtube.com', icon: '▶️' },
    { label: 'Wikipedia', url: 'https://www.wikipedia.org', icon: '📖' },
    { label: 'Reddit', url: 'https://www.reddit.com', icon: '🔴' },
    { label: 'GitHub', url: 'https://github.com', icon: '🐙' },
    { label: 'Twitter/X', url: 'https://x.com', icon: '✖️' },
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-cheetah-dark p-8 overflow-auto">
      <div className="w-full max-w-2xl flex flex-col items-center gap-8">
        {/* Logo & Title */}
        <div className="flex flex-col items-center gap-3">
          <img
            src="/assets/generated/cheetah-logo.dim_128x128.png"
            alt="Cheetah 1.0"
            className="w-16 h-16 object-contain"
            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
          <div className="text-center">
            <h1 className="text-2xl font-bold text-cheetah-orange tracking-tight">Cheetah 1.0</h1>
            <p className="text-xs text-muted-foreground mt-1">Fast. Private. Yours.</p>
          </div>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="w-full">
          <div className="flex items-center gap-2 bg-cheetah-surface border border-cheetah-border rounded-lg px-4 py-3 focus-within:border-cheetah-orange/60 focus-within:address-bar-focus transition-all">
            <span className="text-muted-foreground">🔍</span>
            <input
              type="text"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder="Search the web or enter a URL..."
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
              autoFocus
            />
            <button
              type="submit"
              className="px-3 py-1 bg-cheetah-orange text-cheetah-darker text-xs font-semibold rounded hover:bg-cheetah-yellow transition-colors"
            >
              Go
            </button>
          </div>
        </form>

        {/* Quick Links */}
        <div className="w-full">
          <p className="text-xs text-muted-foreground mb-3 text-center uppercase tracking-wider">Quick Access</p>
          <div className="grid grid-cols-3 gap-2">
            {quickLinks.map(link => (
              <button
                key={link.url}
                onClick={() => onNavigate(link.url)}
                className="flex items-center gap-2 px-3 py-2.5 bg-cheetah-surface border border-cheetah-border rounded hover:border-cheetah-orange/50 hover:bg-cheetah-surface2 transition-all text-left group"
              >
                <span className="text-base">{link.icon}</span>
                <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">{link.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
