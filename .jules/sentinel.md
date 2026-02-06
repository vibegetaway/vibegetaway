## 2025-12-27 - Input Validation on Public LLM Endpoints
**Vulnerability:** The `/api/plan-trip` endpoint lacked input validation for `tripDuration`, `locations` count, and string lengths in `filters`. This exposed the application to Denial of Service (DoS) attacks via payload bloat and potential cost exhaustion (LLM token usage).
**Learning:** Public endpoints that trigger expensive operations (like LLM calls) must have strict, early validation boundaries. Validating types (`Array.isArray`) is crucial to prevent runtime 500 errors.
**Prevention:** Implement strict schema validation (using Zod or manual checks) at the top of every API route handler. Define explicit constants for maximum limits (e.g., `maxDuration`, `maxLocations`).

## 2025-02-26 - Deep Object Validation for API Payloads
**Vulnerability:** While top-level array limits were enforced, nested string properties (e.g., `country`, `searchVibe` in `locations` array) lacked length limits. This allowed attackers to send massive payloads inside valid structures, bypassing top-level checks.
**Learning:** Checking `array.length` is insufficient. Recursive or iterative validation of *all* user-supplied strings is necessary to prevent memory exhaustion and DoS.
**Prevention:** Extract validation logic to a sibling `validation.ts` file. Implement strict length checks (e.g., `MAX_FIELD_LENGTH`) for every string field within complex objects. Sanitize inputs to prevent log injection.
