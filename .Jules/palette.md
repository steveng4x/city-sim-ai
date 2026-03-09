## 2024-05-24 - Missing ARIA Labels on Icon-Only Controls
**Learning:** Found a persistent pattern in the simulator UI where icon-only controls (timeline play/pause, skip buttons) lacked accessible names, making them invisible to screen readers.
**Action:** Always add descriptive `aria-label` and `title` attributes to icon-only buttons, and ensure proper `focus-visible` states are applied for keyboard accessibility.

## 2024-05-25 - Custom Toggle Switch Accessibility
**Learning:** Custom UI elements like toggle switches created with `div`s inside a `button` are completely opaque to screen readers if they only rely on visual state changes (like translating a circle). Without ARIA roles, users won't know it's a switch or its current state.
**Action:** For custom toggle switches, always add `role="switch"`, `aria-checked={boolean}`, a static `aria-label`, and ensure `focus-visible` styles are implemented to match native interactive elements.
