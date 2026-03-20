## 2024-05-24 - Missing ARIA Labels on Icon-Only Controls
**Learning:** Found a persistent pattern in the simulator UI where icon-only controls (timeline play/pause, skip buttons) lacked accessible names, making them invisible to screen readers.
**Action:** Always add descriptive `aria-label` and `title` attributes to icon-only buttons, and ensure proper `focus-visible` states are applied for keyboard accessibility.

## 2024-05-25 - Accessible Custom Toggles
**Learning:** Custom toggle switches built with `div` or `button` elements need specific ARIA roles (`role="switch"`) and states (`aria-checked`) to be understood properly by screen readers, replacing their default roles. Furthermore, visual indication of focus (`focus-visible`) is necessary for keyboard navigation.
**Action:** Whenever creating a custom toggle component, use `role="switch"`, dynamically set `aria-checked`, add a static `aria-label`, and ensure `focus-visible` styling is included.
