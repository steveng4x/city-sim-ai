## 2024-05-24 - Missing ARIA Labels on Icon-Only Controls
**Learning:** Found a persistent pattern in the simulator UI where icon-only controls (timeline play/pause, skip buttons) lacked accessible names, making them invisible to screen readers.
**Action:** Always add descriptive `aria-label` and `title` attributes to icon-only buttons, and ensure proper `focus-visible` states are applied for keyboard accessibility.

## 2024-05-25 - Accessible Custom Toggles
**Learning:** Found custom toggle switches for Rivers and Resources lacking standard switch semantics, making their state unclear to screen reader users.
**Action:** When creating custom switch elements, implement the `role="switch"` pattern, bind `aria-checked` to the state boolean, provide a static `aria-label`, and ensure proper `focus-visible` styling for keyboard users.
