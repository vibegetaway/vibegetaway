## 2025-12-27 - Input Validation on Public LLM Endpoints
**Vulnerability:** The `/api/plan-trip` endpoint lacked input validation for `tripDuration`, `locations` count, and string lengths in `filters`. This exposed the application to Denial of Service (DoS) attacks via payload bloat and potential cost exhaustion (LLM token usage).
**Learning:** Public endpoints that trigger expensive operations (like LLM calls) must have strict, early validation boundaries. Validating types (`Array.isArray`) is crucial to prevent runtime 500 errors.
**Prevention:** Implement strict schema validation (using Zod or manual checks) at the top of every API route handler. Define explicit constants for maximum limits (e.g., `maxDuration`, `maxLocations`).

## 2026-02-15 - Location Search Input Validation
**Vulnerability:** The `/api/locations` endpoint accepted unlimited string length for the `q` parameter and passed it directly to `console.log` and the Perplexity API. This created risks of Log Injection and Denial of Service (DoS) via API cost exhaustion or timeout.
**Learning:** Even "read-only" search endpoints can be vectors for DoS and log poisoning if input is not sanitized and capped.
**Prevention:** Implement `validateSearchQuery` with strict length limits (e.g., 500 chars) and sanitization (removing control characters) for all free-text search inputs.
