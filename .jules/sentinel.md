## 2024-05-22 - LLM API Input Validation
**Vulnerability:** Public API endpoints that trigger LLM calls (`/api/plan-trip`) lacked input validation limits on string lengths and array sizes.
**Learning:** In LLM-powered applications, unvalidated inputs can lead to "Wallet DoS" (excessive token usage) and service disruption. Validating the "shape" (types) is insufficient; strict "bounds" (lengths, counts) are required.
**Prevention:** Enforce strict upper bounds on all user inputs before they reach the LLM context.
