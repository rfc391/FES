import { useThreatPrediction, type ThreatPrediction } from "@/hooks/use-threat-prediction";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, AlertCircle, TrendingUp, TrendingDown, Minus, Brain } from "lucide-react";
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

  const getTrendIcon = (direction?: string) => {
    switch (direction) {
      case 'increasing':
        return <TrendingUp className="h-5 w-5 text-destructive" />;
      case 'decreasing':
        return <TrendingDown className="h-5 w-5 text-primary" />;
      default:
        return <Minus className="h-5 w-5 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Latest Prediction Summary */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Latest Risk Score</CardTitle>
            {getTrendIcon(predictions[0].trendDirection)}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{predictions[0].riskScore.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Trend: {predictions[0].trendDirection || 'stable'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Probability</CardTitle>
            <Brain className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(predictions[0].probability * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Confidence-adjusted likelihood
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Severity Level</CardTitle>
            <AlertCircle className={`h-5 w-5 ${
              predictions[0].predictedSeverity === 'critical' ? 'text-destructive' :
              predictions[0].predictedSeverity === 'high' ? 'text-orange-500' :
              predictions[0].predictedSeverity === 'medium' ? 'text-yellow-500' :
              'text-primary'
            }`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">
              {predictions[0].predictedSeverity}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Predicted impact level
            </p>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>AI Analysis Insights</CardTitle>
          <Brain className="h-5 w-5 text-primary" />
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {predictions[0].aiInsights || "No AI insights available at this time."}
          </p>
          {predictions[0].indicators?.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">Key Indicators:</h4>
              <ul className="list-disc list-inside text-sm text-muted-foreground">
                {predictions[0].indicators.map((indicator, index) => (
                  <li key={index}>{indicator}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Risk Timeline */}
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

      {/* Risk Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Risk Distribution Analysis</CardTitle>
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