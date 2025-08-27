"use client";

import { useState } from "react";

export default function GeminiCartoonifyPage() {
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [textPrompt, setTextPrompt] = useState<string>("");

  const handleGenerateFromText = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch('/api/clipdrop/text-to-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: textPrompt }),
      });

      const result = await response.json();
      
      if (result.success) {
        setGeneratedImage(result.imageUrl ?? null);
      } else {
        console.error(result.error);
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error('Error calling API:', error);
      alert('Error generating image. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6">Gemini Text-to-Image Generation</h1>
      
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Generated Image</h2>
        
        {generatedImage && (
          <img 
            src={generatedImage} 
            alt="Generated" 
            className="max-w-full h-auto rounded"
          />
        )}
        
        {!generatedImage && (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <p className="text-gray-500">Generated image will appear here</p>
          </div>
        )}
      </div>
      
      <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Controls</h2>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Text Prompt</label>
          <input
            type="text"
            value={textPrompt}
            onChange={(e) => setTextPrompt(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Enter prompt for image generation..."
          />
        </div>
        
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={handleGenerateFromText}
            disabled={isProcessing}
            className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {isProcessing ? "Processing..." : "Generate Image from Text"}
          </button>
        </div>
      </div>
    </div>
  );
}
