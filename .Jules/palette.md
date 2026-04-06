## 2024-05-24 - Missing ARIA Labels on Icon-Only Controls
**Learning:** Found a persistent pattern in the simulator UI where icon-only controls (timeline play/pause, skip buttons) lacked accessible names, making them invisible to screen readers.
**Action:** Always add descriptive `aria-label` and `title` attributes to icon-only buttons, and ensure proper `focus-visible` states are applied for keyboard accessibility.

## 2024-05-24 - Accessible Custom UI Toggles
**Learning:** Custom UI toggle buttons (like "Rivers" and "Resources") constructed from regular `<button>` and `<div>` elements are completely opaque to screen readers without specific ARIA attributes.
**Action:** Always add `role="switch"`, an `aria-label` (omitting redundant action verbs), and dynamic `aria-checked={boolean}` state to custom toggle buttons. Apply `focus-visible:ring-2` for keyboard users, and use `aria-hidden="true"` on adjacent descriptive text spans to prevent redundant dual announcements by screen readers.
