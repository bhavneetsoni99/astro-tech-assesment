import React, { useEffect, useMemo, useRef, useState } from "react";
import * as d3 from "d3";
import { Pitch } from "../../../types";
import { CHART_COLORS, MARGIN, OUTCOME_COLORS } from "../../../utils";
import chartStyles from "../../../styles/charts.module.css";

interface Props {
  pitches: Pitch[];
}

export const OutcomeStackedChart: React.FC<Props> = ({ pitches }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 350 });

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      const { width } = entries[0].contentRect;
      setDimensions({ width, height: Math.min(width * 0.5, 350) });
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const stackData = useMemo(() => {
    const groups: Record<string, Record<string, number>> = {};
    pitches.forEach(p => {
      const type = p.pitch_name || p.pitch_type || "Unknown";
      const outcome = p.type || "Unknown";
      if (!groups[type]) groups[type] = {};
      groups[type][outcome] = (groups[type][outcome] || 0) + 1;
    });

    const outcomes = [...new Set(pitches.map(p => p.type || "Unknown"))].sort();

    const series = Object.entries(groups)
      .map(([name, counts]) => ({
        name,
        ...Object.fromEntries(outcomes.map(o => [o, counts[o] || 0])),
        total: Object.values(counts).reduce((a, b) => a + b, 0),
      }))
      .sort((a, b) => b.total - a.total);

    return { series, outcomes };
  }, [pitches]);

  useEffect(() => {
    if (!svgRef.current || dimensions.width === 0 || stackData.series.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const innerW = dimensions.width - MARGIN.left - MARGIN.right - 80;
    const innerH = dimensions.height - MARGIN.top - MARGIN.bottom;

    const g = svg.append("g").attr("transform", `translate(${MARGIN.left},${MARGIN.top})`);

    const { series, outcomes } = stackData;

    const xScale = d3.scaleBand<string>()
      .domain(series.map(d => d.name))
      .range([0, innerW])
      .padding(0.2);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(series, d => d.total)! * 1.1])
      .range([innerH, 0]);

    const colorScale = d3.scaleOrdinal<string>()
      .domain(outcomes)
      .range(outcomes.map(o => OUTCOME_COLORS[o] || CHART_COLORS.muted));

    const stacked = d3.stack<Record<string, number | string>>()
      .keys(outcomes)(series as unknown as Record<string, number>[]);

    g.append("g")
      .attr("transform", `translate(0,${innerH})`)
      .call(d3.axisBottom(xScale))
      .selectAll("text")
      .attr("fill", CHART_COLORS.muted)
      .attr("font-size", "10px")
      .attr("transform", "rotate(-30)")
      .style("text-anchor", "end");
    g.selectAll(".domain, .tick line").attr("stroke", CHART_COLORS.border);

    g.append("g")
      .call(d3.axisLeft(yScale).ticks(6))
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
      .text("Pitches");

    const tooltip = d3.select(containerRef.current)
      .append("div")
      .attr("class", chartStyles.tooltip)
      .style("display", "none");

    stacked.forEach(layer => {
      g.selectAll(`rect.${layer.key}`)
        .data(layer)
        .enter()
        .append("rect")
        .attr("class", layer.key as string)
        .attr("x", d => xScale((d.data as unknown as { name: string }).name)!)
        .attr("y", d => yScale(d[1]))
        .attr("width", xScale.bandwidth())
        .attr("height", d => yScale(d[0]) - yScale(d[1]))
        .attr("fill", colorScale(layer.key as string))
        .attr("opacity", 0.85)
        .on("mouseover", function (_event, d) {
          d3.select(this).attr("opacity", 1);
          const diff = d[1] - d[0];
          const name = (d.data as unknown as { name: string }).name;
          const outcomeLabel = layer.key === "S" ? "Strike" : layer.key === "B" ? "Ball" : layer.key === "X" ? "In-Play" : layer.key as string;
          tooltip
            .style("display", "block")
            .html(`<strong>${name}</strong> · ${outcomeLabel}<br/>${diff.toLocaleString()} pitches`);
        })
        .on("mousemove", function (event) {
          const rect = containerRef.current!.getBoundingClientRect();
          tooltip
            .style("left", `${event.clientX - rect.left + 12}px`)
            .style("top", `${event.clientY - rect.top - 10}px`);
        })
        .on("mouseleave", function () {
          d3.select(this).attr("opacity", 0.85);
          tooltip.style("display", "none");
        });
    });

    const legendG = g.append("g").attr("transform", `translate(${innerW + 12}, 0)`);
    const legendLabels: Record<string, string> = { S: "Strike", B: "Ball", X: "In-Play" };
    outcomes.forEach((o, i) => {
      const row = legendG.append("g").attr("transform", `translate(0, ${i * 22})`);
      row.append("rect")
        .attr("width", 14)
        .attr("height", 14)
        .attr("fill", colorScale(o))
        .attr("rx", 2)
        .attr("opacity", 0.85);
      row.append("text")
        .attr("x", 20)
        .attr("y", 12)
        .attr("fill", CHART_COLORS.text)
        .attr("font-size", "11px")
        .text(legendLabels[o] || o);
    });

    return () => {
      tooltip.remove();
    };
  }, [stackData, dimensions]);

  return (
    <div ref={containerRef} className={chartStyles.chartContainer}>
      <svg ref={svgRef} width={dimensions.width} height={dimensions.height} />
    </div>
  );
};
