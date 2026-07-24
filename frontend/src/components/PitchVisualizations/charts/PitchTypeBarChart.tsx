import React, { useEffect, useMemo, useRef, useState } from "react";
import * as d3 from "d3";
import { Pitch } from "../../../types";
import { CATEGORICAL_COLORS, CHART_COLORS, MARGIN } from "../../../utils";
import chartStyles from "../../../styles/charts.module.css";

interface Props {
  pitches: Pitch[];
}

export const PitchTypeBarChart: React.FC<Props> = ({ pitches }) => {
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
    pitches.forEach(p => {
      const name = p.pitch_name || p.pitch_type || "Unknown";
      counts[name] = (counts[name] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [pitches]);

  useEffect(() => {
    if (!svgRef.current || dimensions.width === 0 || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const innerW = dimensions.width - MARGIN.left - MARGIN.right;
    const innerH = dimensions.height - MARGIN.top - MARGIN.bottom;

    const g = svg.append("g").attr("transform", `translate(${MARGIN.left},${MARGIN.top})`);

    const xScale = d3.scaleBand<string>()
      .domain(data.map(d => d.name))
      .range([0, innerW])
      .padding(0.25);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.count)! * 1.1])
      .range([innerH, 0]);

    const colorScale = d3.scaleOrdinal<string>()
      .domain(data.map(d => d.name))
      .range(CATEGORICAL_COLORS);

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

    g.selectAll("rect")
      .data(data)
      .enter()
      .append("rect")
      .attr("x", d => xScale(d.name)!)
      .attr("y", d => yScale(d.count))
      .attr("width", xScale.bandwidth())
      .attr("height", d => innerH - yScale(d.count))
      .attr("fill", d => colorScale(d.name))
      .attr("rx", 3)
      .on("mouseover", function (_event, d) {
        d3.select(this).attr("opacity", 0.8);
        tooltip
          .style("display", "block")
          .html(`<strong>${d.name}</strong>: ${d.count.toLocaleString()} pitches`);
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
      .attr("x", d => xScale(d.name)! + xScale.bandwidth() / 2)
      .attr("y", d => yScale(d.count) - 6)
      .attr("text-anchor", "middle")
      .attr("fill", CHART_COLORS.text)
      .attr("font-size", "10px")
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
