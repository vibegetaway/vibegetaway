from playwright.sync_api import sync_playwright

def verify_map_markers():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to the app
        print("Navigating to app...")
        page.goto("http://localhost:3000")

        # Wait for map to load (the canvas or container)
        print("Waiting for map...")
        page.wait_for_selector(".leaflet-container")

        # Take screenshot of the map
        page.screenshot(path="verification/map.png")
        print("Screenshot saved to verification/map.png")

        browser.close()

if __name__ == "__main__":
    verify_map_markers()
