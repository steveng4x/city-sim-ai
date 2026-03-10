## 2024-05-24 - Missing ARIA Labels on Icon-Only Controls
**Learning:** Found a persistent pattern in the simulator UI where icon-only controls (timeline play/pause, skip buttons) lacked accessible names, making them invisible to screen readers.
**Action:** Always add descriptive `aria-label` and `title` attributes to icon-only buttons, and ensure proper `focus-visible` states are applied for keyboard accessibility.

## 2024-05-25 - Missing Semantic Roles on Custom Toggle Switches
**Learning:** Found custom toggle switches (like the ones for "Rivers" and "Resources") implemented as `button` elements that visually act as toggles but lack the semantic `role="switch"` and `aria-checked` attributes, breaking accessibility for screen readers.
**Action:** Always add `role="switch"` and dynamically set `aria-checked={state}` on custom toggle switches. Provide a static `aria-label` and ensure `focus-visible` styles are included for keyboard navigation.
