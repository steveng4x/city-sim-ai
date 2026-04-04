## 2024-05-24 - Missing ARIA Labels on Icon-Only Controls
**Learning:** Found a persistent pattern in the simulator UI where icon-only controls (timeline play/pause, skip buttons) lacked accessible names, making them invisible to screen readers.
**Action:** Always add descriptive `aria-label` and `title` attributes to icon-only buttons, and ensure proper `focus-visible` states are applied for keyboard accessibility.

## 2024-10-26 - Non-Semantic Form Controls
**Learning:** Custom UI elements like toggle switches and sliders in the simulator parameters panel lack semantic HTML, ARIA roles, and accessible labels, hindering screen reader parsing and keyboard navigation.
**Action:** Always use `<label htmlFor="[id]">` for inputs, apply `role="switch"` and `aria-checked` with `aria-label` for custom toggles, and add explicit `focus-visible` styles to ensure keyboard accessibility.
