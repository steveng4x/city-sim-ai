## 2024-05-24 - Missing ARIA Labels on Icon-Only Controls
**Learning:** Found a persistent pattern in the simulator UI where icon-only controls (timeline play/pause, skip buttons) lacked accessible names, making them invisible to screen readers.
**Action:** Always add descriptive `aria-label` and `title` attributes to icon-only buttons, and ensure proper `focus-visible` states are applied for keyboard accessibility.

## 2024-06-25 - Custom Toggle Switches Missing Semantics
**Learning:** Custom UI toggles built with `button` and `div` elements (e.g., Rivers and Resources toggles) are visually functional but lack semantic meaning for screen readers, appearing only as generic buttons without state.
**Action:** Always apply `role="switch"`, an appropriate `aria-checked` boolean state, a descriptive `aria-label`, and `focus-visible` styling to custom toggle controls to ensure they are fully accessible and usable via keyboard navigation.
