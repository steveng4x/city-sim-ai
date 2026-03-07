## 2024-05-24 - Missing ARIA Labels on Icon-Only Controls
**Learning:** Found a persistent pattern in the simulator UI where icon-only controls (timeline play/pause, skip buttons) lacked accessible names, making them invisible to screen readers.
**Action:** Always add descriptive `aria-label` and `title` attributes to icon-only buttons, and ensure proper `focus-visible` states are applied for keyboard accessibility.

## 2026-03-07 - Accessible Custom Toggle Switches
**Learning:** Found custom toggle switches built with generic `<button>` tags (like "Rivers" and "Resources" visibility toggles) that screen readers cannot identify as toggles. These buttons just changed color without announcing their state or purpose to assistive technologies.
**Action:** Always implement the ARIA switch pattern for custom toggles: add `role="switch"`, a dynamic `aria-checked={boolean}` attribute representing current state, and an `aria-label` (e.g. "Toggle rivers visibility"). Also, ensure to add `focus-visible` classes to make them keyboard navigable.
