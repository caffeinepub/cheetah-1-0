# Specification

## Summary
**Goal:** Replace the existing DuckDuckGo search integration with the Google Custom Search JSON API using Search Engine ID `a566dfe30b89f4713`.

**Planned changes:**
- Update the backend search endpoint in `backend/main.mo` to make HTTP outcalls to `https://www.googleapis.com/customsearch/v1` with the `cx` parameter set to `a566dfe30b89f4713` and the user's query as the `q` parameter.
- Update the frontend search result parsing in `useQueries.ts` and related rendering components to handle the Google Custom Search API response format (`items` array with `title`, `link`, `snippet` fields).
- Remove any remaining DuckDuckGo-specific parsing logic from the frontend search flow.

**User-visible outcome:** Search queries entered in the address bar are processed via Google Custom Search, and results are displayed with a clickable title, URL, and snippet, styled consistently with the existing dark theme.
