## 2024-05-24 - Missing ARIA Labels on Icon-Only Controls
**Learning:** Found a persistent pattern in the simulator UI where icon-only controls (timeline play/pause, skip buttons) lacked accessible names, making them invisible to screen readers.
**Action:** Always add descriptive `aria-label` and `title` attributes to icon-only buttons, and ensure proper `focus-visible` states are applied for keyboard accessibility.

## 2024-05-24 - Accessible Custom Toggle Switches
**Learning:** Found custom toggle switches built with `<button>` elements that visually indicated state but lacked semantic meaning for screen readers. Using dynamic `aria-label`s based on state is an anti-pattern.
**Action:** Always implement custom toggle switches using the `role="switch"` attribute, `aria-checked={boolean}` to convey state, and a static `aria-label` to identify the control.
