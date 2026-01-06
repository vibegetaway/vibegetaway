## 2025-12-27 - Input Validation on Public LLM Endpoints
**Vulnerability:** The `/api/plan-trip` endpoint lacked input validation for `tripDuration`, `locations` count, and string lengths in `filters`. This exposed the application to Denial of Service (DoS) attacks via payload bloat and potential cost exhaustion (LLM token usage).
**Learning:** Public endpoints that trigger expensive operations (like LLM calls) must have strict, early validation boundaries. Validating types (`Array.isArray`) is crucial to prevent runtime 500 errors.
**Prevention:** Implement strict schema validation (using Zod or manual checks) at the top of every API route handler. Define explicit constants for maximum limits (e.g., `maxDuration`, `maxLocations`).

## 2025-12-29 - Centralized Security Constants
**Vulnerability:** Multiple public endpoints (specifically `/api/suggestions`) were accepting user input without length limits or type validation, which could lead to context window exhaustion or increased costs.
**Learning:** Hardcoding validation logic (e.g., `query.length < 100`) in individual files leads to inconsistency. A centralized `lib/constants.ts` ensures uniform security boundaries across the application.
**Prevention:** Move all security-critical constants (input limits, allowed types) to `lib/constants.ts` and import them in API routes.
