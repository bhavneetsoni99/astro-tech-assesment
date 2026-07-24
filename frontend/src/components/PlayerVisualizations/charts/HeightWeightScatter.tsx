import React, { useEffect, useMemo, useRef, useState } from "react";
import * as d3 from "d3";
import { Player } from "../../../types";
import { CATEGORICAL_COLORS, CHART_COLORS, MARGIN } from "../../../utils";
import chartStyles from "../../../styles/charts.module.css";

interface Props {
  players: Player[];
}

export const HeightWeightScatter: React.FC<Props> = ({ players }) => {
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

  const data = useMemo(() => players.map(p => ({
    ...p,
    heightInches: p.height_feet * 12 + p.height_inches,
  })), [players]);

  useEffect(() => {
    if (!svgRef.current || dimensions.width === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const innerW = dimensions.width - MARGIN.left - MARGIN.right;
    const innerH = dimensions.height - MARGIN.top - MARGIN.bottom;

    const g = svg.append("g").attr("transform", `translate(${MARGIN.left},${MARGIN.top})`);

    const xScale = d3.scaleLinear()
      .domain([d3.min(data, d => d.weight)! - 10, d3.max(data, d => d.weight)! + 10])
      .range([0, innerW]);

    const yScale = d3.scaleLinear()
      .domain([d3.min(data, d => d.heightInches)! - 2, d3.max(data, d => d.heightInches)! + 2])
      .range([innerH, 0]);

    const positions = [...new Set(data.map(d => d.primary_position))];
    const colorScale = d3.scaleOrdinal<string>()
      .domain(positions)
      .range(CATEGORICAL_COLORS.slice(0, positions.length));

    const xAxis = d3.axisBottom(xScale).ticks(6);
    const yAxis = d3.axisLeft(yScale).ticks(6);

    g.append("g")
      .attr("transform", `translate(0,${innerH})`)
      .call(xAxis)
      .selectAll("text")
      .attr("fill", CHART_COLORS.muted)
      .attr("font-size", "11px");
    g.selectAll(".domain, .tick line").attr("stroke", CHART_COLORS.border);

    g.append("g")
      .call(yAxis)
      .selectAll("text")
      .attr("fill", CHART_COLORS.muted)
      .attr("font-size", "11px");
    g.selectAll(".domain, .tick line").attr("stroke", CHART_COLORS.border);

    g.append("text")
      .attr("x", innerW / 2)
      .attr("y", innerH + 36)
      .attr("text-anchor", "middle")
      .attr("fill", CHART_COLORS.muted)
      .attr("font-size", "11px")
      .text("Weight (lbs)");

    g.append("text")
      .attr("x", -innerH / 2)
      .attr("y", -40)
      .attr("text-anchor", "middle")
      .attr("fill", CHART_COLORS.muted)
      .attr("font-size", "11px")
      .attr("transform", "rotate(-90)")
      .text("Height (in)");

    const tooltip = d3.select(containerRef.current)
      .append("div")
      .attr("class", chartStyles.tooltip)
      .style("display", "none");

    g.selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", d => xScale(d.weight))
      .attr("cy", d => yScale(d.heightInches))
      .attr("r", 4)
      .attr("fill", d => colorScale(d.primary_position))
      .attr("opacity", 0.7)
      .attr("stroke", "none")
      .on("mouseover", function (_event, d) {
        d3.select(this).attr("r", 7).attr("opacity", 1);
        tooltip
          .style("display", "block")
          .html(`<strong>${d.first_name} ${d.last_name}</strong><br/>${d.team} · ${d.primary_position}<br/>${d.height_feet}'${d.height_inches}" · ${d.weight} lbs`);
      })
      .on("mousemove", function (event) {
        const rect = containerRef.current!.getBoundingClientRect();
        tooltip
          .style("left", `${event.clientX - rect.left + 12}px`)
          .style("top", `${event.clientY - rect.top - 10}px`);
      })
      .on("mouseleave", function () {
        d3.select(this).attr("r", 4).attr("opacity", 0.7);
        tooltip.style("display", "none");
      });

    const legendG = g.append("g").attr("transform", `translate(${innerW - 140}, 0)`);

    const legendItems = positions.slice(0, 10);
    legendItems.forEach((pos, i) => {
      const row = legendG.append("g").attr("transform", `translate(0, ${i * 18})`);
      row.append("circle").attr("r", 4).attr("fill", colorScale(pos));
      row.append("text")
        .attr("x", 10)
        .attr("y", 4)
        .attr("fill", CHART_COLORS.muted)
        .attr("font-size", "10px")
        .text(pos);
    });

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
