import { useQuery } from '@tanstack/react-query';
import type { SelectThreat } from "@db/schema";

interface ThreatPrediction {
  threatId: number;
  probability: number;
  riskScore: number;
  predictedSeverity: 'low' | 'medium' | 'high' | 'critical';
  indicators: string[];
  timestamp: string;
}

async function fetchThreatPredictions(): Promise<ThreatPrediction[]> {
  const response = await fetch('/api/threats/predictions', {
    credentials: 'include'
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch threat predictions: ${response.statusText}`);
  }

  return response.json();
}

export function useThreatPrediction() {
  return useQuery<ThreatPrediction[], Error>({
    queryKey: ['/api/threats/predictions'],
    queryFn: fetchThreatPredictions,
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}

export type { ThreatPrediction };
