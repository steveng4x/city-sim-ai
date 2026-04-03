## 2024-05-24 - Missing ARIA Labels on Icon-Only Controls
**Learning:** Found a persistent pattern in the simulator UI where icon-only controls (timeline play/pause, skip buttons) lacked accessible names, making them invisible to screen readers.
**Action:** Always add descriptive `aria-label` and `title` attributes to icon-only buttons, and ensure proper `focus-visible` states are applied for keyboard accessibility.

## 2024-05-25 - Redundant Screen Reader Announcements on Custom Toggles
**Learning:** Custom toggle controls without semantic markup cause screen readers to miss their purpose and read the adjacent text confusingly.
**Action:** Always use the accessibility pattern `role="switch"`, `aria-checked={boolean}`, and a static `aria-label` on custom toggles. Additionally, hide adjacent descriptive text with `aria-hidden="true"` to prevent double reading, and ensure `focus-visible` states are present for keyboard users.
