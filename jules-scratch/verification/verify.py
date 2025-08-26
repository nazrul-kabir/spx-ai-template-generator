from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    page.goto("http://localhost:5175/")

    # 1. Wait for the model to finish loading.
    # We can do this by waiting for the textarea's placeholder to change.
    print("Waiting for model to load...")
    textarea = page.locator('textarea')
    expect(textarea).to_have_attribute("placeholder", "Describe the SPX template you want to generate...", timeout=300000)
    print("Model loaded!")

    # 2. Type a prompt into the textarea.
    prompt_text = "Create a simple red button."
    print(f"Typing prompt: '{prompt_text}'")
    textarea.fill(prompt_text)

    # 3. Assert that the button is now enabled.
    generate_button = page.locator('button:has-text("Generate Template")')
    expect(generate_button).to_be_enabled()
    print("Generate button is enabled.")

    # 4. Take a screenshot to verify the final state.
    page.screenshot(path="jules-scratch/verification/verification.png")
    print("Screenshot taken.")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
