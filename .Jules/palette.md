## 2024-05-24 - Missing ARIA Labels on Icon-Only Controls
**Learning:** Found a persistent pattern in the simulator UI where icon-only controls (timeline play/pause, skip buttons) lacked accessible names, making them invisible to screen readers.
**Action:** Always add descriptive `aria-label` and `title` attributes to icon-only buttons, and ensure proper `focus-visible` states are applied for keyboard accessibility.

## 2024-05-25 - Custom Toggle Switch Accessibility Pattern
**Learning:** Found custom toggle switches lacking proper ARIA roles and keyboard focus styles, which is a common pattern in custom UI components.
**Action:** Always apply `role="switch"`, dynamically set `aria-checked={boolean}`, provide a static `aria-label`, and use `focus-visible` classes (like `focus-visible:ring-2 focus-visible:outline-none`) to ensure custom toggles are fully accessible and keyboard navigable.
