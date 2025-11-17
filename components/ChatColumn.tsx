import React, { useRef, useEffect } from 'react';
import { Model, Message } from '../types';
import { MODEL_NAMES } from '../constants';
import MessageBubble from './MessageBubble';

interface ChatColumnProps {
  model: Model;
  history: Message[];
  isLoading: boolean;
}

const LoadingIndicator: React.FC = () => (
    <div className="flex items-center space-x-2 animate-pulse">
        <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
        <div className="w-2 h-2 bg-gray-500 rounded-full animation-delay-200"></div>
        <div className="w-2 h-2 bg-gray-500 rounded-full animation-delay-400"></div>
    </div>
);

const ChatColumn: React.FC<ChatColumnProps> = ({ model, history, isLoading }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history, isLoading]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <h2 className="text-xl font-semibold p-4 border-b border-gray-700 text-center text-white bg-gray-800/80 backdrop-blur-sm sticky top-0 z-10">
        {MODEL_NAMES[model]}
      </h2>
      <div ref={scrollRef} className="flex-1 p-4 space-y-4 overflow-y-auto custom-scrollbar">
        {history.map((message) => (
          <MessageBubble key={message.timestamp} message={message} model={model} />
        ))}
        {isLoading && (
            <div className="flex justify-start">
                <div className="bg-gray-700 rounded-lg p-3 max-w-lg">
                    <LoadingIndicator />
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default ChatColumn;