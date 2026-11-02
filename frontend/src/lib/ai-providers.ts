// Unified AI Provider Engine for Antigravity E-Learning Platform
// Supports:
// 1. Google Gemini (Gemini 2.5 Flash / Gemini 2.5 Pro) — Free tier with high rate limits
// 2. Groq Cloud (GPT-OSS 120B / GPT-OSS 20B / Qwen 27B) — Ultra-fast LPU inference
// 3. OpenAI (GPT-4o / GPT-4o-mini) — Paid tier

export type AiProvider = 'gemini' | 'openai' | 'groq';

export interface AvailableModel {
  id: string;
  name: string;
  provider: AiProvider;
  description: string;
  badge: string;
  speed: string;
}

export const AVAILABLE_MODELS: AvailableModel[] = [
  // Google Gemini
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    provider: 'gemini',
    description: 'Ultra-fast, 1M context window, ideal for long lectures',
    badge: '100% Free',
    speed: 'Fast (~7s)',
  },
  {
    id: 'gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    provider: 'gemini',
    description: 'Deep reasoning, advanced exam problem breakdown',
    badge: 'Deep Reasoning',
    speed: 'Comprehensive',
  },
  // Groq Cloud
  {
    id: 'openai/gpt-oss-120b',
    name: 'GPT-OSS 120B (Groq)',
    provider: 'groq',
    description: 'Flagship 120B open architecture running on Groq LPUs',
    badge: 'Groq 120B',
    speed: 'Ultra-Fast (0.3s)',
  },
  {
    id: 'openai/gpt-oss-20b',
    name: 'GPT-OSS 20B (Groq)',
    provider: 'groq',
    description: 'Lightweight high-efficiency model on Groq',
    badge: 'Instant LPU',
    speed: 'Sub-second',
  },
  {
    id: 'qwen/qwen3.8-27b',
    name: 'Qwen 3.8 27B (Groq)',
    provider: 'groq',
    description: 'Specialized in computer engineering, math, and code',
    badge: 'Coding Specialist',
    speed: 'Ultra-Fast',
  },
  // OpenAI
  {
    id: 'gpt-4o',
    name: 'OpenAI GPT-4o',
    provider: 'openai',
    description: 'Flagship multimodal intelligence (requires paid balance)',
    badge: 'Paid Quota',
    speed: 'Standard',
  },
  {
    id: 'gpt-4o-mini',
    name: 'OpenAI GPT-4o-mini',
    provider: 'openai',
    description: 'Cost-effective high speed model (requires paid balance)',
    badge: 'Paid Quota',
    speed: 'Fast',
  },
];

export interface AiRequestOptions {
  provider?: AiProvider;
  model?: string;
  apiKey?: string;
  systemPrompt?: string;
  userPrompt: string;
  jsonMode?: boolean;
  maxTokens?: number;
  temperature?: number;
}

export interface AiTestResult {
  success: boolean;
  provider: AiProvider;
  model: string;
  message: string;
  rawError?: string;
  quotaExhausted?: boolean;
  invalidKey?: boolean;
}

export function resolveAiConfig(overrideProvider?: AiProvider, overrideKey?: string): {
  provider: AiProvider;
  apiKey: string;
} {
  // 1. Explicit override passed in request
  if (overrideKey && overrideKey.trim()) {
    return {
      provider:
        overrideProvider ||
        (overrideKey.startsWith('AIza') || overrideKey.startsWith('AQ.')
          ? 'gemini'
          : overrideKey.startsWith('gsk_')
          ? 'groq'
          : 'openai'),
      apiKey: overrideKey.trim(),
    };
  }

  // 2. Check explicitly requested provider or environment in priority
  if (overrideProvider === 'groq' && process.env.GROQ_API_KEY) {
    return { provider: 'groq', apiKey: process.env.GROQ_API_KEY.trim() };
  }
  if (overrideProvider === 'gemini' && process.env.GEMINI_API_KEY) {
    return { provider: 'gemini', apiKey: process.env.GEMINI_API_KEY.trim() };
  }
  if (overrideProvider === 'openai' && process.env.OPENAI_API_KEY) {
    return { provider: 'openai', apiKey: process.env.OPENAI_API_KEY.trim() };
  }

  // Fallback environment check
  if (process.env.GEMINI_API_KEY) {
    return { provider: 'gemini', apiKey: process.env.GEMINI_API_KEY.trim() };
  }
  if (process.env.GROQ_API_KEY) {
    return { provider: 'groq', apiKey: process.env.GROQ_API_KEY.trim() };
  }
  if (process.env.OPENAI_API_KEY) {
    return { provider: 'openai', apiKey: process.env.OPENAI_API_KEY.trim() };
  }

  return { provider: 'gemini', apiKey: '' };
}

