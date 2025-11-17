
import { GenerateContentResponse } from "@google/genai";

export type Model = 'gemini-2.5-pro' | 'gemini-flash-latest';

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
