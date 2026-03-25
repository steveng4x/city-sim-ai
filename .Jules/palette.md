## 2024-05-24 - Missing ARIA Labels on Icon-Only Controls
**Learning:** Found a persistent pattern in the simulator UI where icon-only controls (timeline play/pause, skip buttons) lacked accessible names, making them invisible to screen readers.
**Action:** Always add descriptive `aria-label` and `title` attributes to icon-only buttons, and ensure proper `focus-visible` states are applied for keyboard accessibility.

## 2024-05-25 - Custom Switch Accessibility
**Learning:** Custom switch components often omit essential ARIA properties and `focus-visible` styling, hindering keyboard and screen-reader usability.
**Action:** When building custom switches, ensure the inclusion of `role="switch"`, `aria-checked`, a static `aria-label`, and `aria-hidden="true"` on adjacent descriptive text to prevent redundant announcements. Also, implement clear visual feedback with `focus-visible` styles.
