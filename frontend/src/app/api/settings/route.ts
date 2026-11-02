import { NextResponse } from 'next/server';
import { resolveAiConfig, AiProvider, AVAILABLE_MODELS } from '@/lib/ai-providers';

// In-memory runtime settings cache
let runtimeSettings = {
  provider: (process.env.GEMINI_API_KEY ? 'gemini' : process.env.GROQ_API_KEY ? 'groq' : 'openai') as AiProvider,
  model: 'gemini-2.5-flash',
  apiKey: process.env.GEMINI_API_KEY || process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY || '',
  bbbBaseUrl: process.env.BBB_BASE_URL || 'https://visioconference.supmti.ac.ma',
  whisperModel: 'base',
  defaultLanguage: 'multilingual',
};

export async function GET() {
  const current = resolveAiConfig(runtimeSettings.provider, runtimeSettings.apiKey);
  return NextResponse.json({
    provider: current.provider,
    model: runtimeSettings.model,
    has_key: Boolean(current.apiKey),
    key_preview: current.apiKey ? `${current.apiKey.slice(0, 7)}...${current.apiKey.slice(-4)}` : '',
    bbb_base_url: runtimeSettings.bbbBaseUrl,
    whisper_model: runtimeSettings.whisperModel,
    default_language: runtimeSettings.defaultLanguage,
    available_models: AVAILABLE_MODELS,
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (body.provider) runtimeSettings.provider = body.provider;
    if (body.model) runtimeSettings.model = body.model;
    if (body.apiKey !== undefined) runtimeSettings.apiKey = body.apiKey;
    if (body.bbbBaseUrl) runtimeSettings.bbbBaseUrl = body.bbbBaseUrl;
    if (body.whisperModel) runtimeSettings.whisperModel = body.whisperModel;
    if (body.defaultLanguage) runtimeSettings.defaultLanguage = body.defaultLanguage;

    // Update process.env for the active provider if set
    if (body.apiKey) {
      if (runtimeSettings.provider === 'gemini') {
        process.env.GEMINI_API_KEY = body.apiKey;
      } else if (runtimeSettings.provider === 'groq') {
        process.env.GROQ_API_KEY = body.apiKey;
      } else {
        process.env.OPENAI_API_KEY = body.apiKey;
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Settings updated successfully.',
      provider: runtimeSettings.provider,
      model: runtimeSettings.model,
    });
  } catch (err: any) {
    return NextResponse.json({ detail: err.message || 'Failed to update settings' }, { status: 400 });
  }
}
