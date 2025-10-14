import { pipeline } from "@huggingface/transformers";
import { LOTTIE_FILES, THEME_FILES } from "./assets";

const DEFAULT_JS_FALLBACK = `
function runTemplateUpdate() {
    const mainTextElement = document.getElementById('f0_text');
    if (mainTextElement) {
        const dataElement = document.querySelector('#hiddenSpxData #[id="f0"]');
        mainTextElement.innerHTML = dataElement?.innerText || "Fallback Text";
    }
    runAnimationIN();
}
function runAnimationIN() {
    const container = document.getElementById('fallback_container');
    if (container) {
        container.style.opacity = 0;
        requestAnimationFrame(() => {
            container.style.transition = 'opacity 0.5s';
            container.style.opacity = 1;
        });
    }
}
function runAnimationOUT() {
    const container = document.getElementById('fallback_container');
    if (container) {
        container.style.transition = 'opacity 0.5s';
        container.style.opacity = 0;
    }
}
`;

class TemplateGenerationPipeline {
  static task = "text-generation";
  static model = "Xenova/codegen-350M-mono";
  static instance = null;

  static async getInstance(progress_callback = null) {
    if (this.instance === null) {
      this.instance = await pipeline(this.task, this.model, { progress_callback });
    }
    return this.instance;
  }
}

function parseAIOutput(aiResponse) {
    let html = aiResponse.match(/<SPX_HTML>([\s\S]*?)<\/SPX_HTML>/)?.[1]?.trim();
    let css = aiResponse.match(/<SPX_CSS>([\s\S]*?)<\/SPX_CSS>/)?.[1]?.trim() || '';
    let js = aiResponse.match(/<SPX_JS>([\s\S]*?)<\/SPX_JS>/)?.[1]?.trim();
    let dataFieldsStr = aiResponse.match(/<SPX_DATA>([\s\S]*?)<\/SPX_DATA>/)?.[1]?.trim() || '[]';

    let useFallback = false;

    // Check if the AI just returned the placeholder comments
    if (!js || js === "/* JS code for runTemplateUpdate, runAnimationIN, and runAnimationOUT here */") {
        console.warn("AI failed to generate valid JavaScript. Using fallback.");
        js = DEFAULT_JS_FALLBACK;
        useFallback = true;
    }
    if (!html || html === "/* HTML code here */") {
        console.warn("AI failed to generate valid HTML. Using fallback.");
        html = '<div id="fallback_container" style="padding: 2em; font-family: sans-serif; font-size: 24px; color: white; background: #222;"><div id="f0_text"></div></div>';
        useFallback = true;
    }

    let dataFields = [];
    try {
        if (dataFieldsStr && dataFieldsStr !== "/* JSON array for DataFields here */") {
            // Use global regex for cleaning backticks
            dataFields = JSON.parse(dataFieldsStr.replace(/```json/g, '').replace(/```/g, '').trim());
        } else {
            throw new Error("DataFields contains placeholders or is missing.");
        }
    } catch (e) {
        console.warn(`Failed to parse DataFields JSON: ${e.message}.`);
        useFallback = true;
    }

    if (useFallback && dataFields.length === 0) {
        dataFields = [{ field: "f0", ftype: "textfield", title: "Main Text", value: "GENERATION FAILED: Using Fallback" }];
    }

    return { html, css, js, dataFields };
}


self.addEventListener("message", async (event) => {
  const { type, prompt } = event.data;
  if (type !== 'generate') return;

  try {
    const generator = await TemplateGenerationPipeline.getInstance();

    const fullPrompt = `
You are a code generation expert. Fill in the placeholders in the following template based on the user's request.
Do not output anything other than the completed template. Do not use placeholders like '...'.

**User Request:** "${prompt}"

**Template to complete:**
<SPX_HTML>
/* HTML code here */
</SPX_HTML>

<SPX_CSS>
/* CSS code here */
</SPX_CSS>

<SPX_JS>
/* JS code for runTemplateUpdate, runAnimationIN, and runAnimationOUT here */
</SPX_JS>

<SPX_DATA>
/* JSON array for DataFields here */
</SPX_DATA>
`;

    const generationOutput = await generator(fullPrompt, {
        max_new_tokens: 1024,
        temperature: 0.5,
        do_sample: true,
        top_k: 40,
    });

    const rawOutput = generationOutput[0].generated_text;
    const parsedOutput = parseAIOutput(rawOutput);

    self.postMessage({
      status: "complete",
      output: parsedOutput,
    });

  } catch (error) {
    console.error("Template generation failed:", error);
    self.postMessage({ status: "error", error: error.message });
  }
});

(async () => {
    try {
        await TemplateGenerationPipeline.getInstance(self.postMessage);
        self.postMessage({ status: 'ready' });
    } catch (error) {
        console.error("Failed to load model on worker startup:", error);
        self.postMessage({ status: "error", error: "Model initialization failed." });
    }
})();