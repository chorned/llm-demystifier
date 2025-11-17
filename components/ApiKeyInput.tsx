
import React, { useState, useEffect } from 'react';

interface ApiKeyInputProps {
  apiKey: string;
  onSave: (key: string) => void;
}

const ApiKeyInput: React.FC<ApiKeyInputProps> = ({ apiKey, onSave }) => {
  const [localApiKey, setLocalApiKey] = useState(apiKey);
  const [isSaved, setIsSaved] = useState(!!apiKey);

  useEffect(() => {
    setLocalApiKey(apiKey);
    setIsSaved(!!apiKey);
  }, [apiKey]);

  const handleSave = () => {
    onSave(localApiKey);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="mt-4 max-w-xl mx-auto">
      <div className="flex items-center gap-2">
        <input
          type="password"
          value={localApiKey}
          onChange={(e) => {
            setLocalApiKey(e.target.value);
            setIsSaved(false);
          }}
          placeholder="Enter your Google AI API Key"
          className="flex-grow px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleSave}
          className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors duration-300 ${
            isSaved ? 'bg-green-600' : 'bg-blue-600 hover:bg-blue-700'
          } text-white`}
        >
          {isSaved ? 'Saved!' : 'Save'}
        </button>
      </div>
    </div>
  );
};

export default ApiKeyInput;
