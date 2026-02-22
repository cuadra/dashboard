"use client";

import { PolarArea } from "react-chartjs-2";
import {
  Chart as ChartJS,
  RadialLinearScale,
  ArcElement,
  Tooltip as ChartJsTooltip,
  Legend as ChartJsLegend,
} from "chart.js";
import { ChartPie } from "lucide-react";
ChartJS.register(RadialLinearScale, ArcElement, ChartJsTooltip, ChartJsLegend);

const COLORS = Array.from({ length: 16 }, (_, i) => {
  const hue = (i * 137.5) % 360;
  const lightness = i % 2 === 0 ? 60 : 70;
  const alpha = i % 3 === 0 ? 1 : 0.85;

  return `hsla(${hue}, 95%, ${lightness}%, ${alpha})`;
});

export function TokenChart(props: any) {
  const revisedData = props.data.map((entry: any, index: number) => ({
    ...entry,
    fill: COLORS[index % COLORS.length],
    value: Array.isArray(entry.domains) ? entry.domains.length : entry.value,
  }));

  const sortedData = revisedData.sort((a: any, b: any) => b.value - a.value);

  const data = {
    labels: sortedData.map((entry: any) =>
      typeof entry.name === "string"
        ? entry.name.replace(".json", "")
        : entry.name,
    ),
    datasets: [
      {
        data: sortedData.map((entry: any) => entry.value),
        backgroundColor: sortedData.map((entry: any) => entry.fill),
        spacing: 10,
        borderRadius: 5,
        borderWidth: 3,
        borderColor: "rgb(30, 41, 75)",
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "70%",

    scales: {
      r: {
        grid: {
          color: "rgba(255,255,255,0.15)", // circular lines
        },
        angleLines: {
          color: "rgba(255,255,255,0.25)", // radial spokes
        },
        pointLabels: {
          color: "#fff", // category labels
        },
        ticks: {
          color: "#ccc",
          backdropColor: "transparent", // remove white tick background
        },
      },
    },

    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          color: "#666",
          boxWidth: 10,
          boxHeight: 10,
          padding: 12,
        },
      },
      tooltip: {
        enabled: true,
      },
    },
    scales: {
      r: {
        ticks: {
          display: false,
        },
        grid: {
          color: "rgba(0,0,0,0.08)",
        },
        angleLines: {
          color: "rgba(0,0,0,0.08)",
        },
      },
    },
  };

  return (
    <div className="chart chart--polar">
      <h2 className="text-lg font-semibold mb-4 text-center">
        <ChartPie /> Token Usage
      </h2>
      <PolarArea data={data} options={options} />
    </div>
  );
}
