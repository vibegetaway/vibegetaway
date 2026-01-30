
## 2026-01-30 - Map Marker Re-renders
**Learning:** React-Leaflet markers inside a map component re-render on every parent render if event handlers are not memoized, causing significant performance degradation on interactions like hover.
**Action:** Always wrap marker lists in React.memo and use useCallback for map event handlers. Use a specific MemoizedMarker component for individual markers to isolate updates.
