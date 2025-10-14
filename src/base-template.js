// src/base-template.js

function createHiddenDivs(fields) {
    if (!fields) return '';
    return fields
        .filter(field => field.field)
        .map(field => `        <div data-info="${field.title || ''}" id="${field.field}"></div>`)
        .join('\n');
}

export function createTemplate({ html, css, js, dataFields }) {
  const formattedDataFields = dataFields ? dataFields.map(field => `                ${JSON.stringify(field)}`).join(',\n') : '';
  const hiddenDivs = createHiddenDivs(dataFields);

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <title>SPX_AI_TEMPLATE</title>
    <script src="js/lib/anime.min.js"><\/script>
    <script src="js/lib/lottie.min.js"><\/script>
    <script src="js/spx_interface.js"><\/script>
    <link rel="stylesheet" type="text/css" href="css/styles.css" />
    <link rel="stylesheet" type="text/css" id="DynamicTheme" href="themes/Default.css" />
    <style>
        .SPXWindow { width: 100%; height: 100%; display: flex; align-items: flex-start; justify-content: flex-start; overflow: hidden; }
${css}
    </style>
    <script>
${js}
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