## 2024-05-24 - Missing ARIA Labels on Icon-Only Controls
**Learning:** Found a persistent pattern in the simulator UI where icon-only controls (timeline play/pause, skip buttons) lacked accessible names, making them invisible to screen readers.
**Action:** Always add descriptive `aria-label` and `title` attributes to icon-only buttons, and ensure proper `focus-visible` states are applied for keyboard accessibility.

## 2024-06-18 - Accessible Custom Controls
**Learning:** In CitySim-AI's dark mode UI, custom toggles and range sliders often lack semantic labels and clear focus states, making keyboard navigation difficult and unannounced by screen readers. Custom toggles should use `role="switch"` with `aria-checked`, and range sliders must have `<label>` elements.
**Action:** When implementing custom interactive elements like toggles or range sliders, always explicitly set `role="switch"` or associate them with a `<label>` via `htmlFor`. Add clear focus rings using `focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-bg1` to ensure visibility against dark backgrounds without impacting mouse users.
