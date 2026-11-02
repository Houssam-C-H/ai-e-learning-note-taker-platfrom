'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Clock, AlertTriangle, Info, Terminal, Bell, Lightbulb, ShieldAlert } from 'lucide-react';
import { timestampToSeconds } from '@/lib/utils';

interface MarkdownNotesProps {
  content: string;
  onTimestampClick: (seconds: number) => void;
  currentSecond?: number;
}

export function MarkdownNotes({
  content,
  onTimestampClick,
  currentSecond = 0,
}: MarkdownNotesProps) {
  return (
    <div className="prose prose-invert max-w-none text-text-primary text-sm leading-relaxed space-y-4">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-xl md:text-2xl font-extrabold text-white pb-2 border-b border-border mt-6 mb-4 flex items-center gap-2">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-lg md:text-xl font-bold text-white mt-8 mb-3 pb-1 border-b border-border/40 flex items-center gap-2">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-base font-semibold text-white/90 mt-5 mb-2">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="text-text-primary text-sm leading-relaxed mb-3">
              {children}
            </p>
          ),
          blockquote: ({ children }) => {
            // Flatten children text to inspect for alert prefixes
            const text = React.Children.toArray(children)
              .map((c: any) => (typeof c === 'string' ? c : c?.props?.children || ''))
              .join(' ');

            const isImportant = /\[!IMPORTANT\]|announcement|deadline/i.test(text);
            const isWarning = /\[!WARNING\]|\[!CAUTION\]|exam alert|pitfall/i.test(text);
            const isTip = /\[!TIP\]|best practice|pro tip/i.test(text);

            if (isImportant) {
              return (
                <div className="my-4 p-4 rounded-xl border border-rose-500/40 bg-rose-950/25 text-rose-100 shadow-sm shadow-rose-950/30">
                  <div className="flex items-start gap-3">
                    <div className="p-1 rounded-lg bg-rose-500/20 text-rose-400 mt-0.5 flex-shrink-0">
                      <Bell className="w-4 h-4 animate-bounce" />
                    </div>
                    <div className="space-y-1 text-xs leading-relaxed flex-1">
                      <div className="font-bold text-rose-300 text-xs tracking-wider uppercase flex items-center gap-1.5">
                        Official Teacher Announcement / Deadline
                      </div>
                      <div className="text-rose-100/90">{children}</div>
                    </div>
                  </div>
                </div>
              );
            }

            if (isWarning) {
              return (
                <div className="my-4 p-4 rounded-xl border border-amber-500/40 bg-amber-950/25 text-amber-100 shadow-sm shadow-amber-950/30">
                  <div className="flex items-start gap-3">
                    <div className="p-1 rounded-lg bg-amber-500/20 text-amber-400 mt-0.5 flex-shrink-0">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <div className="space-y-1 text-xs leading-relaxed flex-1">
                      <div className="font-bold text-amber-300 text-xs tracking-wider uppercase flex items-center gap-1.5">
                        Exam Pitfall & Critical Warning
                      </div>
                      <div className="text-amber-100/90">{children}</div>
                    </div>
                  </div>
                </div>
              );
            }

            if (isTip) {
              return (
                <div className="my-4 p-4 rounded-xl border border-emerald-500/40 bg-emerald-950/25 text-emerald-100">
                  <div className="flex items-start gap-3">
                    <div className="p-1 rounded-lg bg-emerald-500/20 text-emerald-400 mt-0.5 flex-shrink-0">
                      <Lightbulb className="w-4 h-4" />
                    </div>
                    <div className="space-y-1 text-xs leading-relaxed flex-1">
                      <div className="font-bold text-emerald-300 text-xs tracking-wider uppercase">
                        Engineering Best Practice
                      </div>
                      <div className="text-emerald-100/90">{children}</div>
                    </div>
                  </div>
                </div>
              );
            }

            // Default Note
            return (
              <div className="my-4 p-4 rounded-xl border border-indigo-500/35 bg-indigo-950/20 text-indigo-200">
                <div className="flex items-start gap-3">
                  <div className="p-1 rounded-lg bg-indigo-500/20 text-indigo-400 mt-0.5 flex-shrink-0">
                    <Info className="w-4 h-4" />
                  </div>
                  <div className="space-y-1 text-xs leading-relaxed flex-1">
                    <div className="font-bold text-indigo-300 text-xs tracking-wider uppercase">
                      Curriculum Key Concept
                    </div>
                    <div className="text-indigo-100/90">{children}</div>
                  </div>
                </div>
              </div>
            );
          },
          code: ({ inline, className, children, ...props }: any) => {
            const match = /language-(\w+)/.exec(className || '');
            const textContent = String(children).replace(/\n$/, '');

            // Timestamp chip check: e.g. `[14:22]`, `[01:14:22]`, `14:22`, or `01:14:22`
            const timestampMatch = textContent.match(/^\[?((?:\d{1,2}:)?\d{1,2}:\d{2})\]?$/);
            if (timestampMatch) {
              const ts = timestampMatch[1];
              const sec = timestampToSeconds(ts);
              const isCurrent = Math.abs(currentSecond - sec) < 15;

              return (
                <button
                  type="button"
                  onClick={() => onTimestampClick(sec)}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 mx-1 rounded-lg text-xs font-mono font-bold transition-all shadow-sm ${
                    isCurrent
                      ? 'bg-accent text-white shadow-accent/50 ring-2 ring-white scale-105'
                      : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hover:bg-accent hover:text-white hover:border-transparent'
                  }`}
                  title={`Click to jump lecture video to ${ts}`}
                >
                  <Clock className="w-3 h-3" />
                  {ts}
                </button>
              );
            }

            if (!inline && match) {
              return (
                <div className="my-4 rounded-xl overflow-hidden border border-border bg-[#0B0D13]">
                  <div className="flex items-center justify-between px-4 py-2 bg-surface border-b border-border/60 text-xs font-mono text-text-muted">
                    <span className="flex items-center gap-1.5 text-text-secondary font-semibold">
                      <Terminal className="w-3.5 h-3.5 text-accent" />
                      {match[1].toUpperCase()} SYNTAX & SCRIPT
                    </span>
                  </div>
                  <pre className="p-4 text-xs font-mono overflow-x-auto text-emerald-400 bg-black/40">
                    <code>{textContent}</code>
                  </pre>
                </div>
              );
            }

            return (
              <code
                className="px-1.5 py-0.5 rounded bg-surface border border-border/60 font-mono text-xs text-indigo-300"
                {...props}
              >
                {children}
              </code>
            );
          },
          table: ({ children }) => (
            <div className="my-5 overflow-x-auto rounded-xl border border-border bg-surface/30">
              <table className="w-full text-xs text-left">{children}</table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-surface text-text-muted font-bold uppercase tracking-wider text-[11px] border-b border-border">
              {children}
            </thead>
          ),
          th: ({ children }) => <th className="px-4 py-3">{children}</th>,
          td: ({ children }) => (
            <td className="px-4 py-2.5 border-b border-border/40 text-text-primary">
              {children}
            </td>
          ),
          ul: ({ children }) => (
            <ul className="list-disc pl-5 space-y-2 text-text-primary">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal pl-5 space-y-2 text-text-primary">{children}</ol>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
