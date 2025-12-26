# Bolt's Journal

## 2024-05-22 - [Optimizing Map Markers in Next.js/Leaflet]
**Learning:** React-Leaflet's `Marker` component re-initializes the underlying Leaflet layer if the `icon` prop object reference changes, even if the icon visual properties are identical. Creating `L.divIcon` objects inside the render loop (or inside a component without memoization) forces expensive DOM operations for every marker on every render.
**Action:** Always create Leaflet icons outside components (at module level) if they are static, or use `useMemo`/caching if they depend on props, to ensure referential stability.
