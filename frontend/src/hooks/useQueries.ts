import { useMutation } from '@tanstack/react-query';
import { useActor } from './useActor';
import { GoogleSearchResult } from './useTabManager';

export function useProxyRequest() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (url: string): Promise<string> => {
      if (!actor) throw new Error('Actor not initialized. Please wait and try again.');
      // Proxy via Google search as a fallback — direct proxy not available
      throw new Error('Direct URL proxy is not available. Please search for content instead.');
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
      const raw = await actor.proxyGoogleSearch(query);

      let parsed: GoogleSearchResponse;
      try {
        parsed = JSON.parse(raw) as GoogleSearchResponse;
      } catch {
        throw new Error('Failed to parse search results. Please try again.');
      }

      if (parsed.error) {
        const msg = parsed.error.message || 'Search API error';
        throw new Error(`Search error (${parsed.error.code}): ${msg}`);
      }

      if (!parsed.items || parsed.items.length === 0) {
        // Return empty results rather than throwing
        return {
          items: [],
          searchInformation: parsed.searchInformation,
        };
      }

      return {
        items: parsed.items.map(item => ({
          title: item.title || '',
          link: item.link || '',
          snippet: item.snippet || '',
          displayLink: item.displayLink || '',
        })),
        searchInformation: parsed.searchInformation,
      };
    },
  });
}
