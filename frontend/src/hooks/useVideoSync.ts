import { useRef, useState, useCallback, useEffect } from 'react';
import { timestampToSeconds } from '@/lib/utils';

export interface VideoSyncState {
  currentTime: number;
  isPlaying: boolean;
  duration: number;
  playbackRate: number;
  volume: number;
  isMuted: boolean;
  buffered: number;
}

export function useVideoSync() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [state, setState] = useState<VideoSyncState>({
    currentTime: 0,
    isPlaying: false,
    duration: 0,
    playbackRate: 1,
    volume: 1,
    isMuted: false,
    buffered: 0,
  });

  // Current active timestamp index in notes (for highlighting)
  const [activeTimestampIndex, setActiveTimestampIndex] = useState<number>(-1);

  // Registered timestamps from parsed markdown notes
  const timestampsRef = useRef<number[]>([]);

  const registerTimestamps = useCallback((seconds: number[]) => {
    timestampsRef.current = seconds.sort((a, b) => a - b);
  }, []);

  const seekTo = useCallback((seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = seconds;
      videoRef.current.play().catch(() => {});
    }
  }, []);

  const seekToTimestamp = useCallback(
    (timestamp: string) => {
      seekTo(timestampToSeconds(timestamp));
    },
    [seekTo]
  );

  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play().catch(() => {});
    } else {
      videoRef.current.pause();
    }
  }, []);

  const setPlaybackRate = useCallback((rate: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
      setState((prev) => ({ ...prev, playbackRate: rate }));
    }
  }, []);

  const setVolume = useCallback((volume: number) => {
    if (videoRef.current) {
      videoRef.current.volume = volume;
      setState((prev) => ({ ...prev, volume, isMuted: volume === 0 }));
    }
  }, []);

  const toggleMute = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setState((prev) => ({ ...prev, isMuted: !prev.isMuted }));
    }
  }, []);

  const skip = useCallback((seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(
        0,
        Math.min(videoRef.current.duration, videoRef.current.currentTime + seconds)
      );
    }
  }, []);

  // Wire up video element events
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onTimeUpdate = () => {
      const currentTime = video.currentTime;
      setState((prev) => ({ ...prev, currentTime }));

      // Find the active timestamp index for note highlighting
      const timestamps = timestampsRef.current;
      let activeIndex = -1;
      for (let i = timestamps.length - 1; i >= 0; i--) {
        if (currentTime >= (timestamps[i] ?? 0)) {
          activeIndex = i;
          break;
        }
      }
      setActiveTimestampIndex(activeIndex);
    };

    const onPlay = () => setState((prev) => ({ ...prev, isPlaying: true }));
    const onPause = () => setState((prev) => ({ ...prev, isPlaying: false }));
    const onDurationChange = () =>
      setState((prev) => ({ ...prev, duration: video.duration || 0 }));
    const onVolumeChange = () =>
      setState((prev) => ({
        ...prev,
        volume: video.volume,
        isMuted: video.muted,
      }));
    const onProgress = () => {
      if (video.buffered.length > 0) {
        const buffered = (video.buffered.end(video.buffered.length - 1) / video.duration) * 100;
        setState((prev) => ({ ...prev, buffered }));
      }
    };

    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('durationchange', onDurationChange);
    video.addEventListener('volumechange', onVolumeChange);
    video.addEventListener('progress', onProgress);

    return () => {
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('durationchange', onDurationChange);
      video.removeEventListener('volumechange', onVolumeChange);
      video.removeEventListener('progress', onProgress);
    };
  }, []);

  return {
    videoRef,
    state,
    activeTimestampIndex,
    seekTo,
    seekToTimestamp,
    togglePlay,
    setPlaybackRate,
    setVolume,
    toggleMute,
    skip,
    registerTimestamps,
  };
}
