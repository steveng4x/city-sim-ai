## 2024-05-24 - Missing ARIA Labels on Icon-Only Controls
**Learning:** Found a persistent pattern in the simulator UI where icon-only controls (timeline play/pause, skip buttons) lacked accessible names, making them invisible to screen readers.
**Action:** Always add descriptive `aria-label` and `title` attributes to icon-only buttons, and ensure proper `focus-visible` states are applied for keyboard accessibility.

## 2024-05-25 - Accessible Custom Toggles
**Learning:** Custom toggle buttons (like those for Rivers/Resources) visually act as switches but fail to communicate their state to screen readers without the `switch` role and `aria-checked` attribute.
**Action:** Always implement custom toggles with `role="switch"`, `aria-checked`, a static `aria-label`, and `focus-visible` styles for keyboard navigation, hiding adjacent visual labels with `aria-hidden="true"` to prevent duplicate announcements.
