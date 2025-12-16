# Find Location User Journey

## Description
User discovers travel destinations based on vibe, activity, and timing, viewing results on an interactive map.

## User Actions
1.  **Enter Preferences:** User enters a "vibe" or activity (e.g., "surfing") in the search bar.
2.  **Select Timing:** User selects a preferred month for travel (or "Anytime").
3.  **Search:** User initiates the search.
4.  **View Results:**
    *   **Map View:** Destinations are plotted as markers.
    *   **List View:** Side panel displays destination cards.
5.  **Filter Results:** User refines results using specific criteria:
    *   Origin City
    *   Trip Duration (days)
    *   Budget (total cost)
    *   Exclusions (things/vibes/places/activities to avoid)
    *   Travel Styles
6.  **Select Destination:** Clicking a destination opens a panel with a detailed breakdown of the location.
7.  **Browse Details:** User browses destination information including description, pricing, and other metadata.
8.  **Recent Searches:** User can access and reload previous search queries.

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
*   **Expected Result:** A panel opens displaying a breakdown of the destination info, including description, pricing, and metadata.

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
*   **Expected Result:** No search is initiated. The application remains in its current state, preventing unnecessary API calls.
