import { useMutation } from '@tanstack/react-query';

interface SignalData {
  timestamp: string;
  source: string;
  data: number[];
}

interface ProcessedSignal {
  processed: boolean;
  timestamp: string;
  anomalies: Array<{
    index: number;
    value: number;
    severity: 'high' | 'medium';
  }>;
  threat_level: 'high' | 'low';
  raw_data: SignalData;
}

export function useSignalProcessing() {
  const processSignalMutation = useMutation<ProcessedSignal, Error, SignalData>({
    mutationFn: async (signalData) => {
      const response = await fetch('/api/process-signal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(signalData),
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status >= 500) {
          throw new Error(`${response.status}: ${response.statusText}`);
        }
        throw new Error(`${response.status}: ${await response.text()}`);
      }

      return response.json();
    },
  });

  return {
    processSignal: processSignalMutation.mutateAsync,
    isProcessing: processSignalMutation.isPending,
    error: processSignalMutation.error,
  };
}
