
import { GenerateContentResponse } from "@google/genai";

// FIX: Update model name to gemini-3-pro-preview as per Gemini API guidelines.
export type Model = 'gemini-3-pro-preview' | 'gemini-flash-latest';

export interface Metrics {
  duration: number;
  inputTokens: number;
  outputTokens: number;
  turnCost: number;
  totalSessionTokens: number;
}

export interface Message {
  role: 'user' | 'model';
  parts: { text: string }[];
  timestamp: string;
  metrics?: Metrics;
  rawResponse?: GenerateContentResponse;
  error?: string;
}

export interface Explanation {
  key: string;
  explanation: string;
  isMetadata?: boolean;
}