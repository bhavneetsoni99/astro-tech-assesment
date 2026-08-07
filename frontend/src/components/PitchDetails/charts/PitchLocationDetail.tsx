import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { Pitch } from "../../../types";
import { CHART_COLORS, OUTCOME_COLORS } from "../../../utils";
import chartStyles from "../../../styles/charts.module.css";

interface Props {
  pitch: Pitch;
}

export const PitchLocationDetail: React.FC<Props> = ({ pitch }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 400, height: 400 });

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver(entries => {
      const { width } = entries[0].contentRect;
      const size = Math.min(width, 400);
      setDimensions({ width: size, height: size });
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!svgRef.current || dimensions.width === 0) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const size = dimensions.width;
    const margin = 30;
    const innerSize = size - margin * 2;
    const g = svg.append("g").attr("transform", `translate(${margin},${margin})`);

    const xScale = d3.scaleLinear().domain([-2, 2]).range([0, innerSize]);
    const yScale = d3.scaleLinear().domain([5, 0.5]).range([0, innerSize]);

    const strikeZone = { x1: -0.83, x2: 0.83, y1: 1.5, y2: 3.5 };

    g.append("rect")
      .attr("x", xScale(strikeZone.x1)).attr("y", yScale(strikeZone.y2))
      .attr("width", xScale(strikeZone.x2) - xScale(strikeZone.x1))
      .attr("height", yScale(strikeZone.y1) - yScale(strikeZone.y2))
      .attr("fill", "none").attr("stroke", CHART_COLORS.border).attr("stroke-width", 2);

    const zoneWidth = (xScale(strikeZone.x2) - xScale(strikeZone.x1)) / 3;
    const zoneHeight = (yScale(strikeZone.y1) - yScale(strikeZone.y2)) / 3;

    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (i === 0 && j === 0) continue;
        g.append("rect")
          .attr("x", xScale(strikeZone.x1) + i * zoneWidth)
          .attr("y", yScale(strikeZone.y1) - (j + 1) * zoneHeight)
          .attr("width", zoneWidth).attr("height", zoneHeight)
          .attr("fill", "none").attr("stroke", CHART_COLORS.border).attr("stroke-width", 0.5).attr("stroke-dasharray", "2,2");
      }
    }

    g.append("g").attr("transform", `translate(0,${innerSize})`)
      .call(d3.axisBottom(xScale).ticks(5).tickFormat(d => `${d}`))
      .selectAll("text").attr("fill", CHART_COLORS.muted).attr("font-size", "9px");
    g.selectAll(".domain, .tick line").attr("stroke", CHART_COLORS.border);

    g.append("g")
      .call(d3.axisLeft(yScale).ticks(5).tickFormat(d => `${d}`))
      .selectAll("text").attr("fill", CHART_COLORS.muted).attr("font-size", "9px");
    g.selectAll(".domain, .tick line").attr("stroke", CHART_COLORS.border);

    g.append("text").attr("x", innerSize / 2).attr("y", innerSize + 22)
      .attr("text-anchor", "middle").attr("fill", CHART_COLORS.muted).attr("font-size", "10px").text("Plate X");
    g.append("text").attr("x", -22).attr("y", innerSize / 2)
      .attr("text-anchor", "middle").attr("fill", CHART_COLORS.muted).attr("font-size", "10px")
      .attr("transform", "rotate(-90)").text("Plate Z");

    if (pitch.plate_x != null && pitch.plate_z != null) {
      const dotColor = pitch.type === "S" ? OUTCOME_COLORS.S : pitch.type === "B" ? OUTCOME_COLORS.orange : CHART_COLORS.muted;
      g.append("circle")
        .attr("cx", xScale(pitch.plate_x)).attr("cy", yScale(pitch.plate_z))
        .attr("r", 8)
        .attr("fill", dotColor)
        .attr("stroke", "white")
        .attr("stroke-width", 2.5)
        .attr("opacity", 0.9);

      const label = pitch.type === "S" ? "Strike" : pitch.type === "B" ? "Ball" : pitch.type === "X" ? "In-Play" : "";
      g.append("text")
        .attr("x", xScale(pitch.plate_x)).attr("y", yScale(pitch.plate_z) - 14)
        .attr("text-anchor", "middle")
        .attr("fill", dotColor)
        .attr("font-size", "10px")
        .attr("font-weight", "700")
        .text(label);
    }
  }, [pitch, dimensions]);

  return <div ref={containerRef} className={chartStyles.chartContainer}><svg ref={svgRef} width={dimensions.width} height={dimensions.height} /></div>;
};
