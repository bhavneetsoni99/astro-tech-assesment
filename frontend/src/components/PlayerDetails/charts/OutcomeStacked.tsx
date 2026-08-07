import React, { useEffect, useMemo, useRef } from "react";
import * as d3 from "d3";
import { Pitch } from "../../../types";
import { CHART_COLORS, MARGIN, OUTCOME_COLORS, useResize } from "../../../utils";
import chartStyles from "../../../styles/charts.module.css";

interface Props {
  pitches: Pitch[];
}

export const OutcomeStacked: React.FC<Props> = ({ pitches }) => {
  const { containerRef, dimensions } = useResize(0.55);
  const svgRef = useRef<SVGSVGElement>(null);

  const chartData = useMemo(() => {
    const groups: Record<string, Record<string, number>> = {};
    pitches.forEach(p => {
      const name = p.pitch_name || "Unknown";
      const outcome = p.type || "Unknown";
      if (!groups[name]) groups[name] = {};
      groups[name][outcome] = (groups[name][outcome] || 0) + 1;
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
    if (!svgRef.current || dimensions.width === 0 || chartData.series.length === 0) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const innerW = dimensions.width - MARGIN.left - MARGIN.right - 70;
    const innerH = dimensions.height - MARGIN.top - MARGIN.bottom;

    const g = svg.append("g").attr("transform", `translate(${MARGIN.left},${MARGIN.top})`);
    const { series, outcomes } = chartData;

    const xScale = d3.scaleBand<string>().domain(series.map(d => d.name)).range([0, innerW]).padding(0.2);
    const yScale = d3.scaleLinear().domain([0, d3.max(series, d => d.total)! * 1.1]).range([innerH, 0]);

    const color = d3.scaleOrdinal<string>().domain(outcomes).range(outcomes.map(o => OUTCOME_COLORS[o] || CHART_COLORS.muted));
    const stacked = d3.stack<Record<string, number | string>>().keys(outcomes)(series as unknown as Record<string, number>[]);

    g.append("g").attr("transform", `translate(0,${innerH})`)
      .call(d3.axisBottom(xScale))
      .selectAll("text").attr("fill", CHART_COLORS.muted).attr("font-size", "9px").attr("transform", "rotate(-25)").style("text-anchor", "end");
    g.selectAll(".domain, .tick line").attr("stroke", CHART_COLORS.border);
    g.append("g").call(d3.axisLeft(yScale).ticks(5))
      .selectAll("text").attr("fill", CHART_COLORS.muted).attr("font-size", "10px");
    g.selectAll(".domain, .tick line").attr("stroke", CHART_COLORS.border);

    const tooltip = d3.select(containerRef.current)
      .append("div").attr("class", chartStyles.tooltip).style("display", "none");

    const legendLabels: Record<string, string> = { S: "Strike", B: "Ball", X: "In-Play" };
    stacked.forEach(layer => {
      g.selectAll(`rect.${layer.key}`)
        .data(layer)
        .enter()
        .append("rect")
        .attr("x", d => xScale((d.data as unknown as { name: string }).name)!)
        .attr("y", d => yScale(d[1]))
        .attr("width", xScale.bandwidth())
        .attr("height", d => yScale(d[0]) - yScale(d[1]))
        .attr("fill", color(layer.key as string))
        .attr("opacity", 0.85)
        .on("mouseover", function (_event, d) {
          d3.select(this).attr("opacity", 1);
          const diff = d[1] - d[0];
          const name = (d.data as unknown as { name: string }).name;
          tooltip.style("display", "block")
            .html(`<strong>${name}</strong> · ${legendLabels[layer.key as string] || layer.key}<br/>${diff.toLocaleString()} pitches`);
        })
        .on("mousemove", function (event) {
          const rect = containerRef.current!.getBoundingClientRect();
          tooltip.style("left", `${event.clientX - rect.left + 12}px`).style("top", `${event.clientY - rect.top - 10}px`);
        })
        .on("mouseleave", function () {
          d3.select(this).attr("opacity", 0.85);
          tooltip.style("display", "none");
        });
    });

    const legendG = g.append("g").attr("transform", `translate(${innerW + 8}, 0)`);
    outcomes.forEach((o, i) => {
      const row = legendG.append("g").attr("transform", `translate(0, ${i * 20})`);
      row.append("rect").attr("width", 12).attr("height", 12).attr("fill", color(o)).attr("rx", 2).attr("opacity", 0.85);
      row.append("text").attr("x", 18).attr("y", 10).attr("fill", CHART_COLORS.text).attr("font-size", "10px").text(legendLabels[o] || o);
    });

    return () => { tooltip.remove(); };
  }, [chartData, dimensions, containerRef]);

  return <div ref={containerRef} className={chartStyles.chartContainer}><svg ref={svgRef} width={dimensions.width} height={dimensions.height} /></div>;
};
