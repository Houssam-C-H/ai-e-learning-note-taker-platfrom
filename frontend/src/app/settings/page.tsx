'use client';

import { useState, useEffect } from 'react';
import {
  Settings,
  Key,
  Globe,
  Sliders,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Cpu,
  ShieldCheck,
  Eye,
  EyeOff,
  Sparkles,
  Zap,
  ExternalLink,
  Flame,
  AlertTriangle,
} from 'lucide-react';
import { AVAILABLE_MODELS, type AiProvider } from '@/lib/ai-providers';

export default function SettingsPage() {
  const [provider, setProvider] = useState<AiProvider>('gemini');
  const [selectedModel, setSelectedModel] = useState<string>('openai/gpt-oss-120b');
  const [geminiKey, setGeminiKey] = useState('');
  const [openaiKey, setOpenaiKey] = useState('');
  const [groqKey, setGroqKey] = useState('');
  const [showKey, setShowKey] = useState(false);

  const [bbbUrl, setBbbUrl] = useState('https://visioconference.supmti.ac.ma');
  const [whisperModel, setWhisperModel] = useState('base');
  const [defaultLanguage, setDefaultLanguage] = useState('multilingual');
  const [cardCount, setCardCount] = useState(15);
  const [quizCount, setQuizCount] = useState(10);
  const [examAlertsEnabled, setExamAlertsEnabled] = useState(true);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [testingKey, setTestingKey] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    provider: string;
    model: string;
    message: string;
    quotaExhausted?: boolean;
    invalidKey?: boolean;
  } | null>(null);

  useEffect(() => {
    // 1. Fetch current server settings
    fetch('/api/settings')
      .then((r) => r.json())
      .then((data) => {
        if (data.provider) setProvider(data.provider);
        if (data.bbb_base_url) setBbbUrl(data.bbb_base_url);
        if (data.whisper_model) setWhisperModel(data.whisper_model);
        if (data.default_language) setDefaultLanguage(data.default_language);
      })
      .catch((e) => console.warn('Could not load server settings:', e));

    // 2. Load locally cached keys
    const savedProvider = localStorage.getItem('noteai_provider') as AiProvider;
    if (savedProvider) setProvider(savedProvider);

    const savedGemini = localStorage.getItem('noteai_gemini_key') || '';
    setGeminiKey(savedGemini);

    const savedOpenai = localStorage.getItem('noteai_openai_key') || '';
    setOpenaiKey(savedOpenai);

    const savedGroq = localStorage.getItem('noteai_groq_key') || '';
    setGroqKey(savedGroq);

    const savedBbb = localStorage.getItem('noteai_bbb_url');
    if (savedBbb) setBbbUrl(savedBbb);
  }, []);

  const activeKey = provider === 'gemini' ? geminiKey : provider === 'groq' ? groqKey : openaiKey;
  const setActiveKey = (val: string) => {
    if (provider === 'gemini') setGeminiKey(val);
    else if (provider === 'groq') setGroqKey(val);
    else setOpenaiKey(val);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    // Save to localStorage for client-side persistence
    localStorage.setItem('noteai_provider', provider);
    if (geminiKey) localStorage.setItem('noteai_gemini_key', geminiKey);
    if (openaiKey) localStorage.setItem('noteai_openai_key', openaiKey);
    if (groqKey) localStorage.setItem('noteai_groq_key', groqKey);
    if (bbbUrl) localStorage.setItem('noteai_bbb_url', bbbUrl);
    localStorage.setItem('noteai_whisper_model', whisperModel);
    localStorage.setItem('noteai_lang', defaultLanguage);

    // Save to server-side settings
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          apiKey: activeKey,
          bbbBaseUrl: bbbUrl,
          whisperModel,
          defaultLanguage,
        }),
      });
    } catch (err) {
      console.warn('Server settings sync failed:', err);
    }

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleTestConnection = async () => {
    setTestingKey(true);
    setTestResult(null);

    // Guarantee the model strictly belongs to the tested provider
    const effectiveModel =
      provider === 'gemini'
        ? selectedModel.startsWith('gemini') ? selectedModel : 'gemini-2.5-flash'
        : provider === 'groq'
        ? (selectedModel.includes('gpt-oss') || selectedModel.includes('qwen')) ? selectedModel : 'openai/gpt-oss-120b'
        : selectedModel.startsWith('gpt') ? selectedModel : 'gpt-4o-mini';

    try {
      const res = await fetch('/api/ai/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          model: effectiveModel,
          apiKey: activeKey.trim() || undefined,
        }),
      });
      const data = await res.json();
      setTestResult(data);
    } catch (err: any) {
      setTestResult({
        success: false,
        provider,
        model: effectiveModel,
        message: err.message || 'Failed to reach diagnostic endpoint.',
      });
    } finally {
      setTestingKey(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      {/* Title Bar */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
          <Settings className="w-6 h-6 text-accent" />
          AI & System Platform Settings
        </h1>
        <p className="text-sm text-text-muted mt-1">
          Configure real AI synthesis providers (Google Gemini Free, OpenAI, Groq), BigBlueButton server connections, and assessment density.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: AI Provider Selection & Real Diagnostics */}
        <div className="card space-y-6 border border-border/80">
          <div className="border-b border-border/60 pb-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-accent" />
              Real AI Synthesis Engine & Credentials
            </h2>
            <p className="text-xs text-text-muted mt-0.5">
              Select your AI LLM engine. Google Gemini is recommended as it provides a 100% free tier with high rate limits.
            </p>
          </div>

          {/* Provider Radio Cards */}
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-2.5">
              Active AI Provider
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Gemini (Free Recommended) */}
              <button
                type="button"
                onClick={() => {
                  setProvider('gemini');
                  setSelectedModel('gemini-2.5-flash');
                  setTestResult(null);
                }}
                className={`p-3.5 rounded-xl border text-left transition-all relative ${
                  provider === 'gemini'
                    ? 'border-accent bg-accent/10 shadow-md shadow-accent/10 ring-1 ring-accent'
                    : 'border-border bg-surface-raised/40 hover:bg-surface-raised/70'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-bold text-white flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-accent" />
                    Google Gemini
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    100% Free
                  </span>
                </div>
                <p className="text-[11px] text-text-muted leading-tight">
                  Gemini 2.5 Flash / Pro. 1M token context, high rate limits. No billing required.
                </p>
              </button>

              {/* OpenAI (Paid) */}
              <button
                type="button"
                onClick={() => {
                  setProvider('openai');
                  setSelectedModel('gpt-4o-mini');
                  setTestResult(null);
                }}
                className={`p-3.5 rounded-xl border text-left transition-all relative ${
                  provider === 'openai'
                    ? 'border-accent bg-accent/10 shadow-md shadow-accent/10 ring-1 ring-accent'
                    : 'border-border bg-surface-raised/40 hover:bg-surface-raised/70'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-bold text-white flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-amber-400" />
                    OpenAI
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    Paid Quota
                  </span>
                </div>
                <p className="text-[11px] text-text-muted leading-tight">
                  GPT-4o / GPT-4o-mini. Requires positive credit balance on platform.openai.com.
                </p>
              </button>

              {/* Groq (Fast Free) */}
              <button
                type="button"
                onClick={() => {
                  setProvider('groq');
                  setSelectedModel('openai/gpt-oss-120b');
                  setTestResult(null);
                }}
                className={`p-3.5 rounded-xl border text-left transition-all relative ${
                  provider === 'groq'
                    ? 'border-accent bg-accent/10 shadow-md shadow-accent/10 ring-1 ring-accent'
                    : 'border-border bg-surface-raised/40 hover:bg-surface-raised/70'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-bold text-white flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-orange-400" />
                    Groq Cloud
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30">
                    Ultra-Fast
                  </span>
                </div>
                <p className="text-[11px] text-text-muted leading-tight">
                  GPT-OSS 120B / 20B / Qwen. Ultra-fast LPU inference, high free rate limits.
                </p>
              </button>
            </div>
          </div>

          {/* Model Selection for Active Provider */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-text-secondary">
              Active LLM Model for {provider.toUpperCase()}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {AVAILABLE_MODELS.filter((m) => m.provider === provider).map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setSelectedModel(m.id)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    selectedModel === m.id
                      ? 'bg-accent/15 border-accent text-white ring-1 ring-accent'
                      : 'bg-surface-raised/40 border-border text-text-muted hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-white">{m.name}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded font-bold uppercase bg-surface border border-border text-accent">
                      {m.badge}
                    </span>
                  </div>
                  <p className="text-[10px] text-text-muted leading-tight">{m.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Key Input for Selected Provider */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-text-secondary flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-accent" />
                {provider === 'gemini'
                  ? 'Google Gemini API Key'
                  : provider === 'groq'
                  ? 'Groq Cloud API Key'
                  : 'OpenAI API Key'}
              </label>

              {/* Quick links to get key */}
              {provider === 'gemini' && (
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-accent hover:underline flex items-center gap-1"
                >
                  Get free key at Google AI Studio <ExternalLink className="w-3 h-3" />
                </a>
              )}
              {provider === 'openai' && (
                <a
                  href="https://platform.openai.com/settings/organization/billing/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-amber-400 hover:underline flex items-center gap-1"
                >
                  Check balance at OpenAI Billing <ExternalLink className="w-3 h-3" />
                </a>
              )}
              {provider === 'groq' && (
                <a
                  href="https://console.groq.com/keys"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-orange-400 hover:underline flex items-center gap-1"
                >
                  Get free key at Groq Console <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>

            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={activeKey}
                onChange={(e) => setActiveKey(e.target.value)}
                placeholder={
                  provider === 'gemini'
                    ? 'AIzaSy...'
                    : provider === 'groq'
                    ? 'gsk_...'
                    : 'sk-proj-...'
                }
                className="input-base text-xs font-mono pr-20"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-white"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <p className="text-[11px] text-text-muted">
              {provider === 'gemini'
                ? 'Free API key from Google AI Studio. 100% free with no credit card required.'
                : provider === 'groq'
                ? 'Free API key from Groq Console. Provides ultra-fast Llama 3.3 70B generation.'
                : 'OpenAI API key. If your account has $0.00 credits remaining, requests will be rejected with HTTP 429.'}
            </p>
          </div>

          {/* Test Diagnostic Button */}
          <div className="pt-1 flex flex-col sm:flex-row sm:items-center gap-3">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={testingKey}
              className="px-4 py-2 rounded-lg bg-surface-raised hover:bg-surface-raised/80 border border-border text-xs font-semibold text-indigo-300 hover:text-white flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              {testingKey ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Testing Real AI Ping…
                </>
              ) : (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-accent" />
                  Test Live AI Connectivity
                </>
              )}
            </button>

            {testResult && (
              <div
                className={`text-xs p-3 rounded-lg border flex items-start gap-2.5 flex-1 ${
                  testResult.success
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-red-500/10 border-red-500/30 text-red-300'
                }`}
              >
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="font-semibold">
                    {testResult.success ? 'API Check Succeeded' : 'API Check Failed'}
                  </div>
                  <div className="text-[11px] mt-0.5 leading-relaxed break-words">
                    {testResult.message}
                  </div>
                  {testResult.quotaExhausted && (
                    <div className="mt-2 text-[11px] bg-red-950/60 p-2 rounded border border-red-800 text-amber-200">
                      💡 <strong>Fix:</strong> Switch to <strong>Google Gemini</strong> above (it has a free tier without billing) or add credits at{' '}
                      <a
                        href="https://platform.openai.com/settings/organization/billing/"
                        target="_blank"
                        rel="noreferrer"
                        className="underline font-bold text-white"
                      >
                        OpenAI Billing
                      </a>
                      .
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Section 2: BigBlueButton Ingestion Server */}
        <div className="card space-y-5 border border-border/80">
          <div className="border-b border-border/60 pb-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Globe className="w-4 h-4 text-emerald-400" />
              University BigBlueButton Configuration
            </h2>
            <p className="text-xs text-text-muted mt-0.5">
              Specify your institution teleconference server domain for automated media stream discovery.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                Default BigBlueButton Server Base URL
              </label>
              <input
                type="url"
                value={bbbUrl}
                onChange={(e) => setBbbUrl(e.target.value)}
                placeholder="https://visioconference.supmti.ac.ma"
                className="input-base text-xs font-mono"
                required
              />
              <p className="text-[11px] text-text-muted mt-1.5">
                Automatically resolves `webcams.webm`, `audio.webm`, `deskshare.webm`, and authentic `metadata.xml` and `slides_new.xml` assets.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                Speech-to-Text Model Profile
              </label>
              <select
                value={whisperModel}
                onChange={(e) => setWhisperModel(e.target.value)}
                className="input-base text-xs pr-8"
              >
                <option value="base">faster-whisper base (Optimized: 16x Real-time, 150MB VRAM)</option>
                <option value="small">faster-whisper small (Balanced accuracy, 500MB VRAM)</option>
                <option value="medium">faster-whisper medium (High accuracy for French/English/Arabic code-switching)</option>
                <option value="large-v3">faster-whisper large-v3 (Maximum precision for complex technical jargon)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                Primary Language Detection Mode
              </label>
              <select
                value={defaultLanguage}
                onChange={(e) => setDefaultLanguage(e.target.value)}
                className="input-base text-xs pr-8"
              >
                <option value="multilingual">Multilingual Auto-Detect (French, English, Arabic engineering dialect)</option>
                <option value="fr">French (Français Académique)</option>
                <option value="en">English (Computer Science Standard)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 3: Study Asset Generation Parameters */}
        <div className="card space-y-5 border border-border/80">
          <div className="border-b border-border/60 pb-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-purple-400" />
              Active Recall & Assessment Generation Parameters
            </h2>
            <p className="text-xs text-text-muted mt-0.5">
              Control the density of flashcards and quiz questions synthesized per session.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                Flashcards per Lecture
              </label>
              <input
                type="number"
                min={5}
                max={30}
                value={cardCount}
                onChange={(e) => setCardCount(parseInt(e.target.value, 10))}
                className="input-base text-xs"
              />
              <p className="text-[11px] text-text-muted mt-1">
                Default: 15 cards (5 Easy, 6 Medium, 4 Hard with Anki SM-2 export).
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                Quiz Questions per Lecture
              </label>
              <input
                type="number"
                min={3}
                max={20}
                value={quizCount}
                onChange={(e) => setQuizCount(parseInt(e.target.value, 10))}
                className="input-base text-xs"
              />
              <p className="text-[11px] text-text-muted mt-1">
                Default: 10 scenario-based questions with 4-point explanations.
              </p>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-border/60">
            <div className="space-y-0.5">
              <div className="text-xs font-semibold text-white">Highlight Teacher Announcements</div>
              <div className="text-[11px] text-text-muted">
                Extract exam hints, deadlines, and grading notes into dedicated callout alerts.
              </div>
            </div>
            <input
              type="checkbox"
              checked={examAlertsEnabled}
              onChange={(e) => setExamAlertsEnabled(e.target.checked)}
              className="w-4 h-4 accent-accent rounded cursor-pointer"
            />
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="submit"
            disabled={saving}
            className="btn-accent flex items-center gap-2 text-xs font-bold py-2.5 px-6 shadow-lg shadow-accent/25"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving Preferences…
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save All Settings
              </>
            )}
          </button>

          {saved && (
            <span className="text-xs text-emerald-400 flex items-center gap-1.5 font-bold animate-fade-in">
              <CheckCircle2 className="w-4 h-4" />
              Settings saved successfully!
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
