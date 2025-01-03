import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Shield, CheckCircle, AlertTriangle, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface SecurityRecommendation {
  id: number;
  category: string;
  title: string;
  description: string;
  impact: string;
  priority: string;
  currentState: any;
  recommendedState: any;
  implementationSteps: string[];
  isApplicable: boolean;
  appliedAt: string | null;
}

export default function SecurityRecommendationsPage() {
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { data: recommendations, isLoading, refetch } = useQuery({
    queryKey: ['/api/security/recommendations'],
    queryFn: async () => {
      const res = await fetch('/api/security/recommendations');
      if (!res.ok) throw new Error('Failed to fetch recommendations');
      return res.json() as Promise<SecurityRecommendation[]>;
    },
  });

  const applyMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/security/recommendations/${id}/apply`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to apply recommendation');
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Security recommendation applied successfully",
      });
      refetch();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to apply security recommendation",
        variant: "destructive",
      });
    },
  });

  // Convert Set to Array before using spread operator
  const categories = recommendations 
    ? Array.from(new Set(recommendations.map(r => r.category)))
    : [];

  const filteredRecommendations = recommendations?.filter(
    r => !selectedCategory || r.category === selectedCategory
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8" />
            Security Recommendations
          </h1>
          <Button
            variant="outline"
            onClick={() => setSelectedCategory(null)}
            className={!selectedCategory ? 'bg-primary text-primary-foreground' : ''}
          >
            All Categories
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          {categories.map((category) => (
            <Card
              key={category}
              className={`cursor-pointer transition-colors hover:bg-accent
                ${selectedCategory === category ? 'border-primary' : ''}`}
              onClick={() => setSelectedCategory(category)}
            >
              <CardHeader className="p-4">
                <CardTitle className="text-sm flex items-center justify-between">
                  {category}
                  <Badge variant="outline">
                    {recommendations?.filter(r => r.category === category).length}
                  </Badge>
                </CardTitle>
              </CardHeader>
            </Card>
          ))}
        </div>

        <Accordion type="single" collapsible className="space-y-4">
          {filteredRecommendations?.map((recommendation) => (
            <motion.div
              key={recommendation.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <AccordionItem value={recommendation.id.toString()} className="border rounded-lg">
                <AccordionTrigger className="px-4">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-4">
                      {recommendation.appliedAt ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <AlertTriangle className={`h-5 w-5 ${
                          recommendation.priority === 'high' ? 'text-red-500' : 'text-yellow-500'
                        }`} />
                      )}
                      <div className="text-left">
                        <h3 className="font-medium">{recommendation.title}</h3>
                        <p className="text-sm text-muted-foreground">{recommendation.category}</p>
                      </div>
                    </div>
                    <Badge variant={recommendation.priority === 'high' ? 'destructive' : 'outline'}>
                      {recommendation.priority}
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Description</h4>
                      <p className="text-muted-foreground">{recommendation.description}</p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Impact</h4>
                      <p className="text-muted-foreground">{recommendation.impact}</p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Implementation Steps</h4>
                      <ul className="list-disc list-inside text-muted-foreground">
                        {recommendation.implementationSteps.map((step, index) => (
                          <li key={index}>{step}</li>
                        ))}
                      </ul>
                    </div>
                    {!recommendation.appliedAt && (
                      <Button
                        className="w-full"
                        onClick={() => applyMutation.mutate(recommendation.id)}
                        disabled={applyMutation.isPending}
                      >
                        <Lock className="mr-2 h-4 w-4" />
                        Apply Recommendation
                      </Button>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </motion.div>
          ))}
        </Accordion>
      </div>
    </div>
  );
}