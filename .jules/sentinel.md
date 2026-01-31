## 2025-12-27 - Input Validation on Public LLM Endpoints
**Vulnerability:** The `/api/plan-trip` endpoint lacked input validation for `tripDuration`, `locations` count, and string lengths in `filters`. This exposed the application to Denial of Service (DoS) attacks via payload bloat and potential cost exhaustion (LLM token usage).
**Learning:** Public endpoints that trigger expensive operations (like LLM calls) must have strict, early validation boundaries. Validating types (`Array.isArray`) is crucial to prevent runtime 500 errors.
**Prevention:** Implement strict schema validation (using Zod or manual checks) at the top of every API route handler. Define explicit constants for maximum limits (e.g., `maxDuration`, `maxLocations`).

## 2025-05-20 - Log Injection & DoS in Search Endpoints
**Vulnerability:** The /api/locations endpoint logged user input directly without sanitization, allowing log injection (CRLF). It also lacked a maximum length check on the query parameter, exposing the server to DoS and excessive LLM costs.
**Learning:** Logging user input directly is dangerous. LLM-backed search endpoints are particularly vulnerable to cost-based DoS if input length is not capped.
**Prevention:** Always sanitize user input before logging (e.g., replace newlines). Enforce strict MAX_LENGTH constants on all query parameters.
