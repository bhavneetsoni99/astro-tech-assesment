import React, { useEffect, useMemo, useRef } from "react";
import * as d3 from "d3";
import { Pitch } from "../../../types";
import { CHART_COLORS, MARGIN, OUTCOME_COLORS, useResize } from "../../../utils";
import chartStyles from "../../../styles/charts.module.css";

interface Props {
  pitches: Pitch[];
}

export const PitchLocationChart: React.FC<Props> = ({ pitches }) => {
  const { containerRef, dimensions } = useResize(0.7);
  const svgRef = useRef<SVGSVGElement>(null);

  const data = useMemo(() =>
    pitches
      .filter(p => p.plate_x != null && p.plate_z != null)
      .map(p => ({ x: p.plate_x!, z: p.plate_z!, type: p.type || "", pitch_name: p.pitch_name || "" })),
  [pitches]);

  useEffect(() => {
    if (!svgRef.current || dimensions.width === 0 || data.length === 0) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const innerW = dimensions.width - MARGIN.left - MARGIN.right;
    const innerH = dimensions.height - MARGIN.top - MARGIN.bottom;
    const g = svg.append("g").attr("transform", `translate(${MARGIN.left},${MARGIN.top})`);

    const padding = 0.5;
    const xScale = d3.scaleLinear().domain([-2.5 - padding, 2.5 + padding]).range([0, innerW]);
    const yScale = d3.scaleLinear().domain([0.5 - padding, 4.5 + padding]).range([innerH, 0]);

    g.append("g").attr("transform", `translate(0,${innerH})`)
      .call(d3.axisBottom(xScale).ticks(5))
      .selectAll("text").attr("fill", CHART_COLORS.muted).attr("font-size", "10px");
    g.selectAll(".domain, .tick line").attr("stroke", CHART_COLORS.border);
    g.append("g")
      .call(d3.axisLeft(yScale).ticks(5))
      .selectAll("text").attr("fill", CHART_COLORS.muted).attr("font-size", "10px");
    g.selectAll(".domain, .tick line").attr("stroke", CHART_COLORS.border);

    g.append("text").attr("x", innerW / 2).attr("y", innerH + 34)
      .attr("text-anchor", "middle").attr("fill", CHART_COLORS.muted).attr("font-size", "10px").text("Plate X");
    g.append("text").attr("x", -innerH / 2).attr("y", -38)
      .attr("text-anchor", "middle").attr("fill", CHART_COLORS.muted).attr("font-size", "10px")
      .attr("transform", "rotate(-90)").text("Plate Z");

    const strikeZone = { x1: -0.83, x2: 0.83, y1: 1.5, y2: 3.5 };
    g.append("rect")
      .attr("x", xScale(strikeZone.x1)).attr("y", yScale(strikeZone.y2))
      .attr("width", xScale(strikeZone.x2) - xScale(strikeZone.x1))
      .attr("height", yScale(strikeZone.y1) - yScale(strikeZone.y2))
      .attr("fill", "none").attr("stroke", CHART_COLORS.muted).attr("stroke-width", 1.5).attr("stroke-dasharray", "4,3");

    const color = d3.scaleOrdinal<string>()
      .domain(["S", "B", "X"])
      .range([OUTCOME_COLORS.S, OUTCOME_COLORS.B, OUTCOME_COLORS.muted]);

    const tooltip = d3.select(containerRef.current)
      .append("div").attr("class", chartStyles.tooltip).style("display", "none");

    g.selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", d => xScale(d.x)).attr("cy", d => yScale(d.z))
      .attr("r", 3.5)
      .attr("fill", d => color(d.type) || CHART_COLORS.muted)
      .attr("opacity", 0.6)
      .on("mouseover", function (_event, d) {
        d3.select(this).attr("r", 6).attr("opacity", 1);
        tooltip.style("display", "block")
          .html(`<strong>${d.pitch_name}</strong><br/>Location: (${d.x.toFixed(2)}, ${d.z.toFixed(2)})<br/>Result: ${d.type === "S" ? "Strike" : d.type === "B" ? "Ball" : d.type === "X" ? "In-Play" : d.type}`);
      })
      .on("mousemove", function (event) {
        const rect = containerRef.current!.getBoundingClientRect();
        tooltip.style("left", `${event.clientX - rect.left + 12}px`).style("top", `${event.clientY - rect.top - 10}px`);
      })
      .on("mouseleave", function () {
        d3.select(this).attr("r", 3.5).attr("opacity", 0.6);
        tooltip.style("display", "none");
      });

    const legendG = g.append("g").attr("transform", `translate(${innerW - 80}, 0)`);
    const legendItems = [{ label: "Strike", color: OUTCOME_COLORS.S }, { label: "Ball", color: OUTCOME_COLORS.B }, { label: "In-Play", color: CHART_COLORS.muted }];
    legendItems.forEach((item, i) => {
      const row = legendG.append("g").attr("transform", `translate(0, ${i * 20})`);
      row.append("circle").attr("r", 5).attr("fill", item.color).attr("opacity", 0.7);
      row.append("text").attr("x", 12).attr("y", 4).attr("fill", CHART_COLORS.text).attr("font-size", "10px").text(item.label);
    });

    return () => { tooltip.remove(); };
  }, [data, dimensions, containerRef]);

  return <div ref={containerRef} className={chartStyles.chartContainer}><svg ref={svgRef} width={dimensions.width} height={dimensions.height} /></div>;
};
