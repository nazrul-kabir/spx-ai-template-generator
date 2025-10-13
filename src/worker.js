import { pipeline } from "@huggingface/transformers";
import { LOTTIE_FILES, THEME_FILES } from "./assets";

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

// A more robust parser with fallbacks
function parseAIOutput(aiResponse, prompt) {
    const html = aiResponse.match(/<html_code>([\s\S]*?)<\/html_code>/)?.[1] || '<!-- HTML Generation Failed -->';
    const css = aiResponse.match(/<css_code>([\s\S]*?)<\/css_code>/)?.[1] || '/* CSS Generation Failed */';
    const js = aiResponse.match(/<js_code>([\s\S]*?)<\/js_code>/)?.[1] || '// JS Generation Failed';

    let dataFields = [];
    try {
        const fieldsJson = aiResponse.match(/<data_fields>([\s\S]*?)<\/data_fields>/)?.[1];
        if (fieldsJson) {
            const cleanedJson = fieldsJson.replace(/```json/g, '').replace(/```/g, '').trim();
            dataFields = JSON.parse(cleanedJson);
        }
    } catch (e) {
        console.error("Failed to parse DataFields JSON. Applying fallback.", e);
    }

    // Fallback: If AI fails to generate valid DataFields, create some defaults
    if (dataFields.length === 0) {
        dataFields.push({ field: "f0", ftype: "textfield", title: "Main Text", value: "Default Main Text" });
        if (prompt.toLowerCase().includes("title") || prompt.toLowerCase().includes("subtitle")) {
             dataFields.push({ field: "f1", ftype: "textfield", title: "Sub Text", value: "Default Sub Text" });
        }
        dataFields.push({ field: "f99", ftype: "filelist", title: "Visual theme", assetfolder: "./themes/", extension: "css", value: "./themes/Default.css" });
    }

    return { html, css, js, dataFields };
}

// Main message handler
self.addEventListener("message", async (event) => {
  const { type, prompt } = event.data;

  if (type !== 'generate') return;

  try {
    const generator = await TemplateGenerationPipeline.getInstance();

    const fullPrompt = `
You are an expert SPX-GC template developer. Your task is to generate the HTML, CSS, and JavaScript for a new template based on the user's request.
You must follow all instructions carefully and produce valid, complete code.

**User Request:** "${prompt}"

**Instructions:**
1.  **HTML:** Create \`div\` elements with descriptive IDs. Wrap in \`<html_code> ... </html_code>\`.
2.  **CSS:** Style the elements. Wrap in \`<css_code> ... </css_code>\`.
3.  **JavaScript:** Create \`runAnimationIN\`, \`runAnimationOUT\`, and \`runTemplateUpdate\` functions using anime.js. Wrap in \`<js_code> ... </js_code>\`.
4.  **DataFields:** This is critical. You MUST generate a valid JSON array for the data fields. Do not use placeholders. Wrap the complete, valid JSON array in \`<data_fields> ... </data_fields>\`.

**Available Assets:**
-   Lottie animations: ${LOTTIE_FILES.join(", ")}
-   CSS themes: ${THEME_FILES.join(", ")}

Begin the generation now.
`;

    const generationOutput = await generator(fullPrompt, {
        max_new_tokens: 1536,
        temperature: 0.6, // Slightly lower temperature for more predictable JSON
        do_sample: true,
        top_k: 40,
    });

    const parsedOutput = parseAIOutput(generationOutput[0].generated_text, prompt);

    self.postMessage({
      status: "complete",
      output: parsedOutput,
    });

  } catch (error) {
    console.error("Template generation failed:", error);
    self.postMessage({ status: "error", error: error.message });
  }
});

// Immediately load the model
(async () => {
    try {
        await TemplateGenerationPipeline.getInstance(self.postMessage);
        self.postMessage({ status: 'ready' });
    } catch (error) {
        console.error("Failed to load model on worker startup:", error);
        self.postMessage({ status: "error", error: "Model initialization failed." });
    }
})();