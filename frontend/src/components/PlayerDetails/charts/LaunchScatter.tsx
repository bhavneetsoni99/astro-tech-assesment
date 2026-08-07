import React, { useEffect, useMemo, useRef } from "react";
import * as d3 from "d3";
import { Pitch } from "../../../types";
import { CHART_COLORS, MARGIN, useResize } from "../../../utils";
import chartStyles from "../../../styles/charts.module.css";

interface Props {
  pitches: Pitch[];
}

export const LaunchScatter: React.FC<Props> = ({ pitches }) => {
  const { containerRef, dimensions } = useResize(0.5);
  const svgRef = useRef<SVGSVGElement>(null);

  const data = useMemo(() =>
    pitches
      .filter(p => p.launch_speed != null && p.launch_angle != null)
      .map(p => ({
        speed: Number(p.launch_speed),
        angle: Number(p.launch_angle),
        distance: p.hit_distance_sc ? Number(p.hit_distance_sc) : null,
        event: p.events?.replace(/_/g, " ") || "",
      }))
      .filter(d => !isNaN(d.speed) && !isNaN(d.angle) && d.speed > 0),
  [pitches]);

  useEffect(() => {
    if (!svgRef.current || dimensions.width === 0 || data.length === 0) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const innerW = dimensions.width - MARGIN.left - MARGIN.right;
    const innerH = dimensions.height - MARGIN.top - MARGIN.bottom;
    const g = svg.append("g").attr("transform", `translate(${MARGIN.left},${MARGIN.top})`);

    const xScale = d3.scaleLinear()
      .domain([d3.min(data, d => d.speed)! - 5, d3.max(data, d => d.speed)! + 5])
      .range([0, innerW]);
    const yScale = d3.scaleLinear()
      .domain([d3.min(data, d => d.angle)! - 5, d3.max(data, d => d.angle)! + 5])
      .range([innerH, 0]);
    const rScale = d3.scaleSqrt()
      .domain([0, d3.max(data, d => d.distance || 0)!])
      .range([3, 12]);

    g.append("g").attr("transform", `translate(0,${innerH})`)
      .call(d3.axisBottom(xScale).ticks(6))
      .selectAll("text").attr("fill", CHART_COLORS.muted).attr("font-size", "10px");
    g.selectAll(".domain, .tick line").attr("stroke", CHART_COLORS.border);
    g.append("g")
      .call(d3.axisLeft(yScale).ticks(6))
      .selectAll("text").attr("fill", CHART_COLORS.muted).attr("font-size", "10px");
    g.selectAll(".domain, .tick line").attr("stroke", CHART_COLORS.border);

    g.append("text").attr("x", innerW / 2).attr("y", innerH + 34)
      .attr("text-anchor", "middle").attr("fill", CHART_COLORS.muted).attr("font-size", "10px").text("Launch Speed (mph)");
    g.append("text").attr("x", -innerH / 2).attr("y", -38)
      .attr("text-anchor", "middle").attr("fill", CHART_COLORS.muted).attr("font-size", "10px")
      .attr("transform", "rotate(-90)").text("Launch Angle (°)");

    const tooltip = d3.select(containerRef.current)
      .append("div").attr("class", chartStyles.tooltip).style("display", "none");

    g.selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", d => xScale(d.speed)).attr("cy", d => yScale(d.angle))
      .attr("r", d => d.distance ? rScale(d.distance) : 4)
      .attr("fill", CHART_COLORS.orange)
      .attr("opacity", 0.6)
      .on("mouseover", function (_event, d) {
        d3.select(this).attr("opacity", 1);
        tooltip.style("display", "block")
          .html(`<strong>${d.event || "In-Play"}</strong><br/>Speed: ${d.speed.toFixed(1)} mph · Angle: ${d.angle.toFixed(1)}°${d.distance ? ` · ${d.distance} ft` : ""}`);
      })
      .on("mousemove", function (event) {
        const rect = containerRef.current!.getBoundingClientRect();
        tooltip.style("left", `${event.clientX - rect.left + 12}px`).style("top", `${event.clientY - rect.top - 10}px`);
      })
      .on("mouseleave", function () {
        d3.select(this).attr("opacity", 0.6);
        tooltip.style("display", "none");
      });

    return () => { tooltip.remove(); };
  }, [data, dimensions, containerRef]);

  return <div ref={containerRef} className={chartStyles.chartContainer}><svg ref={svgRef} width={dimensions.width} height={dimensions.height} /></div>;
};
