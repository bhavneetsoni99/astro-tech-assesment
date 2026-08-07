import React, { useEffect, useMemo, useRef, useState } from "react";
import * as d3 from "d3";
import { Player } from "../../../types";
import { CATEGORICAL_COLORS, CHART_COLORS, MARGIN } from "../../../utils";
import chartStyles from "../../../styles/charts.module.css";

interface Props {
  players: Player[];
}

export const PositionBarChart: React.FC<Props> = ({ players }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 350 });

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      const { width } = entries[0].contentRect;
      setDimensions({ width, height: Math.min(width * 0.6, 350) });
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const data = useMemo(() => {
    const counts: Record<string, number> = {};
    players.forEach(p => { counts[p.primary_position] = (counts[p.primary_position] || 0) + 1; });
    return Object.entries(counts)
      .map(([position, count]) => ({ position, count }))
      .sort((a, b) => b.count - a.count);
  }, [players]);

  useEffect(() => {
    if (!svgRef.current || dimensions.width === 0 || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const innerW = dimensions.width - MARGIN.left - MARGIN.right;
    const innerH = dimensions.height - MARGIN.top - MARGIN.bottom;

    const g = svg.append("g").attr("transform", `translate(${MARGIN.left},${MARGIN.top})`);

    const xScale = d3.scaleBand<string>()
      .domain(data.map(d => d.position))
      .range([0, innerW])
      .padding(0.3);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.count)! * 1.1])
      .range([innerH, 0]);

    const colorScale = d3.scaleOrdinal<string>()
      .domain(data.map(d => d.position))
      .range(CATEGORICAL_COLORS);

    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale).ticks(6);

    g.append("g")
      .attr("transform", `translate(0,${innerH})`)
      .call(xAxis)
      .selectAll("text")
      .attr("fill", CHART_COLORS.muted)
      .attr("font-size", "10px")
      .attr("transform", "rotate(-30)")
      .style("text-anchor", "end");
    g.selectAll(".domain, .tick line").attr("stroke", CHART_COLORS.border);

    g.append("g")
      .call(yAxis)
      .selectAll("text")
      .attr("fill", CHART_COLORS.muted)
      .attr("font-size", "11px");
    g.selectAll(".domain, .tick line").attr("stroke", CHART_COLORS.border);

    g.append("text")
      .attr("x", -innerH / 2)
      .attr("y", -40)
      .attr("text-anchor", "middle")
      .attr("fill", CHART_COLORS.muted)
      .attr("font-size", "11px")
      .attr("transform", "rotate(-90)")
      .text("Players");

    const tooltip = d3.select(containerRef.current)
      .append("div")
      .attr("class", chartStyles.tooltip)
      .style("display", "none");

    g.selectAll("rect")
      .data(data)
      .enter()
      .append("rect")
      .attr("x", d => xScale(d.position)!)
      .attr("y", d => yScale(d.count))
      .attr("width", xScale.bandwidth())
      .attr("height", d => innerH - yScale(d.count))
      .attr("fill", d => colorScale(d.position))
      .attr("rx", 3)
      .on("mouseover", function (_event, d) {
        d3.select(this).attr("opacity", 0.8);
        tooltip
          .style("display", "block")
          .html(`<strong>${d.position}</strong>: ${d.count} players`);
      })
      .on("mousemove", function (event) {
        const rect = containerRef.current!.getBoundingClientRect();
        tooltip
          .style("left", `${event.clientX - rect.left + 12}px`)
          .style("top", `${event.clientY - rect.top - 10}px`);
      })
      .on("mouseleave", function () {
        d3.select(this).attr("opacity", 1);
        tooltip.style("display", "none");
      });

    g.selectAll("text.value")
      .data(data)
      .enter()
      .append("text")
      .attr("class", "value")
      .attr("x", d => xScale(d.position)! + xScale.bandwidth() / 2)
      .attr("y", d => yScale(d.count) - 6)
      .attr("text-anchor", "middle")
      .attr("fill", CHART_COLORS.text)
      .attr("font-size", "11px")
      .attr("font-weight", "600")
      .text(d => d.count);

    return () => {
      tooltip.remove();
    };
  }, [data, dimensions]);

  return (
    <div ref={containerRef} className={chartStyles.chartContainer}>
      <svg ref={svgRef} width={dimensions.width} height={dimensions.height} />
    </div>
  );
};
