'use client';

import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Send,
  Sparkles,
  Bot,
  User,
  Clock,
  BookOpen,
  Loader2,
  Trash2,
  Lightbulb
} from 'lucide-react';
import type { Course } from '@/lib/types';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: Array<{ segment_id: string; start_seconds: number }>;
  timestamp: Date;
}

interface ChatWindowProps {
  courses: Course[];
  selectedCourseId: string | null;
  onSelectCourse: (id: string | null) => void;
}

export function ChatWindow({
  courses,
  selectedCourseId,
  onSelectCourse,
}: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        'Hello! I am your **Academic AI Tutor**. I have indexed all your BigBlueButton lecture transcripts and study notes. Ask me anything across your courses, like:\n\n- *"What commands did the instructor use to configure OSPF?"*\n- *"Explain the 3NF normalization rules mentioned in Week 4."*\n- *"What were the warnings given about the final exam?"*',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const quickPrompts = [
    'What was highlighted as likely to appear on the exam?',
    'Summarize the core architectural definitions from the latest lecture.',
    'List all terminal commands with their flags mentioned in class.',
  ];

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';
      const res = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: text,
          course_id: selectedCourseId || null,
        }),
      });

      if (!res.ok) {
        throw new Error(`API error ${res.status}`);
      }

      const data = await res.json();
      const answer = data.answer || data.message || 'No answer returned.';

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: answer,
        sources: data.sources || [],
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      console.error('Chat request failed:', err);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content:
          '⚠️ I had trouble connecting to the AI Tutor backend. Please make sure the backend service is running, or verify your OpenAI API key.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="card p-0 flex flex-col h-[750px] border border-border overflow-hidden shadow-2xl rounded-2xl">
      {/* Header bar */}
      <div className="p-4 bg-surface border-b border-border flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-accent/20 border border-accent/40 flex items-center justify-center text-accent">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              Cross-Lecture AI Tutor
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] font-semibold border border-emerald-500/30">
                RAG Active
              </span>
            </h3>
            <p className="text-[11px] text-text-muted">
              Semantic retrieval over past lecture transcripts & notes
            </p>
          </div>
        </div>

        {/* Course Filter Dropdown & Clear */}
        <div className="flex items-center gap-2">
          <select
            value={selectedCourseId || ''}
            onChange={(e) => onSelectCourse(e.target.value || null)}
            className="px-3 py-1.5 rounded-xl bg-card border border-border text-xs text-white focus:outline-none focus:border-accent"
          >
            <option value="">All Courses Context</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code} — {c.name}
              </option>
            ))}
          </select>
          <button
            onClick={() =>
              setMessages([
                {
                  id: 'welcome',
                  role: 'assistant',
                  content: 'Chat context cleared. How can I assist your study session today?',
                  timestamp: new Date(),
                },
              ])
            }
            className="p-2 rounded-xl bg-card hover:bg-surface-hover text-text-muted hover:text-white border border-border transition-colors"
            title="Clear Chat"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar bg-background/50">
        {messages.map((m) => {
          const isUser = m.role === 'user';
          return (
            <div
              key={m.id}
              className={`flex items-start gap-3 max-w-3xl ${
                isUser ? 'ml-auto flex-row-reverse' : ''
              }`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                  isUser
                    ? 'bg-accent text-white shadow-md shadow-accent/25'
                    : 'bg-surface-raised border border-indigo-500/30 text-indigo-400'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
              </div>

              {/* Message Bubble */}
              <div
                className={`p-4 rounded-2xl text-xs md:text-sm leading-relaxed ${
                  isUser
                    ? 'bg-accent text-white rounded-tr-none'
                    : 'bg-surface border border-border/70 text-text-primary rounded-tl-none space-y-2'
                }`}
              >
                {isUser ? (
                  <p className="whitespace-pre-wrap">{m.content}</p>
                ) : (
                  <div className="prose prose-invert prose-xs max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {m.content}
                    </ReactMarkdown>
                  </div>
                )}

                {/* Sources / Citations if available */}
                {m.sources && m.sources.length > 0 && (
                  <div className="pt-2 mt-2 border-t border-border/50 flex flex-wrap items-center gap-1.5 text-[10px] text-text-muted">
                    <span className="font-semibold text-accent">Lecture Citations:</span>
                    {m.sources.map((s, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded bg-surface-raised border border-border font-mono text-indigo-300"
                      >
                        [{Math.floor(s.start_seconds / 60)}:
                        {(s.start_seconds % 60).toString().padStart(2, '0')}]
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-start gap-3 max-w-xl">
            <div className="w-8 h-8 rounded-xl bg-surface border border-indigo-500/30 text-indigo-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4 animate-spin-slow" />
            </div>
            <div className="p-4 rounded-2xl bg-surface border border-border text-xs text-text-muted flex items-center gap-2">
              <Loader2 className="w-4 h-4 text-accent animate-spin" />
              Searching lecture embeddings & synthesizing answer...
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div className="px-4 py-2 bg-surface/70 border-t border-border/50 flex items-center gap-2 overflow-x-auto text-[11px]">
        <span className="text-text-muted flex items-center gap-1 whitespace-nowrap font-medium">
          <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
          Suggested:
        </span>
        {quickPrompts.map((p, i) => (
          <button
            key={i}
            onClick={() => handleSend(p)}
            className="px-2.5 py-1 rounded-lg bg-card hover:bg-surface-hover text-text-secondary hover:text-white border border-border/60 whitespace-nowrap transition-colors"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Input bar */}
      <div className="p-3 bg-surface border-t border-border">
        <div className="relative flex items-end bg-card border border-border rounded-xl focus-within:border-accent transition-colors p-1.5">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={2}
            placeholder="Ask a question across all your lecture recordings (Shift+Enter for newline)..."
            className="w-full bg-transparent px-3 py-1.5 text-xs md:text-sm text-white placeholder:text-text-muted focus:outline-none resize-none"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            className="p-2.5 rounded-lg bg-accent hover:bg-accent-hover disabled:opacity-40 text-white transition-all shadow-md shadow-accent/25 flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

