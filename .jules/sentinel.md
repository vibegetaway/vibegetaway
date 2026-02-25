## 2025-12-27 - Input Validation on Public LLM Endpoints
**Vulnerability:** The `/api/plan-trip` endpoint lacked input validation for `tripDuration`, `locations` count, and string lengths in `filters`. This exposed the application to Denial of Service (DoS) attacks via payload bloat and potential cost exhaustion (LLM token usage).
**Learning:** Public endpoints that trigger expensive operations (like LLM calls) must have strict, early validation boundaries. Validating types (`Array.isArray`) is crucial to prevent runtime 500 errors.
**Prevention:** Implement strict schema validation (using Zod or manual checks) at the top of every API route handler. Define explicit constants for maximum limits (e.g., `maxDuration`, `maxLocations`).

## 2025-12-27 - Input Validation on External Proxy Endpoints
**Vulnerability:** The `/api/images/pixabay-images` endpoint acted as a proxy to the Pixabay API but lacked input validation for `keywords` length/count and `limit`. This could allow attackers to exhaust API quotas or cause DoS.
**Learning:** Proxy endpoints must enforce strict input limits to protect downstream API quotas and prevent abuse, even if the upstream API has its own limits.
**Prevention:** Define server-side constants for maximum limits (e.g., `MAX_LIMIT`, `MAX_KEYWORD_LENGTH`) and validate them before making external calls.
