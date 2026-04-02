## 2024-05-24 - Missing ARIA Labels on Icon-Only Controls
**Learning:** Found a persistent pattern in the simulator UI where icon-only controls (timeline play/pause, skip buttons) lacked accessible names, making them invisible to screen readers.
**Action:** Always add descriptive `aria-label` and `title` attributes to icon-only buttons, and ensure proper `focus-visible` states are applied for keyboard accessibility.

## 2024-05-24 - Accessible Custom Switches and Range Inputs
**Learning:** Generic HTML tags (`div`, `span`) for custom UI elements block accessibility tooling. Range sliders were missing explicit linkage to visible names, and custom pill toggles lacked standard states.
**Action:** Use semantic `<label htmlFor="...">` linked to an `id` for range input labeling. Convert custom toggle buttons to semantic patterns by adding `role="switch"`, `aria-checked`, a distinct `aria-label`, and applying `aria-hidden="true"` to adjacent text to prevent redundant announcements.
