import { NextResponse } from 'next/server';
import { db } from '@/lib/server-state';
import { callAi, resolveAiConfig, AiProvider } from '@/lib/ai-providers';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const query: string = body.question || body.query || body.message || '';
    const sessionId: string = body.session_id || '';
    const courseId: string = body.course_id || '';
    const provider: AiProvider = body.provider || undefined;
    const apiKey: string = body.api_key || body.apiKey || undefined;

    if (!query.trim()) {
      return NextResponse.json({ detail: 'Question cannot be empty' }, { status: 400 });
    }

    // 1. Gather context from current session or course
    let context = '';
    let targetSession = sessionId ? db.sessions.find((s) => s.id === sessionId) : undefined;
    let targetCourse = courseId
      ? db.courses.find((c) => c.id === courseId)
      : targetSession
      ? db.courses.find((c) => c.id === targetSession?.course_id)
      : db.courses[0];

    if (targetSession) {
      const note = db.notes[targetSession.id];
      if (note) {
        context += `\nLecture Title: ${targetSession.title}\nExecutive Summary: ${note.executive_summary}\n\nLecture Notes Excerpt:\n${note.markdown_content.slice(0, 4000)}\n`;
      }
    } else if (targetCourse) {
      context += `\nCourse: ${targetCourse.code} — ${targetCourse.name}\nInstructor: ${targetCourse.instructor || 'Lead Professor'}\n`;
      const sessions = db.sessions.filter((s) => s.course_id === targetCourse?.id);
      for (const s of sessions.slice(0, 2)) {
        const note = db.notes[s.id];
        if (note) {
          context += `Session "${s.title}":\n${note.executive_summary}\n`;
        }
      }
    }

    const systemPrompt = `You are the Academic AI Tutor for "${targetCourse?.code || 'University Course'} — ${targetCourse?.name || 'Computer Science'}".
Your duty is to assist students with rigorous, pedagogically sound answers based on lecture material.
Include exact formulas, CLI commands, and references to lecture concepts when applicable.
If the student asks about exams or deadlines, give clear, prominent alerts using > [!IMPORTANT] or > [!WARNING].`;

    const userPrompt = `Student Question: "${query}"

Lecture and Course Context:
${context}

Answer the student's question directly, thoroughly, and authoritatively.`;

    try {
      const answer = await callAi({
        provider,
        apiKey,
        systemPrompt,
        userPrompt,
        temperature: 0.3,
        maxTokens: 1024,
      });

      return NextResponse.json({
        answer,
        sources: targetSession
          ? [{ segment_id: 'seg-1', session_id: targetSession.id, session_title: targetSession.title || 'Lecture', start_seconds: 0 }]
          : [],
      });
    } catch (aiErr: any) {
      console.warn('[api/chat] AI Provider call failed:', aiErr.message);

      // Return transparent error info
      const errorMsg = aiErr.message || 'AI request failed';
      const isQuotaExhausted = errorMsg.includes('credit_balance_exhausted') || errorMsg.includes('insufficient_quota') || errorMsg.includes('429');

      return NextResponse.json({
        answer: isQuotaExhausted
          ? `⚠️ **AI Provider Notice:** Your OpenAI API account has exhausted its credit balance ($0.00 remaining).\n\nTo continue chatting with live AI:\n1. Go to **Settings** and select **Google Gemini** (Free tier available without credit card at [Google AI Studio](https://aistudio.google.com/app/apikey)).\n2. Or add credits to your OpenAI account at [OpenAI Billing](https://platform.openai.com/settings/organization/billing/).`
          : `⚠️ **AI Service Notice:** ${errorMsg}`,
        error: true,
        error_detail: errorMsg,
        sources: [],
      });
    }
  } catch (err: any) {
    return NextResponse.json({ detail: err.message || 'Chat error' }, { status: 500 });
  }
}
