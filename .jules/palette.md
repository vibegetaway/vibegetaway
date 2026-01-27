## 2024-05-24 - Accessibility Patterns for Custom Inputs
**Learning:** Custom input components (like `SmartTagInput`) that wrap native inputs must expose accessibility props (e.g., `ariaLabel`) in their interface. Without this, consuming components cannot provide context-specific labels (e.g., "Add a vibe" vs "Add a location"), making the input ambiguous to screen reader users.
**Action:** Always include optional `ariaLabel` or `ariaLabelledBy` props in reusable input component interfaces and pass them to the underlying semantic element.

## 2024-05-24 - Icon-Only Button Labels
**Learning:** Using `title` attributes for tooltips on icon-only buttons is insufficient for accessibility. Screen readers may not consistently announce `title`, and it doesn't provide the same semantic weight as `aria-label`.
**Action:** Always pair icon-only buttons with an explicit `aria-label` attribute describing the action (e.g., "Search", "Filter Settings"), even if a `title` is present.

## 2024-05-24 - WAI-ARIA Disclosure Pattern for Dropdowns
**Learning:** Custom dropdowns (e.g., filter menus) need explicit state and role definitions. A button toggling a div is not enough. The trigger requires `aria-expanded` and `aria-haspopup`, and the content container needs a semantic role (e.g., `dialog`) and labeling. Keyboard support (Escape to close) is critical for usability.
**Action:** Implement the full ARIA disclosure pattern for all custom dropdowns: `aria-expanded` on trigger, `role="dialog"`/`aria-modal` on content, and proper focus/keyboard management.
