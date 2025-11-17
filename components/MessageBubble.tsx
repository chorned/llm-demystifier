import React, { useState, useEffect, useMemo, useRef, useLayoutEffect, useCallback, forwardRef } from 'react';
import { Message, Model, Explanation } from '../types';
import { API_EXPLANATIONS } from '../constants';

declare global {
  interface Window {
    marked: {
      parse: (markdown: string, options?: object) => string;
    };
    DOMPurify: {
      sanitize: (html: string) => string;
    };
  }
}

const useTypingEffect = (text: string, speed = 15) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    setDisplayedText('');
    setIsDone(false);

    if (!text) {
      setIsDone(true);
      return;
    }

    let i = 0;
    const intervalId = setInterval(() => {
      if (i < text.length) {
        // Set the text to the substring of the full text.
        // This is more robust and prevents appending characters from multiple sources
        // if a race condition were to occur.
        setDisplayedText(text.substring(0, i + 1));
        i++;
      } else {
        clearInterval(intervalId);
        setIsDone(true);
      }
    }, speed);

    // The cleanup function is crucial to prevent memory leaks and race conditions.
    return () => {
      clearInterval(intervalId);
    };
  }, [text, speed]);

  return { displayedText, isDone };
};


const AnimatedMetric: React.FC<{ label: string; finalValue: number; formatter: (val: number) => string; duration?: number; }> = ({ label, finalValue, formatter, duration = 1000 }) => {
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
        let startTime: number | null = null;
        let animationFrameId: number;
        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            const easedProgress = 1 - Math.pow(1 - progress, 3); // easeOutCubic
            setDisplayValue(easedProgress * finalValue);
            if (progress < 1) {
                animationFrameId = requestAnimationFrame(animate);
            } else {
                setDisplayValue(finalValue);
            }
        };
        animationFrameId = requestAnimationFrame(animate);
        
        return () => {
            cancelAnimationFrame(animationFrameId);
        }
    }, [finalValue, duration]);
    
    return (
        <div className="text-center">
            <div className="font-mono text-2xl font-bold text-blue-300 tabular-nums">
                {formatter(displayValue)}
            </div>
            <div className="text-xs text-gray-400 mt-1">{label}</div>
        </div>
    );
};

const TokenBar: React.FC<{ input: number; output: number; }> = ({ input, output }) => {
    const total = input + output;
    const inputPct = total > 0 ? (input / total) * 100 : 0;
    const outputPct = total > 0 ? (output / total) * 100 : 0;
    
    return (
        <div>
            <div className="text-sm font-semibold mb-2">Tokens</div>
            <div className="flex w-full h-3 bg-gray-700 rounded-full overflow-hidden mb-1">
                <div className="bg-green-500 transition-all duration-500" style={{ width: `${inputPct}%` }}></div>
                <div className="bg-purple-500 transition-all duration-500" style={{ width: `${outputPct}%` }}></div>
            </div>
            <div className="flex justify-between text-xs text-gray-400">
                <span><span className="text-green-400">●</span> Input: {input}</span>
                <span><span className="text-purple-400">●</span> Output: {output}</span>
            </div>
        </div>
    );
};

const useMediaQuery = (query: string) => {
    const [matches, setMatches] = useState(window.matchMedia(query).matches);

    useEffect(() => {
        const media = window.matchMedia(query);
        const listener = () => setMatches(media.matches);
        media.addEventListener('change', listener);
        return () => media.removeEventListener('change', listener);
    }, [query]);

    return matches;
};

