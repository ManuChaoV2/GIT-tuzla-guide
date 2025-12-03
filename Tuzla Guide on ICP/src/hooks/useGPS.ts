import { useState, useEffect, useCallback } from 'react';
import { GPSPosition } from '../types';

interface UseGPSOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
}

interface UseGPSReturn {
  position: GPSPosition | null;
  error: string | null;
  loading: boolean;
  watchPosition: () => void;
  clearWatch: () => void;
  getCurrentPosition: () => Promise<void>;
}

export const useGPS = (options: UseGPSOptions = {}): UseGPSReturn => {
  const [position, setPosition] = useState<GPSPosition | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [watchId, setWatchId] = useState<number | null>(null);

  const defaultOptions: PositionOptions = {
    enableHighAccuracy: options.enableHighAccuracy ?? true,
    timeout: options.timeout ?? 10000,
    maximumAge: options.maximumAge ?? 300000, // 5 minutes
  };

  const handleSuccess = useCallback((pos: GeolocationPosition) => {
    const gpsPosition: GPSPosition = {
      latitude: pos.coords.latitude,
      longitude: pos.coords.longitude,
      accuracy: pos.coords.accuracy,
      timestamp: pos.timestamp,
    };
    setPosition(gpsPosition);
    setError(null);
    setLoading(false);
  }, []);

  const handleError = useCallback((err: GeolocationPositionError) => {
    let errorMessage = 'Unknown error occurred';
    
    switch (err.code) {
      case err.PERMISSION_DENIED:
        errorMessage = 'Location access denied by user';
        break;
      case err.POSITION_UNAVAILABLE:
        errorMessage = 'Location information unavailable';
        break;
      case err.TIMEOUT:
        errorMessage = 'Location request timed out';
        break;
    }
    
    setError(errorMessage);
    setLoading(false);
  }, []);

  const getCurrentPosition = useCallback(async () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser');
      return;
    }

    setLoading(true);
    setError(null);

    return new Promise<void>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          handleSuccess(pos);
          resolve();
        },
        (err) => {
          handleError(err);
          reject(err);
        },
        defaultOptions
      );
    });
  }, [handleSuccess, handleError, defaultOptions]);

  const watchPosition = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser');
      return;
    }

    // Clear existing watch
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
    }

    const newWatchId = navigator.geolocation.watchPosition(
      handleSuccess,
      handleError,
      {
        ...defaultOptions,
        timeout: 5000, // Shorter timeout for watching
      }
    );

    setWatchId(newWatchId);
  }, [handleSuccess, handleError, defaultOptions, watchId]);

  const clearWatch = useCallback(() => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
  }, [watchId]);

  // Get initial position on mount
  useEffect(() => {
    getCurrentPosition();
    
    // Cleanup on unmount
    return () => {
      clearWatch();
    };
  }, [getCurrentPosition, clearWatch]);

  return {
    position,
    error,
    loading,
    watchPosition,
    clearWatch,
    getCurrentPosition,
  };
};