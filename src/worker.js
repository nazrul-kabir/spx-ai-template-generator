import { pipeline } from "@huggingface/transformers";

const HARDCODED_JS = `
function runTemplateUpdate() {
    const mainTextElement = document.getElementById('f0_text');
    if (mainTextElement) {
        const dataElement = document.querySelector('#hiddenSpxData #[id="f0"]');
        mainTextElement.innerText = dataElement?.innerText || "Hello World";
    }
    runAnimationIN();
}
function runAnimationIN() {
    const mainElement = document.getElementById('main_element');
    if (mainElement) {
        mainElement.style.opacity = 0;
        requestAnimationFrame(() => {
            mainElement.style.transition = 'opacity 0.5s';
            mainElement.style.opacity = 1;
        });
    }
}
function runAnimationOUT() {
    const mainElement = document.getElementById('main_element');
    if (mainElement) {
        mainElement.style.transition = 'opacity 0.5s';
        mainElement.style.opacity = 0;
    }
}
`;

const HARDCODED_DATA_FIELDS = [
    { field: "f0", ftype: "textfield", title: "Main Text", value: "Hello World" }
];

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
    const html = aiResponse.match(/<SPX_HTML>([\s\S]*?)<\/SPX_HTML>/)?.[1]?.trim() || '<div id="main_element" class="main-style"><span id="f0_text"></span></div>';
    const css = aiResponse.match(/<SPX_CSS>([\s\S]*?)<\/SPX_CSS>/)?.[1]?.trim() || '.main-style { padding: 2em; font-size: 24px; color: white; }';

    return { html, css, js: HARDCODED_JS, dataFields: HARDCODED_DATA_FIELDS };
}

self.addEventListener("message", async (event) => {
  const { type, prompt } = event.data;
  if (type !== 'generate') return;

  try {
    const generator = await TemplateGenerationPipeline.getInstance();

    const fullPrompt = `
You are a code generation expert. Generate HTML and CSS for the user's request.
**User Request:** "${prompt}"

<SPX_HTML>
</SPX_HTML>

<SPX_CSS>
</SPX_CSS>
`;

    const generationOutput = await generator(fullPrompt, {
        max_new_tokens: 512,
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