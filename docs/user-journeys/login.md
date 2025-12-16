# Login User Journey (Proposed)

## Description
This journey describes the proposed authentication flow for users. Since the application currently relies on local storage, implementing this journey would allow users to save their itineraries and preferences permanently to a cloud database, enabling access across multiple devices and browsers.

## User Actions
1.  **Sign Up / Log In:** User authenticates via Google Sign-In. No separate "Sign Up" flow is needed; new users are automatically created.
2.  **Sync Data:** Upon logging in, any locally created itineraries are merged with or saved to the user's cloud account.
3.  **Log Out:** User securely ends their session.

## Test Scenarios

### Scenario 1: Successful Google Sign-In (New User)
*   **Goal:** Verify a new user can create an account using Google.
*   **Steps:**
    1.  Click the "Login" button in the navigation or sidebar.
    2.  Select "Continue with Google".
    3.  Complete the Google authentication flow in the popup window.
*   **Expected Result:** The user is successfully authenticated and redirected to the homepage. A welcome message or profile indicator appears.

### Scenario 2: Successful Google Sign-In (Returning User)
*   **Goal:** Verify an existing user can access their account using Google.
*   **Steps:**
    1.  Click the "Login" button.
    2.  Select "Continue with Google".
    3.  Complete the Google authentication flow (if not already signed in to Google).
*   **Expected Result:** The user is authenticated. Their saved itineraries and preferences (if any) are loaded from the server.

### Scenario 3: Google Sign-In Cancellation
*   **Goal:** Verify the system handles a cancelled authentication attempt.
*   **Steps:**
    1.  Click the "Login" button.
    2.  Select "Continue with Google".
    3.  Close the Google popup window without signing in.
*   **Expected Result:** The user remains on the login screen or current page as a guest. No error message is shown (or a "Sign in cancelled" toast appears).

### Scenario 4: User Logout
*   **Goal:** Verify a user can end their session.
*   **Steps:**
    1.  Ensure the user is currently logged in.
    2.  Open the user profile menu.
    3.  Click "Log Out".
*   **Expected Result:** The user is logged out and returned to a guest state. Access to private/cloud-saved data is removed until the next login.

### Scenario 5: Syncing Local Data on Login
*   **Goal:** Verify that items added to the itinerary before logging in are preserved.
*   **Steps:**
    1.  As a guest, add a destination to the itinerary.
    2.  Click "Login".
    3.  Authenticate via Google.
    4.  Open the Itinerary panel.
*   **Expected Result:** The destination added while in guest mode is present in the authenticated user's itinerary (merged with any existing cloud data).
