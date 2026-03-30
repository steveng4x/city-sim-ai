## 2024-05-24 - Missing ARIA Labels on Icon-Only Controls
**Learning:** Found a persistent pattern in the simulator UI where icon-only controls (timeline play/pause, skip buttons) lacked accessible names, making them invisible to screen readers.
**Action:** Always add descriptive `aria-label` and `title` attributes to icon-only buttons, and ensure proper `focus-visible` states are applied for keyboard accessibility.

## 2024-05-25 - Custom Toggle Switch Accessibility
**Learning:** Found custom toggle switches in the simulator controls (Rivers/Resources) that lacked proper ARIA roles and keyboard focus styles, making their state unclear to screen reader users and difficult to interact with via keyboard.
**Action:** For custom UI switches, always add `role="switch"`, dynamically update `aria-checked={boolean}`, provide a static `aria-label`, and hide adjacent descriptive text with `aria-hidden="true"` to prevent redundant announcements. Also, ensure `focus-visible` styles are included for keyboard accessibility.
