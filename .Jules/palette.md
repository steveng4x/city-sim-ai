## 2024-05-24 - Missing ARIA Labels on Icon-Only Controls
**Learning:** Found a persistent pattern in the simulator UI where icon-only controls (timeline play/pause, skip buttons) lacked accessible names, making them invisible to screen readers.
**Action:** Always add descriptive `aria-label` and `title` attributes to icon-only buttons, and ensure proper `focus-visible` states are applied for keyboard accessibility.

## 2025-03-16 - Custom Switch Accessibility
**Learning:** Found that custom toggle switches (like "Rivers" and "Resources" in the simulator controls) built with `<button>` elements were missing proper semantic meaning and focus styles, making them inaccessible to screen readers and keyboard users.
**Action:** Always add `role="switch"`, `aria-checked={boolean}`, an explicit `aria-label`, and `focus-visible` styles (e.g., `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand`) to custom toggle controls.
