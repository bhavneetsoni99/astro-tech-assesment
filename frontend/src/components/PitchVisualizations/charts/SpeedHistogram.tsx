import React, { useEffect, useMemo, useRef, useState } from "react";
import * as d3 from "d3";
import { Pitch } from "../../../types";
import { CHART_COLORS, MARGIN } from "../../../utils";
import chartStyles from "../../../styles/charts.module.css";

interface Props {
  pitches: Pitch[];
}

export const SpeedHistogram: React.FC<Props> = ({ pitches }) => {
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

  const speeds = useMemo(() =>
    pitches
      .map(p => Number(p.release_speed))
      .filter(s => !isNaN(s) && s > 0)
      .sort((a, b) => a - b),
  [pitches]);

  useEffect(() => {
    if (!svgRef.current || dimensions.width === 0 || speeds.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const innerW = dimensions.width - MARGIN.left - MARGIN.right;
    const innerH = dimensions.height - MARGIN.top - MARGIN.bottom;

    const g = svg.append("g").attr("transform", `translate(${MARGIN.left},${MARGIN.top})`);

    const bins = d3.bin().thresholds(15)(speeds);

    const xScale = d3.scaleLinear()
      .domain([bins[0].x0!, bins[bins.length - 1].x1!])
      .range([0, innerW]);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(bins, d => d.length)! * 1.15])
      .range([innerH, 0]);

    g.append("g")
      .attr("transform", `translate(0,${innerH})`)
      .call(d3.axisBottom(xScale).ticks(8))
      .selectAll("text")
      .attr("fill", CHART_COLORS.muted)
      .attr("font-size", "11px");
    g.selectAll(".domain, .tick line").attr("stroke", CHART_COLORS.border);

    g.append("g")
      .call(d3.axisLeft(yScale).ticks(5))
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
      .text("Release Speed (mph)");

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
      .data(bins)
      .enter()
      .append("rect")
      .attr("x", d => xScale(d.x0!))
      .attr("y", d => yScale(d.length))
      .attr("width", d => Math.max(0, xScale(d.x1!) - xScale(d.x0!) - 1))
      .attr("height", d => innerH - yScale(d.length))
      .attr("fill", CHART_COLORS.navy)
      .attr("rx", 2)
      .on("mouseover", function (_event, d) {
        d3.select(this).attr("fill", CHART_COLORS.orange);
        tooltip
          .style("display", "block")
          .html(`<strong>${d.x0?.toFixed(1)}-${d.x1?.toFixed(1)} mph</strong>: ${d.length.toLocaleString()} pitches`);
      })
      .on("mousemove", function (event) {
        const rect = containerRef.current!.getBoundingClientRect();
        tooltip
          .style("left", `${event.clientX - rect.left + 12}px`)
          .style("top", `${event.clientY - rect.top - 10}px`);
      })
      .on("mouseleave", function () {
        d3.select(this).attr("fill", CHART_COLORS.navy);
        tooltip.style("display", "none");
      });

    return () => {
      tooltip.remove();
    };
  }, [speeds, dimensions]);

  return (
    <div ref={containerRef} className={chartStyles.chartContainer}>
      <svg ref={svgRef} width={dimensions.width} height={dimensions.height} />
    </div>
  );
};
