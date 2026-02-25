# Specification

## Summary
**Goal:** Fix the search functionality and website proxy connections in the Cheetah Browser so that real search results are returned and external websites load correctly through the proxy.

**Planned changes:**
- Fix the Google Custom Search API integration in the backend to correctly construct HTTP outcalls with the API key and Search Engine ID, and properly parse and return results to the frontend
- Fix the proxy backend endpoint to correctly forward HTTPS requests to external websites and return the response body intact to the frontend iframe
- Fix the `useProxyRequest` and `useSearchRequest` mutations in the frontend to correctly call backend actor methods and handle loading, error, and success states in BrowserLayout and tab state
- Ensure clicking a search result in SearchResults navigates to the proxied version of that URL in the active tab, updating the address bar and transitioning from search results to proxied content

**User-visible outcome:** Users can enter a search query or URL in the address bar and receive real search results or a loaded proxied website, with loading indicators during requests and error messages on failure. Clicking a search result navigates to that site through the proxy.
