## 2025-12-27 - Input Validation on Public LLM Endpoints
**Vulnerability:** The `/api/plan-trip` endpoint lacked input validation for `tripDuration`, `locations` count, and string lengths in `filters`. This exposed the application to Denial of Service (DoS) attacks via payload bloat and potential cost exhaustion (LLM token usage).
**Learning:** Public endpoints that trigger expensive operations (like LLM calls) must have strict, early validation boundaries. Validating types (`Array.isArray`) is crucial to prevent runtime 500 errors.
**Prevention:** Implement strict schema validation (using Zod or manual checks) at the top of every API route handler. Define explicit constants for maximum limits (e.g., `maxDuration`, `maxLocations`).

## 2025-12-28 - Isolated Validation Logic
**Vulnerability:** The `/api/inspiration-cards` endpoint was vulnerable to DoS/cost exhaustion due to missing length limits on user inputs injected into LLM prompts.
**Learning:** Testing validation logic within Next.js route handlers is difficult due to framework dependencies (Request/Response). This friction can lead to skipping tests for critical validation.
**Prevention:** Extract validation logic into pure functions (e.g., `validation.ts`) that take plain objects and return error strings. This allows easy unit testing with simple scripts without mocking complex framework objects.
