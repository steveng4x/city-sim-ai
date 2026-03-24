## 2024-05-24 - Missing ARIA Labels on Icon-Only Controls
**Learning:** Found a persistent pattern in the simulator UI where icon-only controls (timeline play/pause, skip buttons) lacked accessible names, making them invisible to screen readers.
**Action:** Always add descriptive `aria-label` and `title` attributes to icon-only buttons, and ensure proper `focus-visible` states are applied for keyboard accessibility.

## 2024-05-25 - Custom Toggle Switch Accessibility Pattern
**Learning:** Custom UI toggle controls (like the Rivers/Resources switches) built with standard buttons require specific ARIA attributes and focus styles to be usable by screen readers and keyboard users. Dynamic aria-labels based on state are an anti-pattern as they hide the base state.
**Action:** For custom switches, always use `role="switch"`, `aria-checked={boolean}`, a static `aria-label`, apply `focus-visible` classes for keyboard navigation, and add `aria-hidden="true"` to adjacent text to prevent redundant announcements.
