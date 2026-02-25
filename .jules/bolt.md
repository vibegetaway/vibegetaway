## 2025-10-27 - React-Leaflet Event Listener Thrashing
**Learning:** In `react-leaflet`, passing inline functions to components that manage map events (like `MapEventHandler`) triggers `useEffect` cleanup and re-execution on every render. This causes Leaflet to constantly detach and re-attach event listeners, which is much more expensive than a standard React re-render.
**Action:** Always wrap map interaction handlers in `useCallback` and memoize the component that consumes them, even if the component returns `null`.
