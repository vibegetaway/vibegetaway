## 2025-02-27 - Mobile Navigation Accessibility
**Learning:** The `MobileNav` component uses icon-only buttons without `aria-label`s and relies on color for active state without `aria-current`.
**Action:** When auditing navigation components, always check for `aria-label` on icon buttons and `aria-current` for the active page indicator, especially in custom implementations like `MobileNav`.
