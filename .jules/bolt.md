## 2024-05-22 - Map Component Performance
**Learning:** Map components (like React-Leaflet) are extremely heavy to re-render. Dynamic object creation in parent components (e.g., passing a new object literal as a prop every render) breaks reference equality, causing the map to re-render unnecessarily on unrelated state changes (like input typing).
**Action:** Always wrap Map components in `React.memo` and ensure that the props passed to them (especially derived objects) are memoized using `useMemo` in the parent component.