const InteractiveApiView: React.FC<{ 
    data: object, 
    onInteract: (key: string | null, element: HTMLElement | null) => void,
    uniqueId: string,
    isMobile: boolean,
}> = ({ data, onInteract, uniqueId, isMobile }) => {
    const jsonString = JSON.stringify(data, null, 2);
    
    const highlightedJson = useMemo(() => {
        let tempJson = jsonString;
        API_EXPLANATIONS.forEach(exp => {
            const regex = new RegExp(`"${exp.key}":`, 'g');
            tempJson = tempJson.replace(regex, `<span class="api-key" data-key="${exp.key}">"${exp.key}"</span>:`);
        });
        return tempJson;
    }, [jsonString]);

    useEffect(() => {
        const container = document.getElementById(`api-container-${uniqueId}`);
        // On mobile, all click handling is done by a global listener in the parent MessageBubble.
        // This component only handles desktop hover events.
        if (!container || isMobile) return;

        const handleMouseOver = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (target.classList.contains('api-key')) {
                const key = target.dataset.key;
                if (key) onInteract(key, target);
            }
        };
        const handleMouseOut = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (target.classList.contains('api-key')) {
                onInteract(null, null);
            }
        };

        container.addEventListener('mouseover', handleMouseOver);
        container.addEventListener('mouseout', handleMouseOut);
        
        return () => {
            container.removeEventListener('mouseover', handleMouseOver);
            container.removeEventListener('mouseout', handleMouseOut);
        };
    }, [onInteract, uniqueId, isMobile]);

    return (
        <div id={`api-container-${uniqueId}`}>
            <style>{`.api-key { cursor: pointer; color: #60a5fa; font-weight: 500; transition: color 0.2s; } .api-key:hover { color: #93c5fd; text-decoration: underline; }`}</style>
            <pre className="text-xs bg-gray-900/50 p-3 rounded-md custom-scrollbar overflow-auto h-full max-h-96 border border-gray-700">
                <code dangerouslySetInnerHTML={{ __html: highlightedJson }} />
            </pre>
        </div>
    );
};

interface MobileExplanationPopoverProps {
    explanation: Explanation;
    targetRect: DOMRect;
    containerRef: React.RefObject<HTMLDivElement>;
}

const MobileExplanationPopover = forwardRef<HTMLDivElement, MobileExplanationPopoverProps>(({ explanation, targetRect, containerRef }, ref) => {
    const [position, setPosition] = useState({ top: 0, left: 0, opacity: 0 });

    useLayoutEffect(() => {
        const containerRect = containerRef.current?.getBoundingClientRect();
        const popoverEl = (ref as React.RefObject<HTMLDivElement>)?.current;
        if (!containerRect || !popoverEl) return;

        let top = targetRect.top - containerRect.top - popoverEl.offsetHeight - 10; // 10px offset
        let left = targetRect.left - containerRect.left + targetRect.width / 2 - popoverEl.offsetWidth / 2;

        if (top < 0) {
            top = targetRect.bottom - containerRect.top + 10;
        }
        if (left < 5) left = 5;
        if (left + popoverEl.offsetWidth > containerRect.width) {
            left = containerRect.width - popoverEl.offsetWidth - 5;
        }

        setPosition({ top, left, opacity: 1 });
    }, [explanation, targetRect, containerRef, ref]);

    return (
        <div 
            ref={ref} 
            style={{ top: `${position.top}px`, left: `${position.left}px`, opacity: position.opacity }} 
            className="absolute z-20 w-64 p-3 bg-gray-950 border border-blue-500 rounded-lg shadow-xl transition-opacity duration-200"
            role="tooltip"
        >
            <p className="font-bold text-base text-blue-300 font-mono">{explanation.key}</p>
            <p className="text-gray-300 text-sm mt-1" dangerouslySetInnerHTML={{ __html: explanation.explanation }} />
        </div>
    );
});


