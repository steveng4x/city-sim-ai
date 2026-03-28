## 2024-05-24 - Missing ARIA Labels on Icon-Only Controls
**Learning:** Found a persistent pattern in the simulator UI where icon-only controls (timeline play/pause, skip buttons) lacked accessible names, making them invisible to screen readers.
**Action:** Always add descriptive `aria-label` and `title` attributes to icon-only buttons, and ensure proper `focus-visible` states are applied for keyboard accessibility.


## 2024-05-24 - Accessible Custom Switches
**Learning:** Found custom toggle switches lacking proper ARIA roles and keyboard focus styles, which causes accessibility issues. Screen readers do not recognize generic `div` or `button` elements acting as toggles without `role="switch"`. Also, dynamically changing `aria-label` based on state is not a good pattern compared to a static label and toggling `aria-checked`.
**Action:** Always apply the accessibility pattern `role="switch"`, `aria-checked={boolean}`, and a static `aria-label` to custom toggle controls. Also, add `focus-visible` styles for clear keyboard navigation, and `aria-hidden="true"` to adjacent descriptive text to prevent redundant announcements.
