import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Share2, Shield, Users, Link } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface ThreatIntelligence {
  id: number;
  insights: string;
  confidenceScore: number;
  tags: string[];
  references: string[];
  verifiedBy: string[];
  timestamp: string;
  sharedBy: {
    id: number;
    username: string;
  };
  threat: {
    type: string;
    severity: string;
    source: string;
  };
}

export default function ThreatIntelligencePage() {
  const { toast } = useToast();
  const [selectedInsight, setSelectedInsight] = useState<ThreatIntelligence | null>(null);

  const { data: insights, isLoading } = useQuery({
    queryKey: ['/api/threat-intelligence'],
    queryFn: async () => {
      const res = await fetch('/api/threat-intelligence');
      if (!res.ok) throw new Error('Failed to fetch threat intelligence');
      return res.json() as Promise<ThreatIntelligence[]>;
    },
  });

  const handleShare = async (id: number) => {
    try {
      const res = await fetch(`/api/threat-intelligence/${id}/share`, {
        method: 'POST',
        credentials: 'include',
      });
      
      if (!res.ok) throw new Error('Failed to share intelligence');
      
      toast({
        title: "Success",
        description: "Threat intelligence shared successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to share threat intelligence",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Shared Intelligence List */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5" />
              Shared Intelligence
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {insights?.map((insight) => (
                <motion.div
                  key={insight.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 border rounded-lg hover:bg-accent cursor-pointer"
                  onClick={() => setSelectedInsight(insight)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      <span className="font-medium">{insight.threat.type}</span>
                    </div>
                    <Badge variant={insight.threat.severity === 'high' ? 'destructive' : 'default'}>
                      {insight.threat.severity}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                    {insight.insights}
                  </p>
                  <div className="mt-2 flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      <span>{insight.sharedBy.username}</span>
                    </div>
                    <time>{new Date(insight.timestamp).toLocaleDateString()}</time>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Selected Intelligence Details */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Intelligence Details</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedInsight ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                <div>
                  <h3 className="font-medium">Analysis</h3>
                  <p className="mt-1 text-muted-foreground">{selectedInsight.insights}</p>
                </div>
                
                <div>
                  <h3 className="font-medium">Tags</h3>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {selectedInsight.tags.map((tag, i) => (
                      <Badge key={i} variant="secondary">{tag}</Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium">References</h3>
                  <div className="mt-1 space-y-1">
                    {selectedInsight.references.map((ref, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Link className="h-3 w-3" />
                        <a href={ref} target="_blank" rel="noopener noreferrer" className="hover:underline">
                          {ref}
                        </a>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4">
                  <Button
                    className="w-full"
                    onClick={() => handleShare(selectedInsight.id)}
                  >
                    <Share2 className="mr-2 h-4 w-4" />
                    Share Intelligence
                  </Button>
                </div>
              </motion.div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[300px] text-center text-muted-foreground">
                <Shield className="h-12 w-12 mb-4" />
                <p>Select a threat intelligence item to view details</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
