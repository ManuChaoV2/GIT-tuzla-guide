import { useState, useEffect, useRef, useCallback } from 'react';
import { Howl, Howler } from 'howler';

interface AudioState {
  isPlaying: boolean;
  isPaused: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isLoading: boolean;
  error: string | null;
}

interface UseAudioReturn extends AudioState {
  play: () => void;
  pause: () => void;
  stop: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  load: (url: string) => void;
}

export const useAudio = (initialUrl?: string): UseAudioReturn => {
  const [state, setState] = useState<AudioState>({
    isPlaying: false,
    isPaused: false,
    currentTime: 0,
    duration: 0,
    volume: 1.0,
    isMuted: false,
    isLoading: false,
    error: null,
  });

  const howlRef = useRef<Howl | null>(null);
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const clearUpdateInterval = useCallback(() => {
    if (updateIntervalRef.current) {
      clearInterval(updateIntervalRef.current);
      updateIntervalRef.current = null;
    }
  }, []);

  const startUpdateInterval = useCallback(() => {
    clearUpdateInterval();
    updateIntervalRef.current = setInterval(() => {
      if (howlRef.current && howlRef.current.playing()) {
        setState(prev => ({
          ...prev,
          currentTime: howlRef.current!.seek() as number,
        }));
      }
    }, 100); // Update 10 times per second
  }, [clearUpdateInterval]);

  const load = useCallback((url: string) => {
    // Clear existing howl
    if (howlRef.current) {
      howlRef.current.unload();
      howlRef.current = null;
    }

    clearUpdateInterval();

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    const howl = new Howl({
      src: [url],
      html5: true, // Use HTML5 audio for better streaming
      preload: true,
      volume: state.volume,
      mute: state.isMuted,
      onload: () => {
        setState(prev => ({
          ...prev,
          isLoading: false,
          duration: howl.duration(),
          error: null,
        }));
      },
      onloaderror: (_, error) => {
        console.error('Audio load error:', error);
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Failed to load audio',
        }));
      },
      onplay: () => {
        setState(prev => ({
          ...prev,
          isPlaying: true,
          isPaused: false,
        }));
        startUpdateInterval();
      },
      onpause: () => {
        setState(prev => ({
          ...prev,
          isPlaying: false,
          isPaused: true,
        }));
        clearUpdateInterval();
      },
      onstop: () => {
        setState(prev => ({
          ...prev,
          isPlaying: false,
          isPaused: false,
          currentTime: 0,
        }));
        clearUpdateInterval();
      },
      onend: () => {
        setState(prev => ({
          ...prev,
          isPlaying: false,
          isPaused: false,
          currentTime: prev.duration,
        }));
        clearUpdateInterval();
      },
    });

    howlRef.current = howl;
  }, [state.volume, state.isMuted, clearUpdateInterval, startUpdateInterval]);

  const play = useCallback(() => {
    if (howlRef.current) {
      howlRef.current.play();
    }
  }, []);

  const pause = useCallback(() => {
    if (howlRef.current) {
      howlRef.current.pause();
    }
  }, []);

  const stop = useCallback(() => {
    if (howlRef.current) {
      howlRef.current.stop();
    }
  }, []);

  const seek = useCallback((time: number) => {
    if (howlRef.current) {
      howlRef.current.seek(time);
      setState(prev => ({ ...prev, currentTime: time }));
    }
  }, []);

  const setVolume = useCallback((volume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    if (howlRef.current) {
      howlRef.current.volume(clampedVolume);
    }
    setState(prev => ({ ...prev, volume: clampedVolume }));
  }, []);

  const toggleMute = useCallback(() => {
    const newMuted = !state.isMuted;
    if (howlRef.current) {
      howlRef.current.mute(newMuted);
    }
    setState(prev => ({ ...prev, isMuted: newMuted }));
  }, [state.isMuted]);

  // Load initial URL if provided
  useEffect(() => {
    if (initialUrl) {
      load(initialUrl);
    }
  }, [initialUrl, load]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearUpdateInterval();
      if (howlRef.current) {
        howlRef.current.unload();
      }
    };
  }, [clearUpdateInterval]);

  return {
    ...state,
    play,
    pause,
    stop,
    seek,
    setVolume,
    toggleMute,
    load,
  };
};