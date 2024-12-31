import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useThreats } from "@/hooks/use-threats";
import { useUser } from "@/hooks/use-user";
import { AlertCircle, LogOut, Shield } from "lucide-react";
import * as d3 from "d3";

export default function Dashboard() {
  const { threats } = useThreats();
  const { user, logout } = useUser();

  useEffect(() => {
    if (threats.length > 0) {
      renderThreatMap();
    }
  }, [threats]);

  function renderThreatMap() {
    const width = 800;
    const height = 400;

    d3.select("#threat-map").selectAll("*").remove();

    const svg = d3.select("#threat-map")
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    // Create world map visualization
    svg.append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "#0a192f");

    // Plot threat points
    threats.forEach((threat) => {
      svg.append("circle")
        .attr("cx", (threat.longitude + 180) * (width / 360))
        .attr("cy", (90 - threat.latitude) * (height / 180))
        .attr("r", 5)
        .attr("fill", threat.severity === "high" ? "#ef4444" : "#fbbf24")
        .attr("opacity", 0.8);
    });
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">Cyber Command</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Welcome, {user?.username}
            </span>
            <Button variant="outline" size="sm" onClick={() => logout()}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 grid gap-4 grid-cols-1 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Global Threat Map</CardTitle>
          </CardHeader>
          <CardContent>
            <div id="threat-map" className="w-full aspect-video bg-sidebar rounded-lg" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Threats</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px]">
              {threats.map((threat, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 p-3 border-b border-border last:border-0"
                >
                  <AlertCircle className={
                    threat.severity === "high" ? "text-destructive" : "text-warning"
                  } />
                  <div>
                    <p className="font-medium">{threat.type}</p>
                    <p className="text-sm text-muted-foreground">
                      {threat.location} - {threat.timestamp}
                    </p>
                  </div>
                </div>
              ))}
            </ScrollArea>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
