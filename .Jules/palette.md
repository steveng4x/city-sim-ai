## 2024-05-24 - Missing ARIA Labels on Icon-Only Controls
**Learning:** Found a persistent pattern in the simulator UI where icon-only controls (timeline play/pause, skip buttons) lacked accessible names, making them invisible to screen readers.
**Action:** Always add descriptive `aria-label` and `title` attributes to icon-only buttons, and ensure proper `focus-visible` states are applied for keyboard accessibility.

## 2024-05-25 - Custom Toggle Switch Accessibility Pattern
**Learning:** Custom UI toggle switches (like "Rivers" and "Resources" in SimulatorControls) were visually distinct but lacked native input semantics, making them inaccessible to screen readers and difficult to focus via keyboard navigation.
**Action:** When implementing custom toggle switches without native `<input type="checkbox">` elements, always apply `role="switch"` and dynamically set `aria-checked={boolean}`. Additionally, provide a static `aria-label` to the button itself, hide the adjacent visual label text from screen readers using `aria-hidden="true"`, and apply `focus-visible` styles to ensure keyboard navigation visibility.
