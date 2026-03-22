## 2024-05-24 - Missing ARIA Labels on Icon-Only Controls
**Learning:** Found a persistent pattern in the simulator UI where icon-only controls (timeline play/pause, skip buttons) lacked accessible names, making them invisible to screen readers.
**Action:** Always add descriptive `aria-label` and `title` attributes to icon-only buttons, and ensure proper `focus-visible` states are applied for keyboard accessibility.

## 2025-02-14 - Accessible Custom Toggle Switches
**Learning:** Custom UI toggles (like the Rivers/Resources switches in the simulator controls) built with `button` and `div` elements lack native checkbox semantics, making their state opaque to screen readers and difficult to focus via keyboard.
**Action:** Apply `role="switch"` and dynamically set `aria-checked` to convey state. Use `aria-label` directly on the button and add `aria-hidden="true"` to adjacent visual labels to avoid redundant announcements. Ensure `focus-visible` styles are applied for clear keyboard navigation feedback.
