import { useState, useRef, useEffect } from 'react';
import { createTemplate } from './base-template';
import Progress from './components/Progress';

const examplePrompts = [
  "Create a simple red box in the top left.",
  "Make a blue circle in the center of the screen.",
  "Design a lower-third bar with a semi-transparent black background."
];

function App() {
  const [ready, setReady] = useState(null);
  const [progressItems, setProgressItems] = useState([]);
  const worker = useRef(null);
  const [prompt, setPrompt] = useState('');
  const [generatedTemplate, setGeneratedTemplate] = useState('<!-- Your generated HTML template will appear here -->');
  const [activeTab, setActiveTab] = useState('preview');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (!worker.current) {
      worker.current = new Worker(new URL('./worker.js', import.meta.url), {
        type: 'module',
      });
    }

    const onMessageReceived = (e) => {
      switch (e.data.status) {
        case 'initiate':
          setReady(false);
          setProgressItems((prev) => [...prev, e.data]);
          break;
        case 'progress':
          setProgressItems((prev) =>
            prev.map((item) => item.file === e.data.file ? { ...item, ...e.data } : item)
          );
          break;
        case 'done':
          setProgressItems((prev) => prev.filter((item) => item.file !== e.data.file));
          break;
        case 'ready':
          setReady(true);
          break;
        case 'complete':
          const finalHtml = createTemplate(e.data.output);
          setGeneratedTemplate(finalHtml);
          setIsGenerating(false);
          setActiveTab('preview');
          break;
        case 'error':
            alert('An error occurred during template generation.');
            setIsGenerating(false);
            break;
      }
    };

    worker.current.addEventListener('message', onMessageReceived);
    return () => worker.current.removeEventListener('message', onMessageReceived);
  }, []);

  const handleGenerate = () => {
    if (!prompt || isGenerating) return;
    setIsGenerating(true);
    setGeneratedTemplate('<!-- Generating, please wait... -->');
    worker.current.postMessage({
        type: 'generate',
        prompt: prompt,
    });
  };

  const handleDownload = () => {
    const blob = new Blob([generatedTemplate], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'spx_ai_template.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedTemplate).then(() => {
      alert('Copied to clipboard!');
    }, () => {
      alert('Failed to copy.');
    });
  };

  const showLoading = ready === false || progressItems.length > 0;

  return (
    <div className="flex h-screen w-screen bg-gray-900 text-white font-sans">
      <div className={`absolute inset-0 z-50 flex flex-col items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm transition-opacity ${showLoading ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        {ready === false && <p className="text-3xl mb-4">Loading AI Model...</p>}
        {progressItems.map((data) => <Progress key={data.file} data={data} />)}
      </div>

      <div className="flex flex-1">
        <div className="w-1/3 p-6 flex flex-col border-r border-gray-700">
          <h1 className="text-3xl font-bold text-blue-400">SPX AI Template Generator</h1>
          <p className="mt-2 text-gray-400">Describe the visual element you want to create.</p>

          <textarea
            className="w-full h-1/2 mt-4 p-3 bg-gray-800 border border-gray-600 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., 'A simple red box in the top left.'"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />

          <div className="mt-4">
            <p className="text-gray-400">Or try an example:</p>
            <div className="grid grid-cols-1 gap-2 mt-2">
              {examplePrompts.map((p, i) => (
                <button key={i} onClick={() => setPrompt(p)} className="p-2 bg-gray-700 hover:bg-gray-600 rounded-md text-left text-sm">
                  {p}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating || !ready}
            className="w-full mt-auto py-3 text-lg font-bold bg-blue-600 hover:bg-blue-500 rounded-md disabled:bg-gray-500 disabled:cursor-not-allowed"
          >
            {isGenerating ? 'Generating...' : 'Generate Template'}
          </button>
        </div>

        <div className="w-2/3 p-6 flex flex-col">
          <div className="flex border-b border-gray-700">
            <button onClick={() => setActiveTab('preview')} className={`px-4 py-2 text-lg ${activeTab === 'preview' ? 'border-b-2 border-blue-500 text-white' : 'text-gray-400'}`}>
              Preview
            </button>
            <button onClick={() => setActiveTab('code')} className={`px-4 py-2 text-lg ${activeTab === 'code' ? 'border-b-2 border-blue-500 text-white' : 'text-gray-400'}`}>
              Code
            </button>
          </div>

          <div className="flex-1 mt-4 bg-gray-800 rounded-md overflow-hidden">
            {activeTab === 'preview' && (
              <iframe
                srcDoc={generatedTemplate}
                title="Template Preview"
                className="w-full h-full border-0"
                sandbox="allow-scripts allow-same-origin"
              />
            )}
            {activeTab === 'code' && (
              <div className="relative h-full">
                <div className="absolute top-2 right-2 flex gap-2">
                  <button onClick={handleDownload} className="px-3 py-1 bg-gray-600 hover:bg-gray-500 rounded-md text-sm">Download</button>
                  <button onClick={handleCopy} className="px-3 py-1 bg-gray-600 hover:bg-gray-500 rounded-md text-sm">Copy</button>
                </div>
                <pre className="h-full p-4 overflow-auto"><code className="text-sm">{generatedTemplate}</code></pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;