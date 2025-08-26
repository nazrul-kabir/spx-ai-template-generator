import { useState, useEffect, useRef } from 'react'
import { pipeline } from '@huggingface/transformers'
import { Button } from '@/components/ui/button.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Download, Copy, Save, Sparkles } from 'lucide-react'
import './App.css'

function App() {
  const [prompt, setPrompt] = useState('')
  const [generatedHTML, setGeneratedHTML] = useState('')
  const [generatedJSON, setGeneratedJSON] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isModelLoading, setIsModelLoading] = useState(true)
  const [loadingMessage, setLoadingMessage] = useState('Initializing model...')

  const generator = useRef(null)
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const initializeGenerator = async () => {
      setLoadingMessage('Loading model pipeline...')
      try {
        generator.current = await pipeline('text2text-generation', 't5-small', {
          progress_callback: (progress) => {
            const message = `Loading model: ${progress.file} (${Math.round(progress.progress)}%)`
            setLoadingMessage(message)
          },
        })
        setLoadingMessage('Model loaded successfully!')
        setIsModelLoading(false)
      } catch (error) {
        console.error("Failed to load model:", error)
        setLoadingMessage('Error loading model. Please refresh.')
      }
    }
    initializeGenerator()
  }, [])

  const examplePrompts = [
    "Create a lower third template with animated text for news broadcasts",
    "Design a sports scoreboard template with team logos and score display",
    "Make a weather forecast template with animated icons and temperature",
    "Build a breaking news banner with scrolling text and urgent styling"
  ]

  const handleGenerate = async () => {
    if (!prompt.trim() || !generator.current) return
    
    setIsGenerating(true)
    setGeneratedHTML('')
    setGeneratedJSON('')

    const fullPrompt = `
You are an expert in creating HTML templates for live video production.
Generate a complete, single HTML file based on the following prompt.
The HTML should include inline CSS for styling and JavaScript for any animations if necessary.
Do not include any explanations, just the raw HTML code.
The HTML code must start with <!DOCTYPE html>.

Prompt: "${prompt}"
`
    
    try {
      const output = await generator.current(fullPrompt, {
        max_new_tokens: 1024,
        temperature: 0.7,
        top_k: 50,
        repetition_penalty: 1.2,
        no_repeat_ngram_size: 2,
      })

      let generatedText = output[0].generated_text
      const htmlStartIndex = generatedText.indexOf('<!DOCTYPE html>')

      if (htmlStartIndex !== -1) {
        generatedText = generatedText.substring(htmlStartIndex)
      }

      const sampleJSON = `{
  "description": "Generated template based on user prompt",
  "prompt": "${prompt}",
  "DataFields": []
}`

      setGeneratedHTML(generatedText)
      setGeneratedJSON(sampleJSON)
    } catch (error) {
      console.error("Failed to generate template:", error)
      setGeneratedHTML("<p>Error generating template. Please try again.</p>")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleExampleClick = (example) => {
    setPrompt(example)
  }

  const handleDownload = () => {
    if (!generatedHTML) return
    
    const blob = new Blob([generatedHTML], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'spx-template.html'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleCopy = async () => {
    if (!generatedHTML) return
    
    try {
      await navigator.clipboard.writeText(generatedHTML)
      // Could add toast notification here
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleSave = () => {
    // Placeholder for SPX-GC folder save functionality
    console.log('Save to SPX-GC folder functionality would go here')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-spx-blue-darkest to-spx-blue-dark">
      {/* Header */}
      <header className="bg-spx-blue-dark/80 backdrop-blur-sm border-b border-spx-gray-dark">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <Sparkles className="h-8 w-8 text-spx-blue" />
            <h1 className="text-3xl font-bold text-spx-white">SPX AI Template Generator</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Input Section */}
          <div className="space-y-6">
            {/* Prompt Input */}
            <Card className="bg-spx-blue-dark/50 border-spx-gray-dark">
              <CardHeader>
                <CardTitle className="text-spx-white">Describe Your Template</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder={isModelLoading ? loadingMessage : "Describe the SPX template you want to generate..."}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="min-h-32 bg-spx-blue-darkest/50 border-spx-gray-dark text-spx-white placeholder:text-spx-gray-light"
                  disabled={isModelLoading || isGenerating}
                />
                <Button 
                  onClick={handleGenerate}
                  disabled={!prompt.trim() || isGenerating || isModelLoading}
                  className="w-full bg-spx-blue hover:bg-spx-blue/80 text-spx-white"
                >
                  {isModelLoading ? loadingMessage : isGenerating ? 'Generating...' : 'Generate Template'}
                </Button>
              </CardContent>
            </Card>

            {/* Example Prompts */}
            <Card className="bg-spx-blue-dark/50 border-spx-gray-dark">
              <CardHeader>
                <CardTitle className="text-spx-white">Example Prompts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-2">
                  {examplePrompts.map((example, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      onClick={() => handleExampleClick(example)}
                      className="text-left h-auto p-3 bg-spx-blue-darkest/30 border-spx-gray-dark text-spx-gray-light hover:bg-spx-blue-darkest/50 hover:text-spx-white"
                      disabled={isModelLoading || isGenerating}
                    >
                      {example}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Export Section */}
            {generatedHTML && (
              <Card className="bg-spx-blue-dark/50 border-spx-gray-dark">
                <CardHeader>
                  <CardTitle className="text-spx-white">Export Template</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <Button
                      onClick={handleDownload}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                    <Button
                      onClick={handleCopy}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                    <Button
                      onClick={handleSave}
                      className="bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save to SPX
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Preview Section */}
          <div className="space-y-6">
            <Card className="bg-spx-blue-dark/50 border-spx-gray-dark">
              <CardHeader>
                <CardTitle className="text-spx-white">Preview</CardTitle>
              </CardHeader>
              <CardContent>
                {generatedHTML ? (
                  <Tabs defaultValue="preview" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 bg-spx-blue-darkest">
                      <TabsTrigger value="preview" className="text-spx-gray-light data-[state=active]:text-spx-white">Preview</TabsTrigger>
                      <TabsTrigger value="code" className="text-spx-gray-light data-[state=active]:text-spx-white">Code</TabsTrigger>
                    </TabsList>
                    <TabsContent value="preview" className="mt-4">
                      <div className="border border-spx-gray-dark rounded-lg overflow-hidden">
                        <iframe
                          srcDoc={generatedHTML}
                          className="w-full h-96 bg-white"
                          title="Template Preview"
                        />
                      </div>
                    </TabsContent>
                    <TabsContent value="code" className="mt-4">
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-sm font-medium text-spx-gray-light mb-2">HTML Template</h4>
                          <pre className="bg-spx-blue-darkest p-4 rounded-lg text-xs text-spx-gray-light overflow-auto max-h-48">
                            <code>{generatedHTML}</code>
                          </pre>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-spx-gray-light mb-2">JSON Configuration</h4>
                          <pre className="bg-spx-blue-darkest p-4 rounded-lg text-xs text-spx-gray-light overflow-auto max-h-48">
                            <code>{generatedJSON}</code>
                          </pre>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                ) : (
                  <div className="flex items-center justify-center h-96 border border-spx-gray-dark rounded-lg bg-spx-blue-darkest/30">
                    <p className="text-spx-gray-light">Generate a template to see the preview</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App

