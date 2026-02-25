import React, { useRef, useEffect, useCallback } from 'react';
import { TabState } from '../hooks/useTabManager';

interface ProxyContentProps {
  tab: TabState;
  onNavigate: (url: string) => void;
}

/**
 * Injects a <base> tag into HTML so relative URLs resolve against the original site.
 * Also rewrites <meta http-equiv="Content-Security-Policy"> to avoid blocking.
 */
function injectBaseTag(html: string, baseUrl: string): string {
  // Remove any existing CSP meta tags that would block resources
  let processed = html.replace(
    /<meta[^>]+http-equiv=["']Content-Security-Policy["'][^>]*>/gi,
    ''
  );

  // Remove existing base tags
  processed = processed.replace(/<base[^>]*>/gi, '');

  // Inject base tag right after <head> or at the start of <html>
  const baseTag = `<base href="${baseUrl}" target="_self">`;
  if (/<head[^>]*>/i.test(processed)) {
    processed = processed.replace(/(<head[^>]*>)/i, `$1${baseTag}`);
  } else if (/<html[^>]*>/i.test(processed)) {
    processed = processed.replace(/(<html[^>]*>)/i, `$1<head>${baseTag}</head>`);
  } else {
    processed = baseTag + processed;
  }

  return processed;
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

    // Inject base tag so relative URLs resolve correctly
    const processedContent = tab.url && tab.url.startsWith('http')
      ? injectBaseTag(tab.content, tab.url)
      : tab.content;

    doc.open();
    doc.write(processedContent);
    doc.close();

    // Wait for content to load then intercept links
    const timer = setTimeout(() => {
      injectLinkInterceptor();
    }, 150);

    return () => clearTimeout(timer);
  }, [tab.content, tab.url, injectLinkInterceptor]);

  if (tab.isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-cheetah-dark">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 border-2 border-cheetah-orange/20 rounded-full" />
            <div className="absolute inset-0 border-2 border-transparent border-t-cheetah-orange rounded-full animate-spin" />
          </div>
          <div className="text-sm text-muted-foreground font-mono">
            {tab.url && tab.url.startsWith('http') ? `Connecting to ${tab.url}` : 'Loading...'}
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
          <button
            onClick={() => onNavigate(tab.url)}
            className="mt-4 w-full py-2 text-xs bg-cheetah-surface2 hover:bg-cheetah-surface border border-cheetah-border rounded text-muted-foreground hover:text-foreground transition-colors"
          >
            Try Again
          </button>
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
      sandbox="allow-scripts allow-forms allow-same-origin allow-popups allow-popups-to-escape-sandbox"
      style={{ height: '100%' }}
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
            alt="Cheetah"
            className="w-16 h-16 object-contain"
            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
          <div className="text-center">
            <h1 className="text-2xl font-bold text-cheetah-orange tracking-tight">Cheetah</h1>
            <p className="text-xs text-muted-foreground mt-1">Fast. Private. Yours.</p>
          </div>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="w-full">
          <div className="flex items-center gap-2 bg-cheetah-surface border border-cheetah-border rounded-lg px-4 py-3 focus-within:border-cheetah-orange/60 transition-all">
            <span className="text-muted-foreground text-sm">🔍</span>
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
              disabled={!searchInput.trim()}
              className="px-3 py-1 text-xs bg-cheetah-orange text-cheetah-darker rounded font-semibold hover:bg-cheetah-yellow transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Go
            </button>
          </div>
        </form>

        {/* Quick Links */}
        <div className="w-full">
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-3 text-center font-mono">Quick Access</p>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            {quickLinks.map(link => (
              <button
                key={link.url}
                onClick={() => onNavigate(link.url)}
                className="flex flex-col items-center gap-1.5 p-3 rounded-lg bg-cheetah-surface border border-cheetah-border hover:border-cheetah-orange/40 hover:bg-cheetah-surface2 transition-all group"
              >
                <span className="text-xl">{link.icon}</span>
                <span className="text-[10px] text-muted-foreground group-hover:text-foreground transition-colors font-mono">{link.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
