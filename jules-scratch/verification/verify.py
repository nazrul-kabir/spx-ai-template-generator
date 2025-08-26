from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    # Capture console messages
    page.on("console", lambda msg: print(f"Browser console: {msg.text}"))

    page.goto("http://localhost:5173/")

    # Wait for the loading indicator to disappear
    print("Waiting for model to load...")
    expect(page.locator('div:has-text("Loading model...")')).to_be_hidden(timeout=240000)
    print("Model loaded!")

    # Take a screenshot to verify the initial state
    page.screenshot(path="jules-scratch/verification/verification.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
