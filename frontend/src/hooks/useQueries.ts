import { useMutation } from '@tanstack/react-query';
import { useActor } from './useActor';
import { GoogleSearchResult } from './useTabManager';

export function useProxyRequest() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (url: string): Promise<string> => {
      if (!actor) throw new Error('Actor not initialized. Please wait and try again.');
      const content = await actor.proxyUrl(url);
      return content;
    },
  });
}

export interface GoogleSearchResponse {
  items: GoogleSearchResult[];
  searchInformation?: {
    totalResults: string;
    formattedTotalResults: string;
    searchTime: number;
  };
  error?: {
    code: number;
    message: string;
    errors?: Array<{ message: string; domain: string; reason: string }>;
  };
}

export function useSearchRequest() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (query: string): Promise<GoogleSearchResponse> => {
      if (!actor) throw new Error('Actor not initialized. Please wait and try again.');

      // Use the generic proxyUrl to perform a DuckDuckGo HTML search
      const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
      const raw = await actor.proxyUrl(searchUrl);

      // Parse DuckDuckGo HTML results into our GoogleSearchResult shape
      const parser = new DOMParser();
      const doc = parser.parseFromString(raw, 'text/html');
      const resultElements = doc.querySelectorAll('.result');

      const items: GoogleSearchResult[] = [];
      resultElements.forEach((el) => {
        const titleEl = el.querySelector('.result__title a');
        const snippetEl = el.querySelector('.result__snippet');
        const urlEl = el.querySelector('.result__url');

        const title = titleEl?.textContent?.trim() || '';
        const snippet = snippetEl?.textContent?.trim() || '';
        const displayLink = urlEl?.textContent?.trim() || '';

        // Extract the actual href from the result link
        const href = titleEl?.getAttribute('href') || '';
        let link = href;
        if (href.startsWith('//duckduckgo.com/l/?uddg=')) {
          try {
            const params = new URLSearchParams(href.split('?')[1]);
            link = decodeURIComponent(params.get('uddg') || href);
          } catch {
            link = href;
          }
        } else if (href && !href.startsWith('http')) {
          link = `https:${href}`;
        }

        if (title && link) {
          items.push({ title, link, snippet, displayLink });
        }
      });

      return { items };
    },
  });
}
