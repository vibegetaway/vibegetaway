# Login User Journey (Proposed)

## Description
This journey describes the proposed authentication flow for users. Since the application currently relies on local storage, implementing this journey would allow users to save their itineraries and preferences permanently to a cloud database, enabling access across multiple devices and browsers.

## User Actions
1.  **Sign Up:** User creates a new account using an email address and password, or via a social provider (e.g., Google).
2.  **Log In:** Existing users authenticate using their credentials.
3.  **Sync Data:** Upon logging in, any locally created itineraries are merged with or saved to the user's cloud account.
4.  **Log Out:** User securely ends their session.
5.  **Password Recovery:** User requests a password reset link if they forget their credentials.

## Test Scenarios

### Scenario 1: Successful User Sign Up
*   **Goal:** Verify a new user can create an account.
*   **Steps:**
    1.  Click the "Login/Sign Up" button in the navigation or sidebar.
    2.  Select the "Sign Up" option.
    3.  Enter a valid email address (e.g., `newuser@example.com`).
    4.  Enter a strong password.
    5.  Click "Create Account".
*   **Expected Result:** The user is successfully created, logged in, and redirected to the homepage. A welcome message or profile indicator appears.

### Scenario 2: Successful User Login
*   **Goal:** Verify an existing user can access their account.
*   **Steps:**
    1.  Click the "Login" button.
    2.  Enter a registered email address.
    3.  Enter the correct password.
    4.  Click "Sign In".
*   **Expected Result:** The user is authenticated. Their saved itineraries and preferences (if any) are loaded from the server.

### Scenario 3: Login with Invalid Credentials
*   **Goal:** Verify the system rejects incorrect login attempts securely.
*   **Steps:**
    1.  Click the "Login" button.
    2.  Enter a registered email address.
    3.  Enter an incorrect password.
    4.  Click "Sign In".
*   **Expected Result:** The system denies access and displays a generic error message (e.g., "Invalid email or password"). The user remains on the login screen.

### Scenario 4: User Logout
*   **Goal:** Verify a user can end their session.
*   **Steps:**
    1.  Ensure the user is currently logged in.
    2.  Open the user profile menu.
    3.  Click "Log Out".
*   **Expected Result:** The user is logged out and returned to a guest state. Access to private/cloud-saved data is removed until the next login.

### Scenario 5: Password Reset Request
*   **Goal:** Verify users can recover their account if they forget their password.
*   **Steps:**
    1.  Go to the Login screen.
    2.  Click "Forgot Password?".
    3.  Enter the registered email address.
    4.  Click "Send Reset Link".
*   **Expected Result:** The system confirms a link has been sent (if the email exists). The user receives an email with instructions to reset their password.
