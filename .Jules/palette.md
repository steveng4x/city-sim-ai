## 2024-05-24 - Missing ARIA Labels on Icon-Only Controls
**Learning:** Found a persistent pattern in the simulator UI where icon-only controls (timeline play/pause, skip buttons) lacked accessible names, making them invisible to screen readers.
**Action:** Always add descriptive `aria-label` and `title` attributes to icon-only buttons, and ensure proper `focus-visible` states are applied for keyboard accessibility.

## 2024-05-25 - Custom Toggle Switches Missing Accessibility Patterns
**Learning:** Found custom sliding toggle switches in the simulator controls built as plain `button`s without `role="switch"` or `aria-checked` states. Descriptive text was placed in adjacent `span`s, meaning screen reader users would hear the text separately from the interactive control.
**Action:** Always apply `role="switch"` and dynamic `aria-checked={boolean}` properties to custom toggles. Use `aria-label` on the control itself and hide redundant adjacent text with `aria-hidden="true"`. Finally, ensure `focus-visible` styles are included for keyboard support.
