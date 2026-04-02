## 2024-05-24 - Missing ARIA Labels on Icon-Only Controls
**Learning:** Found a persistent pattern in the simulator UI where icon-only controls (timeline play/pause, skip buttons) lacked accessible names, making them invisible to screen readers.
**Action:** Always add descriptive `aria-label` and `title` attributes to icon-only buttons, and ensure proper `focus-visible` states are applied for keyboard accessibility.

## 2024-05-24 - Accessible Custom Toggle Switches
**Learning:** Custom toggle switches built with `<button>` elements need specific ARIA roles to be understood correctly by screen readers. A simple button without the `switch` role doesn't convey its on/off state context effectively. Also, when a visual label is adjacent, it shouldn't be read redundantly if the button has an `aria-label`.
**Action:** When implementing custom toggle switches, always use `role="switch"`, maintain `aria-checked={boolean}`, provide a descriptive `aria-label` (omitting redundant verbs like 'Toggle'), apply `focus-visible` styles for keyboard navigation, and add `aria-hidden="true"` to adjacent descriptive text.
