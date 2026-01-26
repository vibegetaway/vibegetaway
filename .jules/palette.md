## 2025-05-22 - Filter Panel Accessibility
**Learning:** Custom slide-out panels (modals) often lack fundamental accessibility roles like `role="dialog"` and `aria-modal="true"`, and their triggers lack `aria-haspopup`/`aria-expanded`.
**Action:** Always wrap custom modals with appropriate roles and ensure trigger buttons explicitly state they control a dialog via `aria-controls` and `aria-expanded`.
