import { useThreatPrediction, type ThreatPrediction } from "@/hooks/use-threat-prediction";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, AlertCircle } from "lucide-react";
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
            <p>Failed to load predictions: {error.message}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!predictions?.length) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6 text-muted-foreground">
          No threat predictions available
        </CardContent>
      </Card>
    );
  }

  // Transform data for visualization
  const chartData = predictions.map((pred: ThreatPrediction) => ({
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
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="timestamp" className="text-muted-foreground" />
                <YAxis className="text-muted-foreground" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 'var(--radius)',
                  }}
                  labelStyle={{ color: 'hsl(var(--popover-foreground))' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="riskScore" 
                  stroke="hsl(var(--primary))" 
                  name="Risk Score"
                  strokeWidth={2}
                />
                <Line 
                  type="monotone" 
                  dataKey="probability" 
                  stroke="hsl(var(--destructive))" 
                  name="Probability (%)"
                  strokeWidth={2}
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
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="riskScore" 
                  name="Risk Score" 
                  className="text-muted-foreground"
                />
                <YAxis 
                  dataKey="probability" 
                  name="Probability (%)" 
                  className="text-muted-foreground"
                />
                <ZAxis 
                  dataKey="severity" 
                  name="Severity"
                  range={[100, 1000]}
                />
                <Tooltip 
                  cursor={{ strokeDasharray: '3 3' }}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 'var(--radius)',
                  }}
                  labelStyle={{ color: 'hsl(var(--popover-foreground))' }}
                />
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