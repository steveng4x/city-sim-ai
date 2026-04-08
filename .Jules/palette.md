## 2024-05-24 - Missing ARIA Labels on Icon-Only Controls
**Learning:** Found a persistent pattern in the simulator UI where icon-only controls (timeline play/pause, skip buttons) lacked accessible names, making them invisible to screen readers.
**Action:** Always add descriptive `aria-label` and `title` attributes to icon-only buttons, and ensure proper `focus-visible` states are applied for keyboard accessibility.

## 2024-05-24 - Accessible Pattern for Custom Switches
**Learning:** Custom UI switches (like the "Rivers" and "Resources" toggles in SimulatorControls) visually convey their state but fail screen reader accessibility if lacking proper ARIA properties. Adjacent textual labels without `aria-hidden` could also create redundant/confusing announcements.
**Action:** Use `role="switch"`, `aria-checked={boolean}`, and a descriptive `aria-label` for custom switch `<button>` elements. Ensure adjacent descriptive text is hidden from screen readers via `aria-hidden="true"`, and apply `focus-visible` classes for keyboard navigation.
