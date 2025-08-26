from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    # Capture console messages
    page.on("console", lambda msg: print(f"Browser console: {msg.text}"))

    page.goto("http://localhost:5175/")

    # Wait for the model to load by checking for the success message in the button
    print("Waiting for model to load...")
    expect(page.locator('button:has-text("Generate Template")')).to_be_enabled(timeout=240000)
    print("Model loaded!")

    # Take a screenshot to verify the initial state
    page.screenshot(path="jules-scratch/verification/verification.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
