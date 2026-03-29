## 2024-05-24 - Missing ARIA Labels on Icon-Only Controls
**Learning:** Found a persistent pattern in the simulator UI where icon-only controls (timeline play/pause, skip buttons) lacked accessible names, making them invisible to screen readers.
**Action:** Always add descriptive `aria-label` and `title` attributes to icon-only buttons, and ensure proper `focus-visible` states are applied for keyboard accessibility.

## 2024-05-25 - Accessible Custom Toggle Switches
**Learning:** Found custom toggle switches lacking standard accessibility attributes in the simulator UI. Screen readers failed to announce their current state (e.g., whether "Rivers" were visible) or role as a switch. They were also invisible during keyboard navigation.
**Action:** When implementing custom toggle buttons, use `role="switch"`, `aria-checked={boolean}`, a static `aria-label`, and `focus-visible` CSS classes. Additionally, use `aria-hidden="true"` on adjacent descriptive text to prevent redundant announcements.
