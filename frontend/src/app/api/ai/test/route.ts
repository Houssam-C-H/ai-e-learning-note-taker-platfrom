import { NextResponse } from 'next/server';
import { testAiConnection, AiProvider, AVAILABLE_MODELS } from '@/lib/ai-providers';

export async function GET() {
  return NextResponse.json({
    models: AVAILABLE_MODELS,
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const provider: AiProvider = body.provider || 'gemini';
    const model: string = body.model || undefined;
    const apiKey: string = body.apiKey || body.api_key || undefined;

    const result = await testAiConnection(provider, apiKey, model);
    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        provider: 'unknown',
        model: 'unknown',
        message: err.message || 'AI test failed',
      },
      { status: 500 }
    );
  }
}
