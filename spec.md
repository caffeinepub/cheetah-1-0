# Specification

## Summary
**Goal:** Add a cloaking mode selector to the Falcon Cloaking feature, allowing users to choose from three URL disguise modes: `about:blank`, `https://error`, and `123456789101112`.

**Planned changes:**
- Add a mode selector UI (dropdown or segmented control) to `CloakButton.tsx` presenting the three cloak mode options, styled with the existing dark/yellow-orange Cheetah theme
- Update `useCloaking.ts` to accept a `cloakMode` parameter and apply the appropriate URL disguise technique for each mode using popup windows and the History API
- Persist the selected cloak mode in component state so it is remembered across cloak triggers within the session
- Restrict the mode selector and cloak trigger to the Falcon Cloaking UI only — no changes to other toolbar or tab components

**User-visible outcome:** In the Falcon Cloaking section, users can select one of three disguise modes before triggering the cloak. The cloaked window will display the chosen URL (`about:blank`, `https://error`, or `123456789101112`) in the browser address bar while rendering the full Cheetah app inside.
