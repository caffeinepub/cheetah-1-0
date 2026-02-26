# Specification

## Summary
**Goal:** Enable the Direct URL proxy feature in Cheetah Browser so users can navigate to real web URLs via a backend HTTP outcall proxy.

**Planned changes:**
- Add a `proxyUrl(url: Text)` function to the Motoko backend actor that performs an HTTP GET outcall and returns the response body and status code
- Add a `useProxyUrl` mutation in `frontend/src/hooks/useQueries.ts` that calls the backend `proxyUrl` method and returns proxied HTML content or an error
- Update `BrowserLayout.tsx` to detect when the address bar input is a URL, trigger the proxy mutation instead of a search, pass the returned HTML to `ProxyContent` for rendering, and reflect loading/error states in the UI

**User-visible outcome:** Users can type a direct URL into the address bar and have the page content fetched and displayed via the on-chain proxy, with the address bar updating to the navigated URL on success.
