## 2024-05-22 - Map Component Memoization
**Learning:** Map components (like `ExploreMap`) using `react-leaflet` and `Supercluster` are expensive to render. When they are children of components with frequent state updates (e.g., search input typing), they must be wrapped in `React.memo` to prevent UI freezing.
**Action:** Always wrap internal map controllers or heavy map sub-components in `React.memo` and ensure their props (especially callbacks) are stable using `useCallback`.
