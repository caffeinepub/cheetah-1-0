import React, { useRef, useEffect, useCallback, useState } from 'react';
import { TabState } from '../hooks/useTabManager';

interface ProxyContentProps {
  tab: TabState;
  onNavigate: (url: string) => void;
}

/**
 * Rewrites relative URLs in HTML to absolute URLs resolved against baseUrl.
 * Also removes CSP meta tags and injects a navigation interceptor script.
 */
function processHtml(html: string, baseUrl: string): string {
  // Remove any existing CSP meta tags that would block resources
  let processed = html.replace(
    /<meta[^>]+http-equiv=["']Content-Security-Policy["'][^>]*>/gi,
    ''
  );

  // Remove existing base tags
  processed = processed.replace(/<base[^>]*>/gi, '');

  // Parse base URL for resolving relative URLs
  let origin = '';
  let basePath = '';
  try {
    const u = new URL(baseUrl);
    origin = u.origin;
    basePath = u.href.substring(0, u.href.lastIndexOf('/') + 1);
  } catch {
    // ignore
  }

  // Rewrite relative URLs in href, src, action attributes
  if (origin) {
    // Rewrite href="..." attributes (links, stylesheets)
    processed = processed.replace(
      /(\s(?:href|src|action)=["'])([^"'#][^"']*)(["'])/gi,
      (match, prefix, url, suffix) => {
        if (
          url.startsWith('http://') ||
          url.startsWith('https://') ||
          url.startsWith('data:') ||
          url.startsWith('blob:') ||
          url.startsWith('mailto:') ||
          url.startsWith('tel:') ||
          url.startsWith('javascript:') ||
          url.startsWith('//')
        ) {
          return match;
        }
        try {
          const resolved = new URL(url, basePath).href;
          return `${prefix}${resolved}${suffix}`;
        } catch {
          return match;
        }
      }
    );

    // Rewrite protocol-relative URLs
    processed = processed.replace(
      /(\s(?:href|src|action)=["'])(\/\/[^"']+)(["'])/gi,
      (_match, prefix, url, suffix) => {
        return `${prefix}https:${url}${suffix}`;
      }
    );
  }

  // Inject navigation interceptor script + base tag
  const interceptorScript = `
<script>
(function() {
  function sendNav(url) {
    try { window.parent.postMessage({ type: 'cheetah-navigate', url: url }, '*'); } catch(e) {}
  }
  document.addEventListener('click', function(e) {
    var el = e.target;
    while (el && el.tagName !== 'A') el = el.parentElement;
    if (!el) return;
    var href = el.getAttribute('href');
    if (!href || href === '#' || href.startsWith('javascript:')) return;
    e.preventDefault();
    e.stopPropagation();
    var resolved = el.href || href;
    sendNav(resolved);
  }, true);
  document.addEventListener('submit', function(e) {
    e.preventDefault();
    e.stopPropagation();
    var form = e.target;
    var action = form.action || window.location.href;
    var method = (form.method || 'get').toLowerCase();
    if (method === 'get') {
      var data = new FormData(form);
      var params = new URLSearchParams();
      data.forEach(function(v, k) { params.append(k, v); });
      var sep = action.includes('?') ? '&' : '?';
      sendNav(action + sep + params.toString());
    } else {
      sendNav(action);
    }
  }, true);
})();
</script>`;

  const baseTag = `<base href="${baseUrl}" target="_self">`;

  if (/<head[^>]*>/i.test(processed)) {
    processed = processed.replace(/(<head[^>]*>)/i, `$1${baseTag}${interceptorScript}`);
  } else if (/<html[^>]*>/i.test(processed)) {
    processed = processed.replace(/(<html[^>]*>)/i, `$1<head>${baseTag}${interceptorScript}</head>`);
  } else {
    processed = `<head>${baseTag}${interceptorScript}</head>` + processed;
  }

  return processed;
}

export function ProxyContent({ tab, onNavigate }: ProxyContentProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [srcdoc, setSrcdoc] = useState<string | null>(null);

  // Listen for postMessage navigation events from the iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'cheetah-navigate') {
        const url = event.data.url as string;
        if (url && url.startsWith('http')) {
          onNavigate(url);
        }
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onNavigate]);

  // Process HTML content whenever tab content or URL changes
  useEffect(() => {
    if (!tab.content) {
      setSrcdoc(null);
      return;
    }

    const isHtmlContent =
      !tab.content.startsWith('data:image/') &&
      !tab.content.startsWith('data:application/');

    if (isHtmlContent && tab.url && tab.url.startsWith('http')) {
      const processed = processHtml(tab.content, tab.url);
      setSrcdoc(processed);
    } else {
      setSrcdoc(tab.content);
    }
  }, [tab.content, tab.url]);

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

  if ((tab.isNewTab && !tab.content) || !tab.content) {
    return <NewTabPage onNavigate={onNavigate} />;
  }

  // Render image content
  if (tab.content.startsWith('data:image/')) {
    return (
      <div className="flex-1 flex items-center justify-center bg-cheetah-dark overflow-auto p-4">
        <img
          src={tab.content}
          alt={tab.url}
          className="max-w-full max-h-full object-contain"
        />
      </div>
    );
  }

  return (
    <iframe
      ref={iframeRef}
      className="flex-1 w-full border-none bg-white"
      sandbox="allow-scripts allow-forms allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-modals"
      style={{ height: '100%' }}
      srcDoc={srcdoc ?? undefined}
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
