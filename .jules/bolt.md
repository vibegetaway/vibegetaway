## 2024-05-23 - Stable Callbacks with Mutable Refs in React Maps
**Learning:** When using `supercluster` or similar complex objects in React components, passing them as dependencies to `useCallback` breaks memoization because the object reference changes on every update (e.g., when new locations are loaded).
**Action:** Use a `useRef` to hold the latest instance of the complex object (updated in `useEffect`). Then, read from `ref.current` inside `useCallback` to keep the callback stable and prevent child components (like map markers) from re-rendering unnecessarily.
