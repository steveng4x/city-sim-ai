## 2024-05-24 - Missing ARIA Labels on Icon-Only Controls
**Learning:** Found a persistent pattern in the simulator UI where icon-only controls (timeline play/pause, skip buttons) lacked accessible names, making them invisible to screen readers.
**Action:** Always add descriptive `aria-label` and `title` attributes to icon-only buttons, and ensure proper `focus-visible` states are applied for keyboard accessibility.

## 2024-05-25 - Custom Toggle Switch Accessibility Pattern
**Learning:** Custom UI toggle switches built with `<button>` elements need specific ARIA roles to be recognized correctly by screen readers. If descriptive text is adjacent to the button but not inside it, screen readers may miss context or announce things redundantly.
**Action:** When building custom toggle switches, always add `role="switch"` and `aria-checked={boolean}`. Provide a static `aria-label` on the button, and use `aria-hidden="true"` on adjacent descriptive text to prevent redundant announcements. Add `focus-visible` classes for keyboard navigation.
