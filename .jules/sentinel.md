## 2025-12-27 - Input Validation on Public LLM Endpoints
**Vulnerability:** The `/api/plan-trip` endpoint lacked input validation for `tripDuration`, `locations` count, and string lengths in `filters`. This exposed the application to Denial of Service (DoS) attacks via payload bloat and potential cost exhaustion (LLM token usage).
**Learning:** Public endpoints that trigger expensive operations (like LLM calls) must have strict, early validation boundaries. Validating types (`Array.isArray`) is crucial to prevent runtime 500 errors.
**Prevention:** Implement strict schema validation (using Zod or manual checks) at the top of every API route handler. Define explicit constants for maximum limits (e.g., `maxDuration`, `maxLocations`).

## 2025-12-29 - Validation for Proxy Endpoints
**Vulnerability:** The `/api/images/pixabay-images` endpoint acted as a proxy to an external API (Pixabay) without validating input parameters (`keywords`, `limit`). This exposed the application to DoS risks (large payloads) and potential API quota abuse.
**Learning:** Proxy endpoints, even if they don't use expensive LLMs, must still enforce strict boundaries to protect the upstream API and the proxy server itself. Validation must mirror the constraints of the upstream service or be stricter.
**Prevention:** Define constants for limits (e.g., `MAX_LIMIT`, `MAX_KEYWORD_LENGTH`) at the top of proxy route handlers and validate all incoming parameters against them before making external requests.
