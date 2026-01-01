## 2025-12-27 - Input Validation on Public Suggestion Endpoint
**Vulnerability:** The `/api/suggestions` endpoint lacked strict input validation for the `input` string length, `context` size, and `type` parameter. This created a potential for token exhaustion and unpredictable behavior if invalid types were passed.
**Learning:** Even "simple" autocomplete endpoints connected to LLMs need rigorous boundaries. Whitelisting input values (enums) is safer than relying on default switch cases.
**Prevention:**
1. Define explicit `MAX_LENGTH` constants.
2. Use strict whitelists for string enums.
3. Validate and sanitize context before interpolating it into prompts.