// ─── Call AI with transparent error propagation ──────────────────────────────
export async function callAi(options: AiRequestOptions): Promise<string> {
  const { provider, apiKey } = resolveAiConfig(options.provider, options.apiKey);

  if (!apiKey) {
    throw new Error(
      `No API key configured for provider "${provider}". Please add an API key in Settings or .env.local (Google Gemini free key available at https://aistudio.google.com/app/apikey, Groq key at https://console.groq.com/keys).`
    );
  }

  if (provider === 'gemini') {
    return callGemini(apiKey, options);
  } else if (provider === 'groq') {
    return callGroq(apiKey, options);
  } else {
    return callOpenAi(apiKey, options);
  }
}

export function sanitizeModel(provider: AiProvider, requestedModel?: string): string {
  if (provider === 'gemini') {
    if (requestedModel && (requestedModel.startsWith('gemini') || requestedModel.startsWith('models/gemini'))) {
      return requestedModel.replace(/^models\//, '');
    }
    return 'gemini-2.5-flash';
  }

  if (provider === 'groq') {
    if (
      requestedModel &&
      (requestedModel.includes('gpt-oss') ||
        requestedModel.includes('qwen') ||
        requestedModel.includes('llama') ||
        requestedModel.includes('whisper') ||
        requestedModel.includes('allam'))
    ) {
      return requestedModel;
    }
    return 'openai/gpt-oss-120b';
  }

  // openai
  if (
    requestedModel &&
    (requestedModel.startsWith('gpt-') ||
      requestedModel.startsWith('o1') ||
      requestedModel.startsWith('o3') ||
      requestedModel.startsWith('o4'))
  ) {
    return requestedModel;
  }
  return 'gpt-4o-mini';
}

// ─── Google Gemini API ───────────────────────────────────────────────────────
async function callGemini(apiKey: string, options: AiRequestOptions): Promise<string> {
  const model = sanitizeModel('gemini', options.model);
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const body: any = {
    contents: [
      {
        role: 'user',
        parts: [{ text: `${options.systemPrompt ? `[SYSTEM INSTRUCTIONS]\n${options.systemPrompt}\n\n` : ''}${options.userPrompt}` }],
      },
    ],
    generationConfig: {
      temperature: options.temperature ?? 0.3,
      maxOutputTokens: options.maxTokens ?? 8192,
    },
  };

  if (options.jsonMode) {
    body.generationConfig.responseMimeType = 'application/json';
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    let parsed: any;
    try {
      parsed = JSON.parse(errText);
    } catch {
      parsed = null;
    }

    const errorMsg = parsed?.error?.message || errText;
    const errorCode = parsed?.error?.code || res.status;

    if (res.status === 400 && errorMsg.includes('API_KEY_INVALID')) {
      throw new Error(`Google Gemini Error: API Key is invalid. Check your key at https://aistudio.google.com/app/apikey`);
    }
    if (res.status === 429) {
      throw new Error(`Google Gemini Error 429: Rate limit exceeded. Please wait a moment or check your quota.`);
    }

    throw new Error(`Google Gemini API Error (${errorCode}): ${errorMsg}`);
  }

  const data = await res.json();
  const candidate = data.candidates?.[0];
  if (!candidate || !candidate.content?.parts?.[0]?.text) {
    throw new Error('Google Gemini returned an empty response.');
  }

  return candidate.content.parts[0].text;
}

// ─── Groq API ───────────────────────────────────────────────────────────────
async function callGroq(apiKey: string, options: AiRequestOptions): Promise<string> {
  const model = sanitizeModel('groq', options.model);
  const url = 'https://api.groq.com/openai/v1/chat/completions';

  const messages: any[] = [];
  if (options.systemPrompt) {
    messages.push({ role: 'system', content: options.systemPrompt });
  }
  messages.push({ role: 'user', content: options.userPrompt });

  const body: any = {
    model,
    temperature: options.temperature ?? 0.3,
    max_tokens: options.maxTokens ?? 4096,
    messages,
  };

  if (options.jsonMode) {
    body.response_format = { type: 'json_object' };
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    let parsed: any;
    try {
      parsed = JSON.parse(errText);
    } catch {
      parsed = null;
    }

    const errorMsg = parsed?.error?.message || errText;
    throw new Error(`Groq API Error (${res.status}): ${errorMsg}`);
  }

  const data = await res.json();
  const choice = data.choices?.[0];
  const text = choice?.message?.content || choice?.message?.reasoning;
  if (!text) throw new Error('Groq returned an empty response.');
  return text;
}

// ─── OpenAI API ─────────────────────────────────────────────────────────────
async function callOpenAi(apiKey: string, options: AiRequestOptions): Promise<string> {
  const model = sanitizeModel('openai', options.model);
  const url = 'https://api.openai.com/v1/chat/completions';

  const messages: any[] = [];
  if (options.systemPrompt) {
    messages.push({ role: 'system', content: options.systemPrompt });
  }
  messages.push({ role: 'user', content: options.userPrompt });

  const body: any = {
    model,
    temperature: options.temperature ?? 0.3,
    max_tokens: options.maxTokens ?? 4096,
    messages,
  };

  if (options.jsonMode) {
    body.response_format = { type: 'json_object' };
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    let parsed: any;
    try {
      parsed = JSON.parse(errText);
    } catch {
      parsed = null;
    }

    const errorObj = parsed?.error;
    const errorCode = errorObj?.code;
    const errorMessage = errorObj?.message || errText;

    if (res.status === 429 || errorCode === 'credit_balance_exhausted' || errorCode === 'insufficient_quota') {
      throw new Error(
        `OpenAI Error 429 (credit_balance_exhausted): Your OpenAI account has $0.00 credits remaining. Please add credits at https://platform.openai.com/settings/organization/billing/ or switch to Google Gemini (Free) or Groq in Settings.`
      );
    }
    if (res.status === 401) {
      throw new Error(`OpenAI Error 401: Invalid API key. Please check your key at https://platform.openai.com/api-keys`);
    }

    throw new Error(`OpenAI API Error (${res.status}): ${errorMessage}`);
  }

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error('OpenAI returned an empty response.');
  return text;
}

// ─── Direct Diagnostic Tester ────────────────────────────────────────────────
export async function testAiConnection(
  provider: AiProvider,
  apiKey: string,
  model?: string
): Promise<AiTestResult> {
  const trimmedKey = apiKey.trim();
  if (!trimmedKey) {
    return {
      success: false,
      provider,
      model: model || 'none',
      message: 'API key is empty. Please enter an API key.',
      invalidKey: true,
    };
  }

  const effectiveModel = sanitizeModel(provider, model);

  try {
    const response = await callAi({
      provider,
      model: effectiveModel,
      apiKey: trimmedKey,
      userPrompt: 'Ping! Reply with the word "PONG" only.',
      maxTokens: 100,
    });

    return {
      success: true,
      provider,
      model: effectiveModel,
      message: `Successfully connected to ${provider.toUpperCase()} (${effectiveModel})! Response: "${response.trim()}"`,
    };
  } catch (err: any) {
    const message = err.message || String(err);
    const quotaExhausted =
      message.includes('credit_balance_exhausted') ||
      message.includes('insufficient_quota') ||
      message.includes('429');
    const invalidKey =
      message.includes('401') ||
      message.includes('API_KEY_INVALID') ||
      message.includes('Invalid API key');

    return {
      success: false,
      provider,
      model: effectiveModel,
      message,
      rawError: message,
      quotaExhausted,
      invalidKey,
    };
  }
}
