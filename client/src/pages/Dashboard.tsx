import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useThreats } from "@/hooks/use-threats";
import { useUser } from "@/hooks/use-user";
import { AlertCircle, LogOut, Shield, Activity, Search, Filter, AlertTriangle } from "lucide-react";
import * as d3 from "d3";
import { scaleLinear } from "d3";

export default function Dashboard() {
  const { threats } = useThreats();
  const { user, logout } = useUser();
  const [filteredThreats, setFilteredThreats] = useState(threats);
  const [searchTerm, setSearchTerm] = useState("");
  const [severityFilter, setSeverityFilter] = useState<string>("all");

  useEffect(() => {
    const filtered = threats.filter(threat => {
      const matchesSearch = threat.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            threat.location.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSeverity = severityFilter === "all" || threat.severity === severityFilter;
      return matchesSearch && matchesSeverity;
    });
    setFilteredThreats(filtered);

    if (filtered.length > 0) {
      renderThreatMap(filtered);
    }
  }, [threats, searchTerm, severityFilter]);

  function renderThreatMap(threatData: any[]) {
    const width = 800;
    const height = 400;
    const cellSize = 20; // Size of each heatmap cell

    d3.select("#threat-map").selectAll("*").remove();

    const svg = d3.select("#threat-map")
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    // Background
    svg.append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "hsl(var(--background))");

    // Create grid for heatmap
    const gridData = [];
    for (let x = 0; x < width; x += cellSize) {
      for (let y = 0; y < height; y += cellSize) {
        gridData.push({ x, y, count: 0 });
      }
    }

    // Count threats in each cell
    threatData.forEach(threat => {
      const x = Math.floor((threat.longitude + 180) * (width / 360) / cellSize) * cellSize;
      const y = Math.floor((90 - threat.latitude) * (height / 180) / cellSize) * cellSize;
      const cell = gridData.find(cell => cell.x === x && cell.y === y);
      if (cell) {
        cell.count++;
      }
    });

    // Color scale for heatmap
    const maxCount = Math.max(...gridData.map(d => d.count));
    const colorScale = scaleLinear<string>()
      .domain([0, maxCount])
      .range(["hsl(var(--background))", "hsl(var(--destructive))"]);

    // Draw heatmap cells with animation
    svg.selectAll("rect.heatmap-cell")
      .data(gridData)
      .join("rect")
      .attr("class", "heatmap-cell")
      .attr("x", d => d.x)
      .attr("y", d => d.y)
      .attr("width", cellSize)
      .attr("height", cellSize)
      .attr("fill", d => colorScale(d.count))
      .attr("opacity", 0)
      .transition()
      .duration(1000)
      .attr("opacity", d => d.count ? 0.6 : 0);

    // Add grid lines with animation
    const gridColor = "hsl(var(--muted-foreground) / 0.2)";
    for (let i = 0; i <= width; i += 80) {
      svg.append("line")
        .attr("x1", i)
        .attr("y1", 0)
        .attr("x2", i)
        .attr("y2", height)
        .attr("stroke", gridColor)
        .attr("stroke-width", 0.5)
        .style("opacity", 0)
        .transition()
        .duration(1000)
        .style("opacity", 1);
    }
    for (let i = 0; i <= height; i += 40) {
      svg.append("line")
        .attr("x1", 0)
        .attr("y1", i)
        .attr("x2", width)
        .attr("y2", i)
        .attr("stroke", gridColor)
        .attr("stroke-width", 0.5)
        .style("opacity", 0)
        .transition()
        .duration(1000)
        .style("opacity", 1);
    }

    // Plot individual threat points with enhanced animations
    threatData.forEach((threat, index) => {
      const radius = threat.severity === "high" ? 6 : 4;
      const delay = index * 100;

      // Glow effect
      const glow = svg.append("circle")
        .attr("cx", (threat.longitude + 180) * (width / 360))
        .attr("cy", (90 - threat.latitude) * (height / 180))
        .attr("r", radius + 2)
        .attr("fill", "none")
        .attr("stroke", threat.severity === "high" ?
          "hsl(var(--destructive))" : "hsl(var(--warning))")
        .attr("stroke-opacity", 0.3)
        .attr("filter", "blur(3px)")
        .style("opacity", 0);

      // Threat point
      const point = svg.append("circle")
        .attr("cx", (threat.longitude + 180) * (width / 360))
        .attr("cy", (90 - threat.latitude) * (height / 180))
        .attr("r", 0)
        .attr("fill", threat.severity === "high" ?
          "hsl(var(--destructive))" : "hsl(var(--warning))")
        .attr("opacity", 0.9);

      // Animate entrance
      glow.transition()
        .delay(delay)
        .duration(500)
        .style("opacity", 1);

      point.transition()
        .delay(delay)
        .duration(500)
        .attr("r", radius);

      // Pulse animation for high severity threats
      if (threat.severity === "high") {
        glow.transition()
          .delay(delay)
          .duration(1500)
          .attr("r", radius + 4)
          .attr("stroke-opacity", 0.1)
          .ease(d3.easeLinear)
          .on("end", function repeat() {
            d3.select(this)
              .attr("r", radius + 2)
              .attr("stroke-opacity", 0.3)
              .transition()
              .duration(1500)
              .attr("r", radius + 4)
              .attr("stroke-opacity", 0.1)
              .ease(d3.easeLinear)
              .on("end", repeat);
          });
      }
    });

    // Add legend
    const legendWidth = 200;
    const legendHeight = 20;
    const legend = svg.append("g")
      .attr("transform", `translate(${width - legendWidth - 20}, ${height - 40})`);

    const legendScale = scaleLinear()
      .domain([0, maxCount])
      .range([0, legendWidth]);

    const legendAxis = d3.axisBottom(legendScale)
      .ticks(5)
      .tickSize(legendHeight);

    legend.append("g")
      .call(legendAxis)
      .select(".domain")
      .remove();

    const legendGradient = legend.append("defs")
      .append("linearGradient")
      .attr("id", "legend-gradient")
      .attr("x1", "0%")
      .attr("x2", "100%")
      .attr("y1", "0%")
      .attr("y2", "0%");

    legendGradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "hsl(var(--background))");

    legendGradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "hsl(var(--destructive))");

    legend.append("rect")
      .attr("width", legendWidth)
      .attr("height", legendHeight)
      .style("fill", "url(#legend-gradient)")
      .style("opacity", 0.6);
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/50 backdrop-blur-sm bg-background/95 sticky top-0 z-50">
        <div className="container mx-auto flex justify-between items-center h-16 px-4">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">Cyber Command</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Welcome, {user?.username}
              </span>
              {user?.riskScore > 50 && (
                <div className="flex items-center gap-1 text-sm text-destructive" title="High risk score detected">
                  <AlertTriangle className="h-4 w-4" />
                  Risk Score: {user.riskScore}
                </div>
              )}
              {user?.status !== 'active' && (
                <div className="text-sm text-warning">
                  Account Status: {user.status}
                </div>
              )}
            </div>
            <Button variant="outline" size="sm" onClick={() => logout()}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 space-y-4">
        <div className="flex gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search threats..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <Select value={severityFilter} onValueChange={setSeverityFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severities</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
          <Card className="lg:col-span-2 border-border/50 bg-card/95 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Global Threat Map
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div id="threat-map" className="w-full aspect-video bg-background rounded-lg border border-border/50" />
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/95 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Active Threats ({filteredThreats.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px] pr-4">
                {filteredThreats.map((threat, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 p-3 border-b border-border/50 last:border-0 hover:bg-muted/50 transition-colors"
                  >
                    <AlertCircle className={
                      threat.severity === "high"
                        ? "text-destructive animate-pulse"
                        : "text-warning"
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
        </div>
      </main>
    </div>
  );
}