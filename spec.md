# Specification

## Summary
**Goal:** Redesign the Cheetah Browser homepage with a dark purple gradient theme inspired by the reference screenshot, and add a fixed home icon button that opens a full app navigation panel.

**Planned changes:**
- Create a new `HomePage` component with a full-screen dark purple radial gradient background (deep near-black at edges, glowing purple center)
- Display the `ClockWidget` (time + temperature) centered at the top of the homepage
- Add a large centered brand heading ("CHEETAH" or "CHEETAH PROXY") with gradient text fading from dim purple to bright white, left-to-right
- Add a muted gray tagline subtitle below the main heading
- Add a version/info line at the bottom center of the homepage
- Set `HomePage` as the default landing view when the app loads or a new tab is opened
- Add a fixed home icon button at the bottom-left corner of the viewport, visible on all pages
- Clicking the home icon opens a navigation drawer/overlay listing all pages: Home, Browser/Proxy, Games, Search
- Clicking a nav link navigates to that page and closes the panel

**User-visible outcome:** When the app loads, users see a styled dark purple homepage with the Cheetah branding, clock, and a tagline. A home icon is always visible in the bottom-left corner; clicking it opens a navigation panel to access all sections of the app.
