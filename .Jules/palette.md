## 2024-05-24 - Missing ARIA Labels on Icon-Only Controls
**Learning:** Found a persistent pattern in the simulator UI where icon-only controls (timeline play/pause, skip buttons) lacked accessible names, making them invisible to screen readers.
**Action:** Always add descriptive `aria-label` and `title` attributes to icon-only buttons, and ensure proper `focus-visible` states are applied for keyboard accessibility.

## 2024-05-25 - Custom Toggles Missing Switch Roles
**Learning:** Found custom toggle buttons used for enabling/disabling map features (Rivers, Resources) that lacked `role="switch"` and `aria-checked` attributes. Screen readers would announce these as regular buttons without indicating their current state or that they act as toggles.
**Action:** When building custom toggle buttons, always add `role="switch"` and dynamically set the `aria-checked` attribute, in addition to providing a clear `aria-label`. Add `focus-visible` outlines for keyboard users.
