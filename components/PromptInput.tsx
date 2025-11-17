import React, { useRef, useEffect, useCallback } from 'react';

interface PromptInputProps {
  prompt: string;
  setPrompt: (p: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

const SendIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
    </svg>
);

const PromptInput: React.FC<PromptInputProps> = ({ prompt, setPrompt, onSubmit, isLoading }) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const resizeTextarea = useCallback(() => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        textarea.style.height = 'auto'; // Temporarily shrink to get correct scrollHeight
        const scrollHeight = textarea.scrollHeight;
        const maxHeight = 200;

        if (scrollHeight > maxHeight) {
            textarea.style.height = `${maxHeight}px`;
            textarea.style.overflowY = 'auto';
        } else {
            textarea.style.height = `${scrollHeight}px`;
            textarea.style.overflowY = 'hidden';
        }
    }, []);

    // Resize when prompt text changes
    useEffect(() => {
        resizeTextarea();
    }, [prompt, resizeTextarea]);

    // Resize on initial mount and when window size changes
    useEffect(() => {
        // Initial resize, with a slight delay to ensure layout is stable
        const timeoutId = setTimeout(resizeTextarea, 1);
        window.addEventListener('resize', resizeTextarea);

        return () => {
            clearTimeout(timeoutId);
            window.removeEventListener('resize', resizeTextarea);
        };
    }, [resizeTextarea]);


    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (!isLoading) {
                onSubmit();
            }
        }
    };

    return (
        <div className="max-w-4xl mx-auto w-full">
            <div className="relative flex items-end bg-gray-800 border border-gray-700 rounded-lg shadow-sm">
                <textarea
                    ref={textareaRef}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your prompt here..."
                    rows={1}
                    className="w-full bg-transparent p-3 pr-12 text-gray-100 placeholder-gray-400 resize-none focus:outline-none custom-scrollbar"
                    disabled={isLoading}
                    style={{ minHeight: '48px', overflowY: 'hidden' }}
                />
                <button
                    onClick={onSubmit}
                    disabled={isLoading || !prompt.trim()}
                    className="absolute right-2 bottom-2 p-2 rounded-full text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                    aria-label="Submit prompt"
                >
                    <SendIcon className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};

export default PromptInput;
