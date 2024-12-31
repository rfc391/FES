import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

interface RiskCategory {
  name: string;
  score: number;
  factors: string[];
}

interface RiskProfile {
  overallScore: number;
  categories: RiskCategory[];
  recommendations: string[];
  vulnerabilities: string[];
  strengths: string[];
  historicalScores?: Array<{
    date: string;
    score: number;
  }>;
  lastUpdated: string;
  nextAssessmentDate: string;
}

async function fetchRiskProfile(): Promise<RiskProfile> {
  const response = await fetch('/api/risk-profile', {
    credentials: 'include'
  });

  if (!response.ok) {
    if (response.status >= 500) {
      throw new Error(`${response.status}: ${response.statusText}`);
    }
    throw new Error(`${response.status}: ${await response.text()}`);
  }

  return response.json();
}

async function generateRiskProfile(): Promise<RiskProfile> {
  const response = await fetch('/api/risk-profile/generate', {
    method: 'POST',
    credentials: 'include'
  });

  if (!response.ok) {
    if (response.status >= 500) {
      throw new Error(`${response.status}: ${response.statusText}`);
    }
    throw new Error(`${response.status}: ${await response.text()}`);
  }

  return response.json();
}

export function useRiskProfile() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: profile, error, isLoading } = useQuery<RiskProfile, Error>({
    queryKey: ['/api/risk-profile'],
    queryFn: fetchRiskProfile,
    retry: false
  });

  const generateMutation = useMutation({
    mutationFn: generateRiskProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/risk-profile'] });
      toast({
        title: "Risk Profile Generated",
        description: "Your cybersecurity risk profile has been updated.",
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

  return {
    profile,
    isLoading,
    error,
    generateProfile: generateMutation.mutate,
    isGenerating: generateMutation.isPending
  };
}

export type { RiskProfile, RiskCategory };
