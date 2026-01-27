## 2025-12-27 - Input Validation on Public LLM Endpoints
**Vulnerability:** The `/api/plan-trip` endpoint lacked input validation for `tripDuration`, `locations` count, and string lengths in `filters`. This exposed the application to Denial of Service (DoS) attacks via payload bloat and potential cost exhaustion (LLM token usage).
**Learning:** Public endpoints that trigger expensive operations (like LLM calls) must have strict, early validation boundaries. Validating types (`Array.isArray`) is crucial to prevent runtime 500 errors.
**Prevention:** Implement strict schema validation (using Zod or manual checks) at the top of every API route handler. Define explicit constants for maximum limits (e.g., `maxDuration`, `maxLocations`).

## 2025-05-20 - Log Injection in Location Search
**Vulnerability:** The `/api/locations` endpoint logged user input directly without sanitization, allowing attackers to forge log entries (Log Injection) by including newlines in the query. It also lacked a maximum length check, allowing potential DoS.
**Learning:** Even simple search queries logged for debugging can be a vector for log injection if newlines are not stripped.
**Prevention:** Always sanitize user input before logging (e.g., `str.replace(/[\n\r]/g, ' ')`) and enforce maximum length limits on all string inputs.
