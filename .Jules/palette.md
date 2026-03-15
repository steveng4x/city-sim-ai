## 2024-05-24 - Missing ARIA Labels on Icon-Only Controls
**Learning:** Found a persistent pattern in the simulator UI where icon-only controls (timeline play/pause, skip buttons) lacked accessible names, making them invisible to screen readers.
**Action:** Always add descriptive `aria-label` and `title` attributes to icon-only buttons, and ensure proper `focus-visible` states are applied for keyboard accessibility.

## 2024-05-25 - Custom Toggle Switch Accessibility
**Learning:** Found custom toggle switches in the simulator controls (Rivers, Resources) implemented as standard `<button>` elements without appropriate ARIA roles or state attributes, confusing screen readers about their true nature and current state.
**Action:** Always implement custom switches with `role="switch"`, `aria-checked={boolean}`, a static `aria-label`, and ensure `focus-visible` CSS classes are used for clear visual feedback during keyboard navigation.
