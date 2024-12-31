import { useThreatPrediction } from "@/hooks/use-threat-prediction";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ZAxis,
} from "recharts";

export function ThreatPredictionViz() {
  const { data: predictions, isLoading, error } = useThreatPrediction();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6 text-destructive">
          Failed to load predictions: {error.message}
        </CardContent>
      </Card>
    );
  }

  if (!predictions?.length) {
    return (
      <Card>
        <CardContent className="pt-6">
          No threat predictions available
        </CardContent>
      </Card>
    );
  }

  // Transform data for visualization
  const chartData = predictions.map(pred => ({
    timestamp: new Date(pred.timestamp).toLocaleTimeString(),
    riskScore: pred.riskScore,
    probability: pred.probability * 100,
    severity: pred.predictedSeverity,
  }));

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Threat Risk Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="riskScore" 
                  stroke="hsl(var(--primary))" 
                  name="Risk Score"
                />
                <Line 
                  type="monotone" 
                  dataKey="probability" 
                  stroke="hsl(var(--destructive))" 
                  name="Probability (%)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Threat Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="riskScore" name="Risk Score" />
                <YAxis dataKey="probability" name="Probability (%)" />
                <ZAxis dataKey="severity" name="Severity" />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Scatter 
                  name="Threats" 
                  data={chartData}
                  fill="hsl(var(--primary))"
                />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
