## 2024-05-24 - Missing ARIA Labels on Icon-Only Controls
**Learning:** Found a persistent pattern in the simulator UI where icon-only controls (timeline play/pause, skip buttons) lacked accessible names, making them invisible to screen readers.
**Action:** Always add descriptive `aria-label` and `title` attributes to icon-only buttons, and ensure proper `focus-visible` states are applied for keyboard accessibility.

## 2026-03-31 - Accessible Custom Toggle Switches
**Learning:** Custom toggle switches built with `<button>` and internal divs lack native switch semantics. Without proper ARIA roles and labels, screen readers treat them as generic buttons, and adjacent text labels may cause redundant or confusing announcements.
**Action:** Always add `role="switch"`, `aria-checked={boolean}`, and a descriptive `aria-label` to custom toggle buttons. Additionally, apply `aria-hidden="true"` to adjacent descriptive text to prevent redundant announcements, and ensure `focus-visible` classes are present for keyboard navigation.
