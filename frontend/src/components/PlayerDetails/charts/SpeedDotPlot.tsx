import React, { useEffect, useMemo, useRef } from "react";
import * as d3 from "d3";
import { Pitch } from "../../../types";
import { CATEGORICAL_COLORS, CHART_COLORS, MARGIN, useResize } from "../../../utils";
import chartStyles from "../../../styles/charts.module.css";

interface Props {
  pitches: Pitch[];
}

export const SpeedDotPlot: React.FC<Props> = ({ pitches }) => {
  const { containerRef, dimensions } = useResize(0.6);
  const svgRef = useRef<SVGSVGElement>(null);

  const data = useMemo(() => {
    const grouped: Record<string, number[]> = {};
    pitches.forEach(p => {
      const speed = Number(p.release_speed);
      if (isNaN(speed) || speed <= 0) return;
      const name = p.pitch_name || "Unknown";
      if (!grouped[name]) grouped[name] = [];
      grouped[name].push(speed);
    });
    return Object.entries(grouped)
      .map(([name, speeds]) => ({ name, speeds, avg: d3.mean(speeds)!, count: speeds.length }))
      .sort((a, b) => b.count - a.count);
  }, [pitches]);

  useEffect(() => {
    if (!svgRef.current || dimensions.width === 0 || data.length === 0) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const innerW = dimensions.width - MARGIN.left - MARGIN.right - 60;
    const innerH = dimensions.height - MARGIN.top - MARGIN.bottom;

    const g = svg.append("g").attr("transform", `translate(${MARGIN.left},${MARGIN.top})`);

    const names = data.map(d => d.name);
    const allSpeeds = data.flatMap(d => d.speeds);
    const xScale = d3.scaleLinear()
      .domain([d3.min(allSpeeds)! - 2, d3.max(allSpeeds)! + 2])
      .range([0, innerW]);
    const yScale = d3.scalePoint<string>().domain(names).range([10, innerH - 10]).padding(0.3);
    const color = d3.scaleOrdinal<string>().domain(names).range(CATEGORICAL_COLORS);

    g.append("g")
      .attr("transform", `translate(0,${innerH})`)
      .call(d3.axisBottom(xScale).ticks(6))
      .selectAll("text").attr("fill", CHART_COLORS.muted).attr("font-size", "10px");
    g.selectAll(".domain, .tick line").attr("stroke", CHART_COLORS.border);

    g.append("g")
      .call(d3.axisLeft(yScale))
      .selectAll("text").attr("fill", CHART_COLORS.muted).attr("font-size", "10px");
    g.selectAll(".domain, .tick line").attr("stroke", CHART_COLORS.border);

    g.append("text")
      .attr("x", innerW / 2).attr("y", innerH + 34)
      .attr("text-anchor", "middle").attr("fill", CHART_COLORS.muted)
      .attr("font-size", "10px").text("Release Speed (mph)");

    const tooltip = d3.select(containerRef.current)
      .append("div").attr("class", chartStyles.tooltip).style("display", "none");

    data.forEach(d => {
      const yPos = yScale(d.name)!;
      const grouped = d3.bin().thresholds(10)(d.speeds);
      g.selectAll(`circle.${d.name.replace(/\s+/g, "")}`)
        .data(grouped)
        .enter()
        .append("circle")
        .attr("cx", b => xScale((b.x0! + b.x1!) / 2))
        .attr("cy", yPos)
        .attr("r", b => Math.sqrt(b.length) * 2 + 2)
        .attr("fill", color(d.name))
        .attr("opacity", 0.6)
        .attr("stroke", "none")
        .on("mouseover", function (_event, b) {
          d3.select(this).attr("opacity", 1);
          tooltip.style("display", "block")
            .html(`<strong>${d.name}</strong><br/>${b.x0?.toFixed(1)}-${b.x1?.toFixed(1)} mph: ${b.length} pitches`);
        })
        .on("mousemove", function (event) {
          const rect = containerRef.current!.getBoundingClientRect();
          tooltip.style("left", `${event.clientX - rect.left + 12}px`).style("top", `${event.clientY - rect.top - 10}px`);
        })
        .on("mouseleave", function () {
          d3.select(this).attr("opacity", 0.6);
          tooltip.style("display", "none");
        });
    });

    return () => { tooltip.remove(); };
  }, [data, dimensions, containerRef]);

  return <div ref={containerRef} className={chartStyles.chartContainer}><svg ref={svgRef} width={dimensions.width} height={dimensions.height} /></div>;
};