const MessageBubble: React.FC<{ message: Message; model: Model }> = ({ message }) => {
  const isUser = message.role === 'user';
  const hasDetails = message.role === 'model' && (message.metrics || message.rawResponse);
  const [isDetailsVisible, setIsDetailsVisible] = useState(false);
  const [activeExplanation, setActiveExplanation] = useState<Explanation | null>(null);
  const [lineCoords, setLineCoords] = useState<{start: {x:number, y:number}, end: {x:number, y:number}} | null>(null);

  const interactiveViewRef = useRef<HTMLDivElement>(null);
  const explanationGuideRef = useRef<HTMLDivElement>(null);
  const mobilePopoverRef = useRef<HTMLDivElement>(null);
  
  const { displayedText, isDone } = useTypingEffect(message.parts.map(p => p.text).join(''));
  
  const isMobile = useMediaQuery('(max-width: 1023px)');
  const [mobileExplanation, setMobileExplanation] = useState<{ explanation: Explanation; targetRect: DOMRect } | null>(null);

  const bubbleClasses = isUser
    ? 'bg-blue-600 text-white self-end'
    : `bg-gray-700 text-gray-200 self-start ${message.error ? 'border border-red-500' : ''}`;
  
  const parsedContent = useMemo(() => {
    if (isUser || !window.marked || !window.DOMPurify) {
      return null;
    }
    const rawHtml = window.marked.parse(displayedText, { gfm: true, breaks: true });
    return window.DOMPurify.sanitize(rawHtml);
  }, [displayedText, isUser]);
  
  // Desktop-only hover handler
  const handleKeyInteract = useCallback((key: string | null, targetElement: HTMLElement | null) => {
    if (key && targetElement && interactiveViewRef.current && explanationGuideRef.current) {
        const explanation = API_EXPLANATIONS.find(exp => exp.key === key) || null;
        setActiveExplanation(explanation);

        const containerRect = interactiveViewRef.current.getBoundingClientRect();
        const keyRect = targetElement.getBoundingClientRect();
        const explanationRect = explanationGuideRef.current.getBoundingClientRect();

        const startX = keyRect.right - containerRect.left;
        const startY = keyRect.top + keyRect.height / 2 - containerRect.top;

        const endX = explanationRect.left - containerRect.left;
        const endY = explanationRect.top + explanationRect.height / 2 - containerRect.top;

        setLineCoords({ start: { x: startX, y: startY }, end: { x: endX, y: endY } });
    } else {
        setActiveExplanation(null);
        setLineCoords(null);
    }
  }, []);

  // Mobile-only global click handler
  useEffect(() => {
    if (!isMobile || !isDetailsVisible) return;

    const handleDocumentClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const apiKeyElement = target.closest('.api-key');

      // Case 1: An API key was tapped
      if (apiKeyElement) {
        const key = apiKeyElement.getAttribute('data-key');
        if (!key) return;

        // Toggle behavior: if the same key is tapped again, close the popover.
        if (mobileExplanation?.explanation.key === key) {
          setMobileExplanation(null);
          return;
        }
        
        // Otherwise, open the new explanation.
        const explanation = API_EXPLANATIONS.find(exp => exp.key === key);
        if (explanation) {
          setMobileExplanation({ 
            explanation, 
            targetRect: apiKeyElement.getBoundingClientRect() 
          });
        }
        return;
      }

      // Case 2: The popover itself was tapped, do nothing.
      if (mobilePopoverRef.current && mobilePopoverRef.current.contains(target)) {
        return;
      }

      // Case 3: The tap was outside an API key and the popover, so close it.
      setMobileExplanation(null);
    };

    document.addEventListener('mousedown', handleDocumentClick);
    return () => {
      document.removeEventListener('mousedown', handleDocumentClick);
    };
  }, [isMobile, isDetailsVisible, mobileExplanation]);


  const formatCostInCents = (val: number) => {
    if (val >= 1 || val === 0) {
        return val.toFixed(2);
    }
    return val.toFixed(4);
  };


  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`rounded-lg p-3 max-w-xl md:max-w-3xl transition-all duration-300 flex flex-col ${bubbleClasses}`}>
        <div>
            {isUser ? (
              <div className="whitespace-pre-wrap">{message.parts.map(p => p.text).join('')}</div>
            ) : (
                <>
                    <div 
                      className="prose-styles"
                      dangerouslySetInnerHTML={{ __html: parsedContent || '' }}
                    />
                    {!isDone && <span className="typing-cursor"></span>}
                </>
            )}
        </div>
        {hasDetails && (
          <div className="mt-4 text-left">
            <button 
                onClick={() => setIsDetailsVisible(!isDetailsVisible)}
                className="text-xs text-gray-300 hover:text-white font-semibold py-1 px-3 rounded-md bg-gray-800/50 hover:bg-gray-800/80 border border-gray-600/50 transition-all"
            >
              {isDetailsVisible ? 'Hide Details' : 'Demystify this Call'}
            </button>
            <div 
                className="details-content mt-2"
                style={{ maxHeight: isDetailsVisible ? '1000px' : '0px', opacity: isDetailsVisible ? 1 : 0 }}
            >
                <div className="p-4 bg-gray-800/70 rounded-md border border-gray-600">
                    {message.metrics && (
                        <div className="mb-6">
                            <h4 className="text-base font-bold mb-4 text-white border-b border-gray-600 pb-2">Performance Metrics</h4>
                            <div className="flex justify-around items-start mb-6">
                               <AnimatedMetric label="Time to Generate" finalValue={message.metrics.duration} formatter={(val) => `${val.toFixed(0)} ms`} />
                               <AnimatedMetric label="Total Session Tokens" finalValue={message.metrics.totalSessionTokens} formatter={(val) => val.toFixed(0)} />
                               <AnimatedMetric 
                                    label="Turn Cost (¢)" 
                                    finalValue={message.metrics.turnCost * 100} 
                                    formatter={formatCostInCents} 
                                    duration={1200} 
                                />
                            </div>
                             <TokenBar input={message.metrics.inputTokens} output={message.metrics.outputTokens} />
                        </div>
                    )}
                    
                    <div ref={interactiveViewRef} className="relative grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {isMobile && mobileExplanation && (
                            <MobileExplanationPopover
                                ref={mobilePopoverRef}
                                explanation={mobileExplanation.explanation}
                                targetRect={mobileExplanation.targetRect}
                                containerRef={interactiveViewRef}
                            />
                        )}
                         <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-10" style={{ opacity: lineCoords && !isMobile ? 1 : 0, transition: 'opacity 0.2s' }}>
                            {lineCoords && (
                                <path 
                                    d={`M ${lineCoords.start.x} ${lineCoords.start.y} C ${lineCoords.start.x + 50} ${lineCoords.start.y}, ${lineCoords.end.x - 50} ${lineCoords.end.y}, ${lineCoords.end.x} ${lineCoords.end.y}`}
                                    stroke="#3b82f6" 
                                    strokeWidth="1.5" 
                                    fill="none" 
                                    className="connector-path"
                                />
                            )}
                        </svg>
                         <div className="lg:col-span-1">
                            <h4 className="text-base font-bold mb-2 text-white">Raw API Response</h4>
                            {message.rawResponse && <InteractiveApiView data={message.rawResponse} onInteract={handleKeyInteract} uniqueId={message.timestamp} isMobile={isMobile} />}
                         </div>
                         <div ref={explanationGuideRef} className="relative hidden lg:block flex flex-col">
                            <h4 className="text-base font-bold mb-2 text-white">Explanation Guide</h4>
                            <div className="p-3 bg-gray-900/50 rounded-md flex-grow min-h-[150px] lg:min-h-0 flex items-center justify-center transition-all duration-300 border border-gray-700">
                                {activeExplanation && !isMobile ? (
                                    <div className="space-y-2 text-sm fade-in-up">
                                        <p className="font-bold text-base text-blue-300 font-mono">{activeExplanation.key}</p>
                                        <p className="text-gray-300" dangerouslySetInnerHTML={{ __html: activeExplanation.explanation }} />
                                    </div>
                                ) : (
                                    <p className="text-gray-500 text-xs text-center">
                                        Hover over a key in the API response to learn more.
                                    </p>
                                )}
                            </div>
                         </div>
                    </div>
                </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;