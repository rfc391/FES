import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { useMediaQuery } from '@/hooks/use-mobile';

interface Node {
  id: string;
  label: string;
  x: number;
  y: number;
  size: number;
  color: string;
}

interface Edge {
  source: string;
  target: string;
  id: string;
  size: number;
}

interface WorkflowData {
  nodes: Node[];
  edges: Edge[];
  last_updated: string;
}

export function WorkflowViz() {
  const svgRef = useRef<SVGSVGElement>(null);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [tooltipContent, setTooltipContent] = useState<{ content: string; x: number; y: number } | null>(null);

  const { data: workflowData, isLoading, error } = useQuery<WorkflowData>({
    queryKey: ['/api/workflow-status'],
    refetchInterval: 5000 // Refresh every 5 seconds
  });

  useEffect(() => {
    if (!workflowData || !svgRef.current) return;

    const container = svgRef.current.parentElement;
    const width = container?.clientWidth || 800;
    const height = isMobile ? 300 : 400;

    // Clear previous visualization
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current)
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("preserveAspectRatio", "xMidYMid meet");

    // Add background
    svg.append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "hsl(var(--background))");

    // Calculate node positions based on screen size
    const nodeSpacing = width / (workflowData.nodes.length + 1);
    workflowData.nodes.forEach((node, i) => {
      node.x = nodeSpacing * (i + 1);
      node.y = height / 2;
    });

    // Draw edges first
    workflowData.edges.forEach(edge => {
      const sourceNode = workflowData.nodes.find(n => n.id === edge.source);
      const targetNode = workflowData.nodes.find(n => n.id === edge.target);

      if (sourceNode && targetNode) {
        // Create gradient for edges
        const gradient = svg.append("defs")
          .append("linearGradient")
          .attr("id", `gradient-${edge.id}`)
          .attr("x1", "0%")
          .attr("y1", "0%")
          .attr("x2", "100%")
          .attr("y2", "0%");

        gradient.append("stop")
          .attr("offset", "0%")
          .attr("stop-color", sourceNode.color);

        gradient.append("stop")
          .attr("offset", "100%")
          .attr("stop-color", targetNode.color);

        // Draw edge with gradient
        svg.append("line")
          .attr("x1", sourceNode.x)
          .attr("y1", sourceNode.y)
          .attr("x2", targetNode.x)
          .attr("y2", targetNode.y)
          .attr("stroke", `url(#gradient-${edge.id})`)
          .attr("stroke-width", edge.size)
          .attr("opacity", 0.6);
      }
    });

    // Draw nodes
    workflowData.nodes.forEach(node => {
      const nodeSize = isMobile ? node.size * 0.8 : node.size;

      // Add glow effect
      const glow = svg.append("circle")
        .attr("cx", node.x)
        .attr("cy", node.y)
        .attr("r", nodeSize + 4)
        .attr("fill", "none")
        .attr("stroke", node.color)
        .attr("stroke-opacity", 0.3)
        .attr("filter", "blur(4px)");

      // Add node
      const nodeGroup = svg.append("g")
        .attr("transform", `translate(${node.x},${node.y})`);

      // Make nodes interactive
      nodeGroup.append("circle")
        .attr("r", nodeSize)
        .attr("fill", node.color)
        .attr("opacity", 0.9)
        .style("cursor", "pointer")
        .on("touchstart", (event) => {
          event.preventDefault();
          const touch = event.touches[0];
          setTooltipContent({
            content: node.label,
            x: touch.clientX,
            y: touch.clientY - 40
          });
        })
        .on("touchend", () => setTooltipContent(null))
        .on("mouseover", (event) => {
          setTooltipContent({
            content: node.label,
            x: event.clientX,
            y: event.clientY - 40
          });
        })
        .on("mouseout", () => setTooltipContent(null));

      // Add label only on desktop
      if (!isMobile) {
        nodeGroup.append("text")
          .attr("text-anchor", "middle")
          .attr("dy", "0.3em")
          .attr("fill", "hsl(var(--foreground))")
          .attr("font-size", "12px")
          .text(node.label);
      }
    });

  }, [workflowData, isMobile]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>CI/CD Workflow Status</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>CI/CD Workflow Status</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">Failed to load workflow status</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>CI/CD Workflow Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative w-full aspect-[2/1] bg-background rounded-lg border border-border/50">
          <svg ref={svgRef} className="w-full h-full" />
          {tooltipContent && (
            <div
              className="absolute pointer-events-none bg-background border border-border rounded-md px-2 py-1 text-sm"
              style={{
                left: tooltipContent.x,
                top: tooltipContent.y,
                transform: 'translate(-50%, -100%)'
              }}
            >
              {tooltipContent.content}
            </div>
          )}
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          Last updated: {workflowData?.last_updated ? new Date(workflowData.last_updated).toLocaleString() : 'Never'}
        </p>
      </CardContent>
    </Card>
  );
}