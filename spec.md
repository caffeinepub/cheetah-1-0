# Specification

## Summary
**Goal:** Implement real web proxy functionality so the Cheetah Browser can fetch and render actual remote web pages through the backend.

**Planned changes:**
- Upgrade the backend `proxyUrl` function to fetch arbitrary HTTP/HTTPS URLs via ICP HTTP outcalls, returning the full response body, status code, and content-type header (binary resources as base64)
- Update `useProxyRequest` hook to handle the full proxy response (`body`, `contentType`, `statusCode`), surfacing images as data URLs
- Update `ProxyContent.tsx` to render proxied HTML using `srcdoc` or a Blob URL in the iframe, rewriting relative URLs (href, src, action) to route through the proxy and intercepting link clicks and form submissions via `onNavigate`
- Update `BrowserLayout.tsx` to show a loading spinner in the tab bar during proxy fetches and an inline error message with a retry button if the request fails

**User-visible outcome:** Users can type a real URL into the browser address bar and have the actual remote web page fetched and rendered inside the Cheetah Browser, with in-page navigation staying within the proxy.
