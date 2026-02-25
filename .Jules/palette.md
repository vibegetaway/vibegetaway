## 2024-05-23 - Accessible Mobile Navigation Labels
**Learning:** Icon-only navigation buttons in the mobile bar were missing `aria-label` attributes, making them inaccessible to screen readers. Additionally, the active state was only conveyed visually via color, lacking programmatical indication.
**Action:** When creating icon-only buttons, always ensure an `aria-label` is present. For navigation links/buttons, use `aria-current="page"` to indicate the active item programmatically.
