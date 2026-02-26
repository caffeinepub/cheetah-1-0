# Specification

## Summary
**Goal:** Wire the Google Custom Search engine ID `a566dfe30b89f4713` into the backend search integration so that real Google search results are returned.

**Planned changes:**
- Update the backend Google Custom Search API handler to use `cx=a566dfe30b89f4713` in all outbound search requests.
- Ensure the frontend passes search queries to the backend, receives results, and displays them (title, snippet, display URL) in the SearchResults component.
- Ensure clicking a result navigates the active tab to the result URL via the proxy.

**User-visible outcome:** Users can type a search query in the address bar and receive real Google search results powered by the specified custom search engine.
