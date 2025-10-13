// src/base-template.js

/**
 * Creates the hidden <div> elements that SPX-GC uses to populate data.
 * @param {Array} fields - The DataFields array from SPXGCTemplateDefinition.
 * @returns {string} - A string of HTML div elements.
 */
function createHiddenDivs(fields) {
    if (!fields) return '';
    return fields
        .filter(field => field.field) // Only create divs for fields with a 'field' id
        .map(field => `        <div data-info="${field.title || ''}" id="${field.field}"></div>`)
        .join('\n');
}

/**
 * Assembles a complete SPX-GC HTML template from generated code blocks.
 * @param {object} templateData - An object containing the generated code.
 * @param {string} templateData.html - The core HTML structure for the template.
 * @param {string} templateData.css - The CSS styles for the template.
 * @param {string} templateData.js - The JavaScript logic (animations, data handling).
 * @param {Array} templateData.dataFields - The SPXGCTemplateDefinition.DataFields array.
 * @returns {string} - A complete HTML template as a string.
 */
export function createTemplate({ html, css, js, dataFields }) {
  const formattedDataFields = dataFields ? dataFields.map(field => `                ${JSON.stringify(field)}`).join(',\n') : '';
  const hiddenDivs = createHiddenDivs(dataFields);

  // Note: The <\/script> is intentional to prevent parsing errors if this string is embedded in other scripts.
  return `<!DOCTYPE html>
<html lang="en">
<!--
    (c) 2024 SPX Graphics
    AI-Generated Template for SPX.
    This template was generated programmatically based on a user prompt.
-->
<head>
    <meta charset="utf-8" />
    <title>SPX_AI_TEMPLATE</title>
    <script src="js/lib/anime.min.js"><\/script>
    <script src="js/lib/lottie.min.js"><\/script>
    <script src="js/spx_interface.js"><\/script>
    <link rel="stylesheet" type="text/css" href="css/styles.css" />
    <link rel="stylesheet" type="text/css" id="DynamicTheme" href="themes/Default.css" />
    <style>
        /* Base styles for positioning */
        .SPXWindow {
            width: 100%;
            height: 100%;
            display: flex;
            align-items: flex-start;
            justify-content: flex-start;
            overflow: hidden;
        }
        /* AI-Generated Styles Below */
${css}
    </style>
    <script>
        /* AI-Generated JavaScript Below */
${js}

        /* SPX-GC Template Definition */
        window.SPXGCTemplateDefinition = {
            "description": "AI Generated Template",
            "playserver": "OVERLAY",
            "playchannel": "1",
            "playlayer": "10",
            "webplayout": "10",
            "out": "manual",
            "dataformat": "json",
            "uicolor": "5",
            "DataFields": [
${formattedDataFields}
            ]
        };
    <\/script>
</head>
<body>
    <div class="SPXWindow">
${html}
    </div>

    <div id="hiddenSpxData" data-info="This data is used by SPX-GC">
${hiddenDivs}
    </div>
</body>
</html>`;
}