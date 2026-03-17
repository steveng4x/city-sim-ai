## 2024-05-24 - Missing ARIA Labels on Icon-Only Controls
**Learning:** Found a persistent pattern in the simulator UI where icon-only controls (timeline play/pause, skip buttons) lacked accessible names, making them invisible to screen readers.
**Action:** Always add descriptive `aria-label` and `title` attributes to icon-only buttons, and ensure proper `focus-visible` states are applied for keyboard accessibility.

## 2024-05-24 - Accessible Custom Toggle Switches
**Learning:** Custom UI switches (like the "Rivers" and "Resources" map toggles) need explicit ARIA roles and states (`role="switch"`, `aria-checked`, `aria-label`) to be understandable by screen readers, unlike native `<input type="checkbox">` elements.
**Action:** When implementing custom toggle UI patterns instead of native checkboxes, always include `role="switch"`, an `aria-checked` boolean state, a static descriptive `aria-label`, and `focus-visible` styling for keyboard navigation.
