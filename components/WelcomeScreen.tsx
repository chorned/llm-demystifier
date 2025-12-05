import React from 'react';

interface WelcomeScreenProps {
  onEnter: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onEnter }) => {
  return (
    <div className="fixed inset-0 bg-gray-900 flex items-center justify-center z-50 p-4 animate-fadeIn">
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-in-out;
        }
      `}</style>
      <div className="bg-gray-800 p-8 rounded-lg shadow-2xl w-full max-w-3xl border border-gray-700">
        <h1 className="text-3xl font-bold mb-4 text-white text-center">LLM Demystifier</h1>
        
        <p className="text-gray-300 mb-6 text-lg text-center leading-relaxed">
          This app helps you build an intuition for how conversational agents increase their token usage over time. The App also makes it transparent what happens in each API call, and explains all the parameters in the response message.
        </p>
        
        <div className="my-8 border-t border-gray-700"></div>

        <div className="flex flex-col md:flex-row justify-center items-center gap-4 md:gap-8 mb-8">
            <a href="https://horned.se" target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"></path>
              </svg>
              My Portfolio
            </a>
            <a href="https://github.com/chorned" target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z"/>
              </svg>
              My Github
            </a>
            <a href="https://www.linkedin.com/in/carlhorned/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
              </svg>
              My LinkedIn
            </a>
        </div>

        <div className="text-center mb-8">
             <a href="https://ko-fi.com/chorned" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-400 hover:underline">Hosting these projects isn't free, a donation is appreciated.</a>
        </div>

        <button
          onClick={onEnter}
          className="w-full max-w-xs mx-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-md transition duration-300 text-lg flex items-center justify-center"
        >
          Open App
        </button>
      </div>
    </div>
  );
};

export default WelcomeScreen;