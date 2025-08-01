# SPX AI Template Generator

A React application for generating SPX-GC HTML templates from natural language prompts.

## Features

- **Intuitive Interface**: Clean, modern UI with SPX brand colors
- **Natural Language Input**: Large textarea for describing templates
- **Example Prompts**: Pre-built examples for quick testing
- **Live Preview**: Real-time iframe preview of generated templates
- **Code Viewer**: Tabbed interface showing HTML and JSON output
- **Export Options**: Download, copy to clipboard, and save to SPX-GC folder
- **Responsive Design**: Works on desktop and mobile devices

## Setup Instructions

1. **Install Dependencies**:
   ```bash
   cd spx-ai-template-generator
   pnpm install
   ```

2. **Start Development Server**:
   ```bash
   pnpm run dev
   ```

3. **Open in Browser**:
   Navigate to `http://localhost:5173` (or the port shown in terminal)

## Usage

1. **Enter a Prompt**: Describe the SPX template you want to generate in the textarea
2. **Use Examples**: Click any example prompt button to populate the input
3. **Generate**: Click "Generate Template" to create HTML and JSON
4. **Preview**: View the rendered template in the Preview tab
5. **View Code**: Switch to Code tab to see HTML and JSON source
6. **Export**: Use Download, Copy, or Save to SPX buttons to export your template

## Project Structure

```
spx-ai-template-generator/
├── src/
│   ├── components/ui/     # Reusable UI components
│   ├── App.jsx           # Main application component
│   ├── App.css           # Custom styles with SPX colors
│   └── main.jsx          # Application entry point
├── public/               # Static assets
├── package.json          # Dependencies and scripts
└── tailwind.config.js    # Tailwind configuration with SPX colors
```

## Customization

### Adding AI Integration

Replace the placeholder generation logic in `App.jsx`:

```javascript
const handleGenerate = async () => {
  // Replace this section with actual AI API calls
  // Example: const response = await fetch('/api/generate', { ... })
}
```

### Modifying SPX Colors

Update colors in `tailwind.config.js` and `src/App.css`:

```javascript
colors: {
  'spx-blue': '#295aaf',
  'spx-blue-dark': '#2a3641',
  // ... other colors
}
```

### Adding New Example Prompts

Modify the `examplePrompts` array in `App.jsx`:

```javascript
const examplePrompts = [
  "Your new prompt here",
  // ... existing prompts
]
```

## Technologies Used

- **React 19**: Modern React with hooks
- **TailwindCSS**: Utility-first CSS framework
- **shadcn/ui**: High-quality UI components
- **Lucide React**: Beautiful icons
- **Vite**: Fast build tool and dev server

## Browser Compatibility

- Chrome/Edge 88+
- Firefox 85+
- Safari 14+

## License

This project is provided as-is for SPX-GC template generation purposes.

