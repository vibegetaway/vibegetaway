# Bolt's Journal

## 2025-02-23 - Initial Optimization
**Learning:** Performance optimization in this codebase requires checking memoization of map components, as they are heavy and used in interactive forms.
**Action:** Always check if `TripMap` or similar map components are memoized when used in pages with frequent state updates (like inputs).
