## 2024-05-24 - Missing ARIA Labels on Icon-Only Controls
**Learning:** Found a persistent pattern in the simulator UI where icon-only controls (timeline play/pause, skip buttons) lacked accessible names, making them invisible to screen readers.
**Action:** Always add descriptive `aria-label` and `title` attributes to icon-only buttons, and ensure proper `focus-visible` states are applied for keyboard accessibility.

## 2024-05-25 - Custom Toggle Switch Accessibility Pattern
**Learning:** Custom UI toggles (like the Rivers/Resources toggles) built with `div` or `button` elements need specific ARIA roles to be understood by screen readers as switches rather than simple buttons.
**Action:** Always apply `role="switch"`, an accurate `aria-checked` state, a descriptive label (via `aria-labelledby` linking to a visible label id, or `aria-label`), and robust `focus-visible` styling when building custom toggle switches.
