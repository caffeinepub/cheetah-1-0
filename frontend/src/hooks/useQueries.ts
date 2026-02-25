import { useMutation } from '@tanstack/react-query';
import { useActor } from './useActor';
import { GoogleSearchResult } from './useTabManager';

export function useProxyRequest() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (url: string) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.proxyRequest(url);
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
  };
}

export function useSearchRequest() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (query: string): Promise<GoogleSearchResponse> => {
      if (!actor) throw new Error('Actor not initialized');
      const raw = await actor.searchRequest(query);
      try {
        const parsed = JSON.parse(raw) as GoogleSearchResponse;
        if (parsed.error) {
          throw new Error(parsed.error.message || 'Search API error');
        }
        return {
          items: (parsed.items || []).map(item => ({
            title: item.title || '',
            link: item.link || '',
            snippet: item.snippet || '',
            displayLink: item.displayLink || '',
          })),
          searchInformation: parsed.searchInformation,
        };
      } catch (e) {
        if (e instanceof SyntaxError) {
          throw new Error('Failed to parse search results');
        }
        throw e;
      }
    },
  });
}
