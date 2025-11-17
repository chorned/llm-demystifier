import { Model, Explanation } from './types';

export const MODELS: Model[] = ['gemini-2.5-pro', 'gemini-flash-latest'];

export const MODEL_NAMES: Record<Model, string> = {
  'gemini-2.5-pro': 'Gemini Pro',
  'gemini-flash-latest': 'Gemini Flash',
};

// Pricing per 1 million tokens
export const MODEL_PRICING: Record<Model, { input: number; output: number }> = {
  'gemini-2.5-pro': {
    input: 0.50, // $0.50 / 1M tokens
    output: 1.50, // $1.50 / 1M tokens
  },
  'gemini-flash-latest': {
    input: 0.35, // $0.35 / 1M tokens
    output: 1.05, // $1.05 / 1M tokens
  },
};

export const API_EXPLANATIONS: Explanation[] = [
  { key: 'sdkHttpResponse', explanation: "Contains metadata about the raw HTTP response received by the SDK, such as headers. This is useful for debugging network-level issues." },
  { key: 'headers', explanation: "The HTTP headers returned by the server with the API response. These can provide additional context for debugging, such as content type and date." },
  { key: 'alt-svc', explanation: "Alternative-Service header. Indicates that the resource could be accessed in another way (e.g., over a different protocol like HTTP/3), which can improve performance." },
  { key: 'content-type', explanation: "Indicates the media type of the resource. For Gemini API, this is typically 'application/json'." },
  { key: 'date', explanation: "The date and time at which the message was originated." },
  { key: 'ratelimit-limit', explanation: "The maximum number of requests that are permitted in the current time window." },
  { key: 'ratelimit-policy', explanation: "Describes the quota policy. For example, '100;w=900' means 100 requests per 900-second window." },
  { key: 'ratelimit-remaining', explanation: "The number of requests remaining in the current time window." },
  { key: 'ratelimit-reset', explanation: "The remaining time in seconds until the rate limit window resets." },
  { key: 'server', explanation: "Information about the server software used by the origin server. Often 'Google Frontend'." },
  { key: 'server-timing', explanation: "Communicates one or more metrics and descriptions for the given request-response cycle. Used for performance monitoring." },
  { key: 'vary', explanation: "Determines how to match future request headers to decide whether a cached response can be used. It indicates which headers were used to select a representation of the resource." },
  { key: 'x-content-type-options', explanation: "A security feature that prevents the browser from MIME-sniffing a response away from the declared content-type. 'nosniff' is the standard value." },
  { key: 'x-frame-options', explanation: "A security feature to indicate whether a browser should be allowed to render a page in a `<frame>`, `<iframe>`, `<embed>`, or `<object>`. 'SAMEORIGIN' prevents clickjacking attacks." },
  { key: 'x-powered-by', explanation: "May be set by hosting environments or frameworks. Often used for statistics and tracking." },
  { key: 'x-xss-protection', explanation: "A feature of Internet Explorer, Chrome, and Safari that stops pages from loading when they detect reflected cross-site scripting (XSS) attacks. '0' disables it, as modern browsers use Content Security Policy (CSP) instead." },
  { key: 'candidates', explanation: "An array of possible responses from the model. Usually contains just one candidate." },
  { key: 'content', explanation: "A container for the message content, holding 'parts' and 'role'." },
  { key: 'parts', explanation: "An array of content chunks. The text response is inside parts[0].text." },
  { key: 'role', explanation: "Indicates who sent the message ('user' or 'model')." },
  { key: 'responseId', explanation: "A unique identifier for this specific API response, useful for tracking and debugging." },
  { key: 'modelVersion', explanation: "The full version string of the model used for this response, including the preview date.", isMetadata: true },
  { key: 'finishReason', explanation: "The reason the model stopped generating. 'STOP' is a normal completion. 'MAX_TOKENS' means it hit the token limit. 'SAFETY' means the response was blocked.", isMetadata: true },
  { key: 'index', explanation: "The index of this candidate in the 'candidates' array. Usually 0.", isMetadata: true },
  { key: 'safetyRatings', explanation: "The content safety check results from Google for various categories.", isMetadata: true },
  { key: 'usageMetadata', explanation: "An object containing detailed token usage for the request. You are charged for input ('prompt') and output ('candidate') tokens. 'Thoughts' tokens are free." },
  { key: 'promptTokenCount', explanation: "The number of tokens in your prompt, displayed as 'Input Tokens' in the metrics. You are **charged** for these tokens." },
  { key: 'candidatesTokenCount', explanation: "The number of tokens in the model's generated response. This value is displayed as 'Output Tokens' in the metrics, and you are **charged** for them. Note: For billing, this count excludes any 'thoughts' tokens." },
  { key: 'totalTokenCount', explanation: "The sum of prompt and candidate tokens for the turn. This represents the total number of tokens you are **charged** for." },
  { key: 'promptTokensDetails', explanation: "A detailed breakdown of prompt tokens by modality (e.g., text, image). This is for information only and does not represent an additional charge." },
  { key: 'modality', explanation: "The type of content in the prompt (e.g., 'TEXT', 'IMAGE').", isMetadata: true },
  { key: 'tokenCount', explanation: "The number of tokens for a specific modality in the prompt.", isMetadata: true },
  { key: 'thoughtsTokenCount', explanation: "Number of tokens used for internal model reasoning. These are provided for transparency into the model's process and are **not billed** (they are free).", isMetadata: true },
];

// Base64 encoded version of 'GreatPassword!'
export const CORRECT_PASSWORD_B64 = 'R3JlYXRQYXNzd29yZCE=';