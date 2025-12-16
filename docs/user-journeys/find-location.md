# Find Location User Journey

## Description
This journey describes how a user discovers travel destinations based on their preferences (vibe/activity) and timing. The goal is to provide personalized recommendations displayed on an interactive map and list view.

## User Actions
1.  **Enter Preferences:** User enters a natural language "vibe" or activity (e.g., "surfing", "quiet hiking") in the search bar.
2.  **Select Timing:** User selects a preferred month for travel (or "Anytime").
3.  **Search:** User initiates the search via button click or pressing Enter.
4.  **View Results:**
    *   **Map View:** Destinations are plotted as markers on the world map.
    *   **List View:** A side panel displays detailed cards for each destination.
5.  **Filter Results:** User refines results using specific criteria:
    *   Origin City
    *   Specific Locations
    *   Trip Duration (days)
    *   Budget (total cost)
    *   Exclusions (places to avoid)
    *   Travel Styles
6.  **Select Destination:** Clicking a destination (on map or list) highlights it and provides more details (description, pricing, etc.).
7.  **Recent Searches:** User can access and reload previous search queries from a history panel.

## Test Scenarios

### Scenario 1: Basic Search by Vibe and Month
*   **Goal:** Verify users can find destinations using the primary search inputs.
*   **Steps:**
    1.  Navigate to the homepage.
    2.  Locate the search bar.
    3.  Enter "Scuba diving" into the "vibe" input field.
    4.  Select "December" from the month dropdown.
    5.  Click the search button (arrow icon).
*   **Expected Result:** The map updates with markers, and the "Search Results" panel opens displaying a list of destinations relevant to scuba diving in December.

### Scenario 2: Refine Search with Budget Filter
*   **Goal:** Verify filters correctly restrict the displayed results.
*   **Steps:**
    1.  Perform a basic search (e.g., "European city break").
    2.  Wait for results to load.
    3.  Click the "Budget" filter tag (or open the Filter panel).
    4.  Adjust the budget slider to a lower value (e.g., $1000).
    5.  Observe the results list.
*   **Expected Result:** The list of destinations updates to show only options that fit within the specified budget estimate.

### Scenario 3: View Destination Details
*   **Goal:** Verify users can access detailed information about a specific recommendation.
*   **Steps:**
    1.  Perform a search that yields multiple results.
    2.  In the "Search Results" panel, click on a specific destination card (e.g., "Bali, Indonesia").
*   **Expected Result:** The map zooms or focuses on the selected location. The destination card may expand or a details view appears showing description, pricing breakdown, and other metadata.

### Scenario 4: Reload a Recent Search
*   **Goal:** Verify the search history functionality works and restores state.
*   **Steps:**
    1.  Perform a unique search (e.g., "Skiing in Japan").
    2.  Refresh the page (or navigate away and back).
    3.  Open the "Recent Searches" panel (via the sidebar icon).
    4.  Click on the entry for "Skiing in Japan".
*   **Expected Result:** The application re-executes the search or loads cached results for "Skiing in Japan", restoring the vibe, month, and any applied filters.

### Scenario 5: Search Validation (Empty Input)
*   **Goal:** Ensure the system handles empty inputs gracefully.
*   **Steps:**
    1.  Navigate to the homepage.
    2.  Clear the "vibe" input field if it has text.
    3.  Click the search button or press Enter.
*   **Expected Result:** No search is initiated. The application remains in its current state (or shows a prompt to enter a vibe), preventing unnecessary API calls.
