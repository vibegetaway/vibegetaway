## 2026-01-21 - React-Leaflet Map Re-renders
**Learning:** `React-Leaflet` components are expensive to update. Updates to parent state (like search input) can trigger re-renders of the entire map if the map controller or event handlers are not memoized.
**Action:** Always wrap map logic components (like `MapController`) in `React.memo` and ensure all props passed to them (especially event handlers) are stable using `useCallback`.
