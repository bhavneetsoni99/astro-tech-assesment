import React, { useEffect, useMemo, useRef } from "react";
import * as d3 from "d3";
import { Pitch } from "../../../types";
import { CATEGORICAL_COLORS, CHART_COLORS, useResize } from "../../../utils";
import chartStyles from "../../../styles/charts.module.css";

interface Props {
  pitches: Pitch[];
}

export const PitchTypeDonut: React.FC<Props> = ({ pitches }) => {
  const { containerRef, dimensions } = useResize(0.5);
  const svgRef = useRef<SVGSVGElement>(null);

  const data = useMemo(() => {
    const counts: Record<string, number> = {};
    pitches.forEach(p => {
      const k = p.pitch_name || "Unknown";
      counts[k] = (counts[k] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [pitches]);

  useEffect(() => {
    if (!svgRef.current || dimensions.width === 0 || data.length === 0) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const radius = Math.min(dimensions.width, dimensions.height) / 2 - 10;
    const innerR = radius * 0.5;
    const g = svg.append("g").attr("transform", `translate(${dimensions.width / 2},${dimensions.height / 2})`);

    const pie = d3.pie<{ name: string; count: number }>().value(d => d.count).sort(null);
    const arc = d3.arc<d3.PieArcDatum<{ name: string; count: number }>>().innerRadius(innerR).outerRadius(radius);
    const arcHover = d3.arc<d3.PieArcDatum<{ name: string; count: number }>>().innerRadius(innerR).outerRadius(radius + 8);

    const color = d3.scaleOrdinal<string>().domain(data.map(d => d.name)).range(CATEGORICAL_COLORS);

    const tooltip = d3.select(containerRef.current)
      .append("div").attr("class", chartStyles.tooltip).style("display", "none");

    g.selectAll("path")
      .data(pie(data))
      .enter()
      .append("path")
      .attr("d", arc)
      .attr("fill", d => color(d.data.name))
      .attr("stroke", "white")
      .attr("stroke-width", 1.5)
      .on("mouseover", function (_event, d) {
        d3.select(this).transition().duration(200).attr("d", function (this: SVGPathElement, _d: unknown) { return arcHover(_d as d3.PieArcDatum<{ name: string; count: number }>); });
        tooltip.style("display", "block")
          .html(`<strong>${d.data.name}</strong>: ${d.data.count} (${(d.data.count / data.reduce((s, x) => s + x.count, 0) * 100).toFixed(1)}%)`);
      })
      .on("mousemove", function (event) {
        const rect = containerRef.current!.getBoundingClientRect();
        tooltip.style("left", `${event.clientX - rect.left + 12}px`).style("top", `${event.clientY - rect.top - 10}px`);
      })
      .on("mouseleave", function () {
        d3.select(this).transition().duration(200).attr("d", function (this: SVGPathElement, _d: unknown) { return arc(_d as d3.PieArcDatum<{ name: string; count: number }>); });
        tooltip.style("display", "none");
      });

    const legendG = g.append("g").attr("transform", `translate(${radius + 16}, ${-radius})`);
    const items = data.slice(0, 8);
    items.forEach((d, i) => {
      const row = legendG.append("g").attr("transform", `translate(0, ${i * 20})`);
      row.append("circle").attr("r", 5).attr("fill", color(d.name));
      row.append("text").attr("x", 12).attr("y", 4).attr("fill", CHART_COLORS.text).attr("font-size", "10px").text(`${d.name} (${d.count})`);
    });

    return () => { tooltip.remove(); };
  }, [data, dimensions, containerRef]);

  return <div ref={containerRef} className={chartStyles.chartContainer}><svg ref={svgRef} width={dimensions.width} height={dimensions.height} /></div>;
};
