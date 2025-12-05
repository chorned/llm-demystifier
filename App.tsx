
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Model, Message } from './types';
import { MODELS, MODEL_PRICING, MODEL_NAMES } from './constants';
import WelcomeScreen from './components/WelcomeScreen';
import ChatColumn from './components/ChatColumn';
import PromptInput from './components/PromptInput';
import AnalyticsView from './components/AnalyticsView';

declare global {
  interface Window {
    Chart: any;
  }
}

const App: React.FC = () => {
  const [showWelcomeScreen, setShowWelcomeScreen] = useState<boolean>(true);
  const [isAnalyticsVisible, setIsAnalyticsVisible] = useState<boolean>(false);
  const [prompt, setPrompt] = useState<string>('');
  // FIX: Update model name to gemini-3-pro-preview as per Gemini API guidelines.
  const [histories, setHistories] = useState<Record<Model, Message[]>>({
    'gemini-3-pro-preview': [],
    'gemini-flash-latest': [],
  });
  // FIX: Update model name to gemini-3-pro-preview as per Gemini API guidelines.
  const [loadingStates, setLoadingStates] = useState<Record<Model, boolean>>({
    'gemini-3-pro-preview': false,
    'gemini-flash-latest': false,
  });
  // FIX: Update model name to gemini-3-pro-preview as per Gemini API guidelines.
  const [totalSessionTokens, setTotalSessionTokens] = useState<Record<Model, number>>({
    'gemini-3-pro-preview': 0,
    'gemini-flash-latest': 0,
  });
  // FIX: Update model name to gemini-3-pro-preview as per Gemini API guidelines.
  const [activeMobileModel, setActiveMobileModel] = useState<Model>('gemini-3-pro-preview');
  // FIX: Update model name to gemini-3-pro-preview as per Gemini API guidelines.
  const [tokenHistories, setTokenHistories] = useState<Record<Model, number[]>>({
    'gemini-3-pro-preview': [],
    'gemini-flash-latest': [],
  });

  // Chart refs
  const proChartRef = useRef<HTMLCanvasElement>(null);
  const flashChartRef = useRef<HTMLCanvasElement>(null);
  const proChartInstanceRef = useRef<any>(null);
  const flashChartInstanceRef = useRef<any>(null);


  const handleSubmit = useCallback(async () => {
    if (!prompt.trim()) return;
    
    const userMessage: Message = {
      role: 'user',
      parts: [{ text: prompt }],
      timestamp: new Date().toISOString(),
    };

    const newHistories = { ...histories };
    MODELS.forEach(model => {
      newHistories[model] = [...newHistories[model], userMessage];
    });

    setHistories(newHistories);
    setPrompt('');
    // FIX: Update model name to gemini-3-pro-preview as per Gemini API guidelines.
    setLoadingStates({ 'gemini-3-pro-preview': true, 'gemini-flash-latest': true });

    MODELS.forEach(async (model) => {
      const startTime = Date.now();
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

        const chatHistoryForModel = newHistories[model]
            .filter(msg => !msg.error)
            .map(({ role, parts }) => ({ role, parts }));
        
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: model,
            contents: chatHistoryForModel,
        });

        const duration = Date.now() - startTime;
        const inputTokens = response.usageMetadata?.promptTokenCount ?? 0;
        const outputTokens = response.usageMetadata?.candidatesTokenCount ?? 0;
        const pricing = MODEL_PRICING[model];
        const turnCost = (inputTokens / 1_000_000 * pricing.input) + (outputTokens / 1_000_000 * pricing.output);
        
        const newTotalSessionTokens = totalSessionTokens[model] + inputTokens + outputTokens;
        setTotalSessionTokens(prev => ({ ...prev, [model]: newTotalSessionTokens }));

        // Add data for chart
        setTokenHistories(prev => ({ ...prev, [model]: [...prev[model], newTotalSessionTokens] }));

        const modelMessage: Message = {
          role: 'model',
          parts: [{ text: response.text ?? "No response text found." }],
          timestamp: new Date().toISOString(),
          rawResponse: response,
          metrics: {
            duration,
            inputTokens,
            outputTokens,
            turnCost,
            totalSessionTokens: newTotalSessionTokens,
          },
        };

        setHistories(prev => ({ ...prev, [model]: [...prev[model], modelMessage] }));

      } catch (error) {
        console.error(`Error with ${MODEL_NAMES[model]}:`, error);
        const errorMessage: Message = {
          role: 'model',
          parts: [{ text: `An error occurred: ${error instanceof Error ? error.message : String(error)}` }],
          timestamp: new Date().toISOString(),
          error: String(error),
        };
        setHistories(prev => ({ ...prev, [model]: [...prev[model], errorMessage] }));
      } finally {
        setLoadingStates(prev => ({ ...prev, [model]: false }));
      }
    });
  }, [prompt, histories, totalSessionTokens]);

  // Effect to update charts
  useEffect(() => {
    const updateChart = (
      modelType: Model, 
      chartRef: React.RefObject<HTMLCanvasElement>, 
      instanceRef: React.MutableRefObject<any>
    ) => {
      const history = tokenHistories[modelType];
      if (!chartRef.current || !window.Chart) return;
      
      const labels = history.map((_, i) => `Turn ${i + 1}`);
      const data = history;
      
      if (instanceRef.current) {
        // Update existing chart
        instanceRef.current.data.labels = labels;
        instanceRef.current.data.datasets[0].data = data;
        instanceRef.current.update();
      } else {
        // Create new chart
        const ctx = chartRef.current.getContext('2d');
        if (!ctx) return;
        instanceRef.current = new window.Chart(ctx, {
          type: 'line',
          data: {
            labels,
            datasets: [{
              label: 'Total Session Tokens',
              data,
              // FIX: Update model name to gemini-3-pro-preview as per Gemini API guidelines.
              borderColor: modelType === 'gemini-3-pro-preview' ? '#3b82f6' : '#10b981',
              // FIX: Update model name to gemini-3-pro-preview as per Gemini API guidelines.
              backgroundColor: modelType === 'gemini-3-pro-preview' ? 'rgba(59, 130, 246, 0.5)' : 'rgba(16, 185, 129, 0.5)',
              tension: 0.2,
              fill: true,
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: false
              }
            },
            scales: {
              y: { beginAtZero: true, ticks: { maxTicksLimit: 5, color: '#9ca3af' }, grid: { color: 'rgba(75, 85, 99, 0.5)' } },
              x: { ticks: { maxTicksLimit: 10, autoSkip: true, color: '#9ca3af' }, grid: { color: 'rgba(75, 85, 99, 0.5)' } }
            }
          }
        });
      }
    };

    // FIX: Update model name to gemini-3-pro-preview as per Gemini API guidelines.
    updateChart('gemini-3-pro-preview', proChartRef, proChartInstanceRef);
    updateChart('gemini-flash-latest', flashChartRef, flashChartInstanceRef);

  }, [tokenHistories]);


  if (showWelcomeScreen) {
    return <WelcomeScreen onEnter={() => setShowWelcomeScreen(false)} />;
  }

  const isLoading = Object.values(loadingStates).some(s => s);

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-gray-100">
      <header className="p-4 border-b border-gray-700 shadow-md bg-gray-800/50 backdrop-blur-sm flex justify-between items-center flex-shrink-0">
        <div className="w-1/3"></div>
        <h1 className="text-xl md:text-2xl font-bold text-center text-white w-1/3">LLM Demystifier</h1>
        <div className="w-1/3 flex justify-end">
            <button
                onClick={() => setIsAnalyticsVisible(true)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-md transition-colors duration-300"
            >
                Analytics
            </button>
        </div>
      </header>

      {/* Visualization Section - Desktop Only */}
      <div className="hidden md:grid grid-cols-2 gap-4 p-4 border-b border-gray-700 bg-gray-800/60">
        <div>
          <h2 className="text-lg font-semibold text-center mb-2">Gemini Pro: Token Usage</h2>
          <div className="relative h-40">
            <canvas ref={proChartRef}></canvas>
          </div>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-center mb-2">Gemini Flash: Token Usage</h2>
          <div className="relative h-40">
            <canvas ref={flashChartRef}></canvas>
          </div>
        </div>
      </div>
      
      {/* Desktop View: 2-column grid */}
      <main className="hidden md:grid flex-1 grid-cols-1 md:grid-cols-2 gap-4 p-4 overflow-hidden min-h-0">
        {MODELS.map((model) => (
          <div key={model} className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden flex flex-col min-h-0">
            <ChatColumn
              model={model}
              history={histories[model]}
              isLoading={loadingStates[model]}
            />
          </div>
        ))}
      </main>

      {/* Mobile View: Tabbed interface */}
      <main className="flex md:hidden flex-col flex-1 overflow-hidden min-h-0">
        <div className="flex border-b border-gray-700 sticky top-0 bg-gray-900 z-10">
          {MODELS.map(model => (
            <button
              key={model}
              onClick={() => setActiveMobileModel(model)}
              className={`flex-1 p-3 text-sm font-semibold transition-colors duration-200 ${
                activeMobileModel === model 
                ? 'text-white border-b-2 border-blue-500 bg-gray-800' 
                : 'text-gray-400 hover:bg-gray-800/50'
              }`}
            >
              {MODEL_NAMES[model]}
            </button>
          ))}
        </div>
        <div className="flex-1 overflow-hidden min-h-0">
           <ChatColumn
              model={activeMobileModel}
              history={histories[activeMobileModel]}
              isLoading={loadingStates[activeMobileModel]}
            />
        </div>
      </main>

      <footer className="p-4 border-t border-gray-700 bg-gray-900 flex-shrink-0">
        <PromptInput
          prompt={prompt}
          setPrompt={setPrompt}
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </footer>
      {isAnalyticsVisible && (
        <AnalyticsView 
            histories={histories}
            onClose={() => setIsAnalyticsVisible(false)}
        />
      )}
    </div>
  );
};

export default App;