import React, { useEffect, useRef } from 'react';
import { Message, Model } from '../types';
import { MODEL_NAMES } from '../constants';

// FIX: Augment the Window interface to include Chart.js properties for TypeScript
declare global {
  interface Window {
    Chart: any;
    ChartZoom: any;
  }
}

// Since we are using CDNs, Chart and ChartZoom are available on the window object.
// We need to register the zoom plugin with Chart.js and set defaults for our theme.
// This block runs once when the module is first loaded.
if (window.Chart && window.ChartZoom) {
  window.Chart.register(window.ChartZoom);
  // Set default styles for dark mode
  window.Chart.defaults.color = '#e5e7eb'; // text-gray-200
  window.Chart.defaults.borderColor = 'rgba(75, 85, 99, 0.8)'; // bg-gray-600 with opacity
  window.Chart.defaults.plugins.legend.position = 'top';
} else {
    console.error("Chart.js or Chart.js Zoom plugin not loaded. Make sure the CDN links are in index.html.");
}

interface AnalyticsViewProps {
  histories: Record<Model, Message[]>;
  onClose: () => void;
}

const ChartCard: React.FC<{ title: string, chartRef: React.RefObject<HTMLCanvasElement> }> = ({ title, chartRef }) => (
    <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 flex flex-col">
        <h3 className="text-lg font-semibold mb-3 text-center">{title}</h3>
        <div className="relative flex-1" style={{ minHeight: '250px' }}>
            <canvas ref={chartRef}></canvas>
        </div>
    </div>
);

const AnalyticsView: React.FC<AnalyticsViewProps> = ({ histories, onClose }) => {
  const tokensChartRef = useRef<HTMLCanvasElement>(null);
  const timeChartRef = useRef<HTMLCanvasElement>(null);
  const costChartRef = useRef<HTMLCanvasElement>(null);
  const chartInstancesRef = useRef<any[]>([]);

  useEffect(() => {
    // Destroy previous chart instances on re-render to prevent memory leaks
    chartInstancesRef.current.forEach(instance => instance.destroy());
    chartInstancesRef.current = [];

    const proHistory = histories['gemini-2.5-pro'].filter(m => m.role === 'model' && m.metrics);
    const flashHistory = histories['gemini-flash-latest'].filter(m => m.role === 'model' && m.metrics);

    const numTurns = Math.min(proHistory.length, flashHistory.length);
    if (numTurns === 0) return;

    const labels = Array.from({ length: numTurns }, (_, i) => `Turn ${i + 1}`);

    const datasets = {
        tokens: [
            { label: MODEL_NAMES['gemini-2.5-pro'], data: proHistory.map(m => m.metrics!.inputTokens + m.metrics!.outputTokens), borderColor: '#3b82f6', backgroundColor: '#3b82f6_80', tension: 0.1 },
            { label: MODEL_NAMES['gemini-flash-latest'], data: flashHistory.map(m => m.metrics!.inputTokens + m.metrics!.outputTokens), borderColor: '#10b981', backgroundColor: '#10b981_80', tension: 0.1 },
        ],
        time: [
            { label: MODEL_NAMES['gemini-2.5-pro'], data: proHistory.map(m => m.metrics!.duration), borderColor: '#3b82f6', backgroundColor: '#3b82f6_80', tension: 0.1 },
            { label: MODEL_NAMES['gemini-flash-latest'], data: flashHistory.map(m => m.metrics!.duration), borderColor: '#10b981', backgroundColor: '#10b981_80', tension: 0.1 },
        ],
        cost: [
            { label: MODEL_NAMES['gemini-2.5-pro'], data: proHistory.map(m => m.metrics!.turnCost * 100), borderColor: '#3b82f6', backgroundColor: '#3b82f6_80', tension: 0.1 },
            { label: MODEL_NAMES['gemini-flash-latest'], data: flashHistory.map(m => m.metrics!.turnCost * 100), borderColor: '#10b981', backgroundColor: '#10b981_80', tension: 0.1 },
        ],
    };

    const createChart = (canvasRef: React.RefObject<HTMLCanvasElement>, data: any, yAxisLabel: string) => {
        if (!canvasRef.current || !window.Chart) return null;
        const ctx = canvasRef.current.getContext('2d');
        if (!ctx) return null;

        return new window.Chart(ctx, {
            type: 'line',
            data: { labels, datasets: data },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: { mode: 'index', intersect: false },
                scales: { y: { beginAtZero: true, title: { display: true, text: yAxisLabel } } },
                plugins: {
                    zoom: {
                        pan: { enabled: false },
                        zoom: { wheel: { enabled: false }, pinch: { enabled: false } },
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => `${context.dataset.label}: ${context.formattedValue} ${yAxisLabel.toLowerCase()}`
                        }
                    }
                }
            }
        });
    };
    
    chartInstancesRef.current.push(createChart(tokensChartRef, datasets.tokens, 'Tokens'));
    chartInstancesRef.current.push(createChart(timeChartRef, datasets.time, 'Milliseconds'));
    chartInstancesRef.current.push(createChart(costChartRef, datasets.cost, 'US Cents'));

    // Cleanup on unmount
    return () => {
        chartInstancesRef.current.forEach(instance => instance?.destroy());
    };

  }, [histories]);

  const hasData = histories['gemini-2.5-pro'].some(m => m.role === 'model' && m.metrics);

  return (
    <div className="fixed inset-0 bg-gray-900/90 backdrop-blur-sm z-50 flex flex-col p-4 md:p-8" aria-modal="true" role="dialog">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-white">Conversation Analytics</h2>
        <button onClick={onClose} className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors" aria-label="Close Analytics">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      {hasData ? (
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 overflow-y-auto custom-scrollbar">
            <ChartCard title="Tokens Used per Turn" chartRef={tokensChartRef} />
            <ChartCard title="Response Time per Turn" chartRef={timeChartRef} />
            <ChartCard title="Estimated Cost per Turn" chartRef={costChartRef} />
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-gray-800 rounded-lg">
            <p className="text-gray-400 text-lg">Complete at least one turn in the conversation to view analytics.</p>
        </div>
      )}
    </div>
  );
};

export default AnalyticsView;