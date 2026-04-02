## 2024-05-24 - Missing ARIA Labels on Icon-Only Controls
**Learning:** Found a persistent pattern in the simulator UI where icon-only controls (timeline play/pause, skip buttons) lacked accessible names, making them invisible to screen readers.
**Action:** Always add descriptive `aria-label` and `title` attributes to icon-only buttons, and ensure proper `focus-visible` states are applied for keyboard accessibility.

## 2024-05-24 - Accessible Custom Toggles & Form Input Labels
**Learning:** Discovered that custom toggle switches (like "Rivers" and "Resources") were just `<button>` elements lacking semantic state, while `<input type="range">` lacked linked `<label>` tags. Screen readers couldn't understand the state of the toggles or associate labels with the range inputs.
**Action:** Apply `role="switch"` and `aria-checked` to custom toggles, alongside static `aria-label`s, whilst hiding adjacent text using `aria-hidden="true"`. Also wrap static texts in proper semantic `<label htmlFor="...">` tied to the `id` of inputs.
