## 2025-12-27 - Input Validation on Public LLM Endpoints
**Vulnerability:** The `/api/plan-trip` endpoint lacked input validation for `tripDuration`, `locations` count, and string lengths in `filters`. This exposed the application to Denial of Service (DoS) attacks via payload bloat and potential cost exhaustion (LLM token usage).
**Learning:** Public endpoints that trigger expensive operations (like LLM calls) must have strict, early validation boundaries. Validating types (`Array.isArray`) is crucial to prevent runtime 500 errors.
**Prevention:** Implement strict schema validation (using Zod or manual checks) at the top of every API route handler. Define explicit constants for maximum limits (e.g., `maxDuration`, `maxLocations`).

## 2026-02-03 - Log Injection and Search Query Limits
**Vulnerability:** Multiple search-related API endpoints (`locations`, `city-search`, etc.) logged user input directly using `console.log` without sanitization, allowing Log Injection. Additionally, these endpoints lacked input length limits, exposing the system to DoS/resource exhaustion via massive strings passed to external APIs.
**Learning:** Developers often overlook sanitization for internal logs. Search endpoints are prime targets for abuse and need strict length limits (e.g., 100-500 chars) before touching any backend logic or external API.
**Prevention:** Always sanitize user input (strip newlines/control chars) before logging. Enforce `MAX_QUERY_LENGTH` constants on all GET/POST search parameters immediately upon receipt.
