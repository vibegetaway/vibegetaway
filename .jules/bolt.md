## 2024-05-22 - TripMap Re-render Optimization
**Learning:** `TripMap` was re-rendering excessively because `PlanContent` passed a new `selectedDayForMap` object reference on every render (triggered by input typing), and `TripMap` wasn't memoized.
**Action:** Always memoize derived objects passed as props to heavy components (like maps) using `useMemo`, and wrap the component in `React.memo` to ensure referential equality checks prevent unnecessary re-renders.
