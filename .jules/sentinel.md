## 2025-12-27 - Input Validation on Public LLM Endpoints
**Vulnerability:** The `/api/plan-trip` endpoint lacked input validation for `tripDuration`, `locations` count, and string lengths in `filters`. This exposed the application to Denial of Service (DoS) attacks via payload bloat and potential cost exhaustion (LLM token usage).
**Learning:** Public endpoints that trigger expensive operations (like LLM calls) must have strict, early validation boundaries. Validating types (`Array.isArray`) is crucial to prevent runtime 500 errors.
**Prevention:** Implement strict schema validation (using Zod or manual checks) at the top of every API route handler. Define explicit constants for maximum limits (e.g., `maxDuration`, `maxLocations`).

## 2026-01-26 - Log Injection and DoS Protection in Search APIs
**Vulnerability:** The `/api/locations` endpoint logged user input directly without sanitization, allowing for Log Injection. It also lacked a maximum length check for the query parameter, exposing the app to DoS and cost exhaustion via the Perplexity API.
**Learning:** Even simple "search" endpoints can be vectors for attacks if input is logged blindly or passed to downstream APIs without limits. Newlines in logs can spoof entries.
**Prevention:** Always sanitize user input before logging (e.g., replace newlines). Enforce strict character limits on all query parameters before processing.
