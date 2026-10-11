import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../api/client';
import { TimeRange, TrafficIntelligencePayload } from '../types/traffic';

export function useTrafficAnalytics(initialRange: TimeRange = '24h', initialMode: 'live' | 'demo' = 'demo') {
  const [timeRange, setTimeRange] = useState<TimeRange>(initialRange);
  const [mode, setMode] = useState<'live' | 'demo'>(initialMode);
  const [data, setData] = useState<TrafficIntelligencePayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isMountedRef = useRef(true);

  const fetchData = useCallback(async (range: TimeRange, currentMode: 'live' | 'demo') => {
    try {
      setLoading(prev => (data === null ? true : prev));
      const res = await api.getTrafficAnalytics(range, currentMode);
      if (isMountedRef.current) {
        setData(res);
        setError(null);
      }
    } catch (err: any) {
      if (isMountedRef.current) {
        setError(err.message || 'Failed to connect to traffic telemetry');
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [data]);

  useEffect(() => {
    isMountedRef.current = true;
    fetchData(timeRange, mode);

    // Refresh every 8s when window is visible
    const interval = setInterval(() => {
      if (!document.hidden) {
        fetchData(timeRange, mode);
      }
    }, 8000);

    return () => {
      isMountedRef.current = false;
      clearInterval(interval);
    };
  }, [timeRange, mode, fetchData]);

  const refresh = useCallback(() => {
    fetchData(timeRange, mode);
  }, [fetchData, timeRange, mode]);

  return {
    data,
    loading,
    error,
    timeRange,
    setTimeRange,
    mode,
    setMode,
    refresh,
  };
}
