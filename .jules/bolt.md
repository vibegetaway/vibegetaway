# Bolt's Journal

## 2024-05-23 - React-Leaflet Performance
**Learning:** Leaflet markers in React re-render entire sets when parent state changes (like hover) if not explicitly memoized, causing significant DOM thrashing.
**Action:** Always wrap marker lists in `React.memo` and memoize icon creation with `useMemo` to prevent object identity changes triggering re-renders.
