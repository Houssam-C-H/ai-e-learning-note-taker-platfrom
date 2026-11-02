'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  RotateCcw,
  RotateCw,
  Maximize,
  ExternalLink,
  Film,
  Sparkles,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { formatTime, formatTimestamp } from '@/lib/utils';
import type { VideoSyncState } from '@/hooks/useVideoSync';

interface VideoPlayerProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  state: VideoSyncState;
  videoUrl?: string;
  audioUrl?: string;
  togglePlay: () => void;
  seekTo: (seconds: number) => void;
  setPlaybackRate: (rate: number) => void;
  setVolume: (vol: number) => void;
  toggleMute: () => void;
  skip: (seconds: number) => void;
}

export function VideoPlayer({
  videoRef,
  state,
  videoUrl,
  audioUrl,
  togglePlay,
  seekTo,
  setPlaybackRate,
  setVolume,
  toggleMute,
  skip,
}: VideoPlayerProps) {
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [seekFeedback, setSeekFeedback] = useState<string | null>(null);
  const [useDirectUrl, setUseDirectUrl] = useState(false);
  const [hasError, setHasError] = useState(false);
  const feedbackTimerRef = useRef<NodeJS.Timeout | null>(null);

  const rawUrl = videoUrl || audioUrl || '';

  // Use same-origin proxy to eliminate CORS, mixed-content, and frame-ancestor blocking
  const proxiedUrl = useMemo(() => {
    if (!rawUrl) return '';
    if (useDirectUrl) return rawUrl;
    if (rawUrl.startsWith('http')) {
      return `/api/stream/proxy?url=${encodeURIComponent(rawUrl)}`;
    }
    return rawUrl;
  }, [rawUrl, useDirectUrl]);

  const playbackRates = [0.75, 1, 1.25, 1.5, 1.75, 2];

  // Expose an enhanced seekTo with visual HUD feedback
  const handleSeek = (seconds: number, label?: string) => {
    seekTo(seconds);
    const tsStr = formatTimestamp(seconds);
    setSeekFeedback(label ? `${tsStr} — ${label}` : tsStr);
    if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    feedbackTimerRef.current = setTimeout(() => {
      setSeekFeedback(null);
    }, 2500);
  };

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    handleSeek(val);
  };

  const handleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      } else {
        videoRef.current.requestFullscreen().catch(() => {});
      }
    }
  };

  return (
    <div className="card p-0 overflow-hidden bg-black flex flex-col border border-border shadow-2xl rounded-2xl relative group">
      {/* Video Viewport: ALWAYS MOUNTED to keep videoRef.current permanently valid */}
      <div className="relative aspect-video w-full bg-zinc-950 flex items-center justify-center overflow-hidden">
        <video
          ref={videoRef}
          src={proxiedUrl || undefined}
          playsInline
          preload="metadata"
          className="w-full h-full object-contain cursor-pointer"
          onClick={togglePlay}
          onError={() => {
            if (!useDirectUrl) {
              // Try falling back to direct URL if proxy had an issue
              setUseDirectUrl(true);
            } else {
              setHasError(true);
            }
          }}
          onLoadedMetadata={() => setHasError(false)}
        />

        {/* Big play button overlay when paused */}
        {!state.isPlaying && (
          <button
            onClick={togglePlay}
            className="absolute inset-0 flex items-center justify-center bg-black/35 hover:bg-black/45 transition-colors group-hover:scale-105 duration-200"
            aria-label="Play recording"
          >
            <div className="w-16 h-16 rounded-full bg-accent/90 flex items-center justify-center text-white shadow-2xl shadow-accent/50 hover:bg-accent transition-transform transform active:scale-95">
              <Play className="w-7 h-7 ml-1 fill-white" />
            </div>
          </button>
        )}

        {/* ⏱ Interactive Timestamp Jump HUD Notification */}
        {seekFeedback && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 pointer-events-none animate-in fade-in zoom-in-95 duration-200">
            <div className="px-4 py-2 rounded-full bg-indigo-950/90 border border-indigo-500/50 backdrop-blur-md shadow-2xl shadow-indigo-950 flex items-center gap-2 text-white text-xs font-mono font-bold">
              <Clock className="w-4 h-4 text-emerald-400 animate-spin" />
              <span>Jumped to {seekFeedback}</span>
            </div>
          </div>
        )}

        {/* Fallback Banner if upstream stream is temporarily unreachable */}
        {hasError && (
          <div className="absolute top-3 right-3 z-20">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-950/90 border border-amber-500/40 text-amber-200 text-xs">
              <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
              <span>Stream connection pending</span>
              {rawUrl && (
                <a
                  href={rawUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline ml-1 hover:text-white flex items-center gap-0.5"
                >
                  Raw Stream <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Control Bar */}
      <div className="p-3 bg-zinc-950/95 border-t border-border/80 flex flex-col gap-2">
        {/* Scrub Slider */}
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={0}
            max={state.duration || 7200}
            step={1}
            value={state.currentTime || 0}
            onChange={handleSeekChange}
            className="w-full h-1.5 bg-surface-raised rounded-lg appearance-none cursor-pointer accent-accent hover:h-2 transition-all"
          />
          <span className="text-xs font-mono text-text-muted flex-shrink-0 min-w-[100px] text-right">
            {formatTime(state.currentTime)} / {formatTime(state.duration || 7200)}
          </span>
        </div>

        {/* Button Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={togglePlay}
              className="p-1.5 rounded-lg hover:bg-surface text-text-primary hover:text-white transition-colors"
              title={state.isPlaying ? 'Pause' : 'Play'}
            >
              {state.isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
            </button>
            <button
              onClick={() => skip(-10)}
              className="p-1.5 rounded-lg hover:bg-surface text-text-muted hover:text-white transition-colors"
              title="Skip backward 10s"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={() => skip(10)}
              className="p-1.5 rounded-lg hover:bg-surface text-text-muted hover:text-white transition-colors"
              title="Skip forward 10s"
            >
              <RotateCw className="w-4 h-4" />
            </button>

            {/* Volume Control */}
            <div className="flex items-center gap-1.5 ml-2">
              <button
                onClick={toggleMute}
                className="p-1.5 rounded-lg hover:bg-surface text-text-muted hover:text-white transition-colors"
                title={state.isMuted ? 'Unmute' : 'Mute'}
              >
                {state.isMuted || state.volume === 0 ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={state.isMuted ? 0 : state.volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-16 h-1 bg-surface-raised rounded-lg appearance-none cursor-pointer accent-accent"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Speed Selector */}
            <div className="relative">
              <button
                onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                className="px-2 py-1 rounded-lg text-xs font-mono font-semibold bg-surface hover:bg-surface-hover text-text-muted hover:text-white border border-border/80 transition-colors"
              >
                {state.playbackRate}x
              </button>
              {showSpeedMenu && (
                <div className="absolute right-0 bottom-full mb-1 bg-surface-raised border border-border rounded-xl shadow-xl p-1 z-30 flex flex-col gap-0.5">
                  {playbackRates.map((rate) => (
                    <button
                      key={rate}
                      onClick={() => {
                        setPlaybackRate(rate);
                        setShowSpeedMenu(false);
                      }}
                      className={`px-3 py-1 text-xs font-mono rounded-lg text-left transition-colors ${
                        state.playbackRate === rate
                          ? 'bg-accent text-white font-bold'
                          : 'text-text-muted hover:text-white hover:bg-surface'
                      }`}
                    >
                      {rate}x
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Fullscreen */}
            <button
              onClick={handleFullscreen}
              className="p-1.5 rounded-lg hover:bg-surface text-text-muted hover:text-white transition-colors"
              title="Toggle Fullscreen"
            >
              <Maximize className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
