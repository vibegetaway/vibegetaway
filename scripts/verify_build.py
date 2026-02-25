
from playwright.sync_api import sync_playwright
import os

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        # Test Home
        print("Navigating to Home...")
        page.goto("http://localhost:3000")
        page.wait_for_load_state("networkidle")
        page.screenshot(path="scripts/home.png")
        print("Home screenshot taken.")

        # Test Search
        print("Navigating to Search...")
        page.goto("http://localhost:3000/search")
        page.wait_for_load_state("networkidle")
        page.screenshot(path="scripts/search.png")
        print("Search screenshot taken.")

        # Test Plan
        print("Navigating to Plan...")
        page.goto("http://localhost:3000/plan")
        page.wait_for_load_state("networkidle")
        page.screenshot(path="scripts/plan.png")
        print("Plan screenshot taken.")

        browser.close()

if __name__ == "__main__":
    run()
