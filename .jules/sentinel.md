## 2025-12-27 - Input Validation on Public LLM Endpoints
**Vulnerability:** The `/api/plan-trip` endpoint lacked input validation for `tripDuration`, `locations` count, and string lengths in `filters`. This exposed the application to Denial of Service (DoS) attacks via payload bloat and potential cost exhaustion (LLM token usage).
**Learning:** Public endpoints that trigger expensive operations (like LLM calls) must have strict, early validation boundaries. Validating types (`Array.isArray`) is crucial to prevent runtime 500 errors.
**Prevention:** Implement strict schema validation (using Zod or manual checks) at the top of every API route handler. Define explicit constants for maximum limits (e.g., `maxDuration`, `maxLocations`).

## 2025-02-28 - Input Sanitization in Search API
**Vulnerability:** The `/api/locations` endpoint lacked input length limits and sanitization for the `q` query parameter, exposing the application to potential Denial of Service (DoS) via long strings and Log Injection via control characters.
**Learning:** Even simple GET parameters used in search queries can be attack vectors if not validated, especially when passed to external APIs or logged.
**Prevention:** Implement a dedicated validation layer for all user inputs. Use `trim()` and remove control characters (`\n`, `\r`) to sanitize strings before logging or processing. Enforce strict length limits (e.g., 500 chars) to fail fast.
