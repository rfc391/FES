import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { SelectThreatIntelligence } from '@db/schema';

interface ThreatIntelligenceShare {
  threatId: number;
  insights: string;
  tags: string[];
  shareScope: 'public' | 'private' | 'trusted';
}

async function shareThreatIntelligence(data: ThreatIntelligenceShare): Promise<SelectThreatIntelligence> {
  const response = await fetch('/api/threat-intelligence/share', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.json();
}

async function verifyIntelligence(id: number, status: 'verified' | 'disputed' | 'pending'): Promise<void> {
  const response = await fetch(`/api/threat-intelligence/${id}/verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }
}

async function addEndorsement(id: number, comment: string): Promise<void> {
  const response = await fetch(`/api/threat-intelligence/${id}/endorse`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ comment }),
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }
}

async function fetchThreatIntelligence(shareScope?: string): Promise<SelectThreatIntelligence[]> {
  const url = new URL('/api/threat-intelligence', window.location.origin);
  if (shareScope) {
    url.searchParams.set('shareScope', shareScope);
  }

  const response = await fetch(url, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.json();
}

export function useThreatIntelligence(shareScope?: 'public' | 'private' | 'trusted') {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const wsRef = useRef<WebSocket>();
  const [isConnected, setIsConnected] = useState(false);

  // WebSocket connection
  useEffect(() => {
    const connectWebSocket = () => {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const ws = new WebSocket(`${protocol}//${window.location.host}/api/threat-intelligence/ws`);

      ws.onopen = () => {
        console.log('Connected to threat intelligence feed');
        setIsConnected(true);
      };

      ws.onmessage = (event) => {
        const update = JSON.parse(event.data);
        if (update.type === 'intelligence_update') {
          queryClient.setQueryData<SelectThreatIntelligence[]>(
            ['/api/threat-intelligence', shareScope],
            (old) => {
              if (!old) return [update.data];
              return [update.data, ...old.filter(item => item.id !== update.data.id)];
            }
          );

          toast({
            title: "New Threat Intelligence",
            description: "The threat intelligence feed has been updated.",
          });
        }
      };

      ws.onclose = () => {
        console.log('Disconnected from threat intelligence feed');
        setIsConnected(false);
        // Attempt to reconnect after 5 seconds
        setTimeout(connectWebSocket, 5000);
      };

      wsRef.current = ws;
    };

    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [queryClient, toast, shareScope]);

  const { data: intelligence, isLoading, error } = useQuery<SelectThreatIntelligence[], Error>({
    queryKey: ['/api/threat-intelligence', shareScope],
    queryFn: () => fetchThreatIntelligence(shareScope),
    refetchInterval: 30000, // Refresh every 30 seconds as backup
  });

  const shareMutation = useMutation({
    mutationFn: shareThreatIntelligence,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/threat-intelligence'] });
      toast({
        title: "Intelligence Shared",
        description: "Your threat intelligence has been shared successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const verifyMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: 'verified' | 'disputed' | 'pending' }) =>
      verifyIntelligence(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/threat-intelligence'] });
      toast({
        title: "Verification Updated",
        description: "The intelligence verification status has been updated.",
      });
    },
  });

  const endorseMutation = useMutation({
    mutationFn: ({ id, comment }: { id: number; comment: string }) =>
      addEndorsement(id, comment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/threat-intelligence'] });
      toast({
        title: "Endorsement Added",
        description: "Your endorsement has been added successfully.",
      });
    },
  });

  return {
    intelligence,
    isLoading,
    error,
    isConnected,
    shareIntelligence: shareMutation.mutate,
    verifyIntelligence: verifyMutation.mutate,
    addEndorsement: endorseMutation.mutate,
    isSharing: shareMutation.isPending,
    isVerifying: verifyMutation.isPending,
    isEndorsing: endorseMutation.isPending,
  };
}
