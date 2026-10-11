export type TrafficStatus = 'CONNECTED' | 'DEMO MODE' | 'NO DATA' | 'ERROR';

export type TimeRange = '1h' | '24h' | '7d';

export interface TrafficPoint {
  timestamp: string;
  label: string;
  requests: number;
  activeUsers: number;
  latencyMs: number;
}

export interface NetworkNode {
  id: string;
  label: string;
  type: 'edge' | 'service' | 'storage' | 'ledger' | 'api';
  status: 'active' | 'idle' | 'warning';
  reqPerSec: number;
  ping: number;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
}

export interface NetworkConnection {
  from: string;
  to: string;
  packets: number;
  speed: number;
}

export interface TopRoute {
  path: string;
  name: string;
  count: number;
  percent: number;
  trend: 'up' | 'down' | 'steady';
}

export interface TrafficSource {
  source: string;
  percent: number;
  count: number;
}

export interface TrafficMetricsData {
  activeVisitors: number;
  totalPageViews: number;
  activeSessions: number;
  trafficTrendPercent: number;
  avgLatencyMs: number;
  peakRps: number;
  topRoutes: TopRoute[];
  sources: TrafficSource[];
}

export interface TrafficIntelligencePayload {
  status: TrafficStatus;
  mode: 'live' | 'demo';
  timeRange: TimeRange;
  lastUpdated: string;
  metrics: TrafficMetricsData;
  points: TrafficPoint[];
  nodes: NetworkNode[];
  connections: NetworkConnection[];
}
