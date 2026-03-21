## 2024-05-24 - Missing ARIA Labels on Icon-Only Controls
**Learning:** Found a persistent pattern in the simulator UI where icon-only controls (timeline play/pause, skip buttons) lacked accessible names, making them invisible to screen readers.
**Action:** Always add descriptive `aria-label` and `title` attributes to icon-only buttons, and ensure proper `focus-visible` states are applied for keyboard accessibility.

## 2024-05-25 - Custom Switch Accessibility (Rivers/Resources)
**Learning:** Found custom toggle switches lacking proper ARIA roles and keyboard focus styles, which made their state (on/off) inaccessible to screen readers and difficult to navigate for keyboard users.
**Action:** When building custom switches, always include `role="switch"`, an `aria-checked` attribute bound to the boolean state, a static `aria-label`, and `focus-visible` styles to ensure full accessibility. Add `aria-hidden="true"` to adjacent text to prevent redundant screen reader announcements.
