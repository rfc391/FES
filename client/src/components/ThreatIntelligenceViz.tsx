import { useThreatIntelligence } from "@/hooks/use-threat-intelligence";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, AlertCircle, Share2, CheckCircle, Shield, Users, Link } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function ThreatIntelligenceViz() {
  const { toast } = useToast();
  const {
    intelligence,
    isLoading,
    error,
    isConnected,
    shareIntelligence,
    verifyIntelligence,
    addEndorsement,
    isSharing,
  } = useThreatIntelligence();

  const [newInsight, setNewInsight] = useState("");
  const [tags, setTags] = useState("");
  const [shareScope, setShareScope] = useState<"public" | "private" | "trusted">("public");

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6 flex justify-center items-center min-h-[200px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full border-destructive">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <p>Failed to load threat intelligence: {error.message}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleShare = async () => {
    if (!newInsight.trim()) {
      toast({
        title: "Error",
        description: "Please provide insights to share",
        variant: "destructive",
      });
      return;
    }

    try {
      await shareIntelligence({
        threatId: 1, // This should be dynamically set based on the current threat
        insights: newInsight,
        tags: tags.split(",").map(t => t.trim()).filter(Boolean),
        shareScope,
      });

      setNewInsight("");
      setTags("");
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to share intelligence",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Collaborative Intelligence</h2>
          <p className="text-muted-foreground">
            {isConnected ? (
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                Connected to real-time feed
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-red-500" />
                Disconnected from feed
              </span>
            )}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Share New Intelligence</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Insights</label>
              <Textarea
                value={newInsight}
                onChange={(e) => setNewInsight(e.target.value)}
                placeholder="Share your threat intelligence insights..."
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Tags</label>
              <Input
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="Enter tags separated by commas"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Share Scope</label>
              <Select
                value={shareScope}
                onValueChange={(value: "public" | "private" | "trusted") => setShareScope(value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select visibility" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                  <SelectItem value="trusted">Trusted Partners</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button 
              onClick={handleShare} 
              disabled={isSharing}
              className="w-full"
            >
              {isSharing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sharing...
                </>
              ) : (
                <>
                  <Share2 className="mr-2 h-4 w-4" />
                  Share Intelligence
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence>
          {intelligence?.map((intel) => (
            <motion.div
              key={intel.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={intel.verificationStatus === 'verified' ? 'default' : 'secondary'}
                        >
                          {intel.verificationStatus}
                        </Badge>
                        <Badge variant="outline">{intel.shareScope}</Badge>
                      </div>
                      <p className="text-sm font-medium mt-2">
                        {intel.insights}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {(intel.tags as string[])?.map((tag, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {new Date(intel.timestamp).toLocaleString()}
                    </span>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => verifyIntelligence({
                          id: intel.id,
                          status: intel.verificationStatus === 'verified' ? 'pending' : 'verified'
                        })}
                      >
                        <CheckCircle className={`h-4 w-4 ${
                          intel.verificationStatus === 'verified' ? 'text-green-500' : 'text-muted-foreground'
                        }`} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const comment = prompt('Add an endorsement comment:');
                          if (comment) {
                            addEndorsement({ id: intel.id, comment });
                          }
                        }}
                      >
                        <Users className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {(intel.endorsements as { userId: number; comment: string }[])?.length > 0 && (
                    <div className="mt-4 border-t pt-4">
                      <h4 className="text-sm font-medium">Endorsements</h4>
                      <div className="mt-2 space-y-2">
                        {(intel.endorsements as { userId: number; comment: string }[]).map((endorsement, i) => (
                          <p key={i} className="text-sm text-muted-foreground">
                            "{endorsement.comment}"
                          </p>
                        ))}
                      </div>
                    </div>
                  )}

                  {(intel.refLinks as string[])?.length > 0 && (
                    <div className="mt-4 border-t pt-4">
                      <h4 className="text-sm font-medium">References</h4>
                      <div className="mt-2 space-y-1">
                        {(intel.refLinks as string[]).map((link, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm">
                            <Link className="h-3 w-3" />
                            <a 
                              href={link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              {link}
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}