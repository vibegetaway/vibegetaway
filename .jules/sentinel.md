## 2025-12-27 - Input Validation on Public LLM Endpoints
**Vulnerability:** The `/api/plan-trip` endpoint lacked input validation for `tripDuration`, `locations` count, and string lengths in `filters`. This exposed the application to Denial of Service (DoS) attacks via payload bloat and potential cost exhaustion (LLM token usage).
**Learning:** Public endpoints that trigger expensive operations (like LLM calls) must have strict, early validation boundaries. Validating types (`Array.isArray`) is crucial to prevent runtime 500 errors.
**Prevention:** Implement strict schema validation (using Zod or manual checks) at the top of every API route handler. Define explicit constants for maximum limits (e.g., `maxDuration`, `maxLocations`).

## 2025-05-20 - Validation Gap in Autocomplete APIs
**Vulnerability:** The `/api/suggestions` endpoint accepted unbounded input strings and arbitrary `type` parameters, exposing the system to token exhaustion (DoS) and potential prompt injection.
**Learning:** Even "lightweight" autocomplete endpoints can be abused if they connect to LLMs. Frontend-only validation (e.g., in `SmartTagInput`) is insufficient.
**Prevention:** Enforce strict character limits (e.g., 500 chars) and whitelist validation for all parameters (e.g., `type`) on the server side before any LLM invocation.
