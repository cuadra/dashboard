"use client";

import { PolarArea } from "react-chartjs-2";
import {
  Chart as ChartJS,
  RadialLinearScale,
  ArcElement,
  Tooltip as ChartJsTooltip,
  Legend as ChartJsLegend,
  type ChartOptions,
} from "chart.js";
import { ChartPie } from "lucide-react";
ChartJS.register(RadialLinearScale, ArcElement, ChartJsTooltip, ChartJsLegend);

const COLORS = Array.from({ length: 16 }, (_, i) => {
  const hue = (i * 137.5) % 360;
  const lightness = i % 2 === 0 ? 60 : 70;
  const alpha = i % 3 === 0 ? 1 : 0.85;

  return `hsla(${hue}, 95%, ${lightness}%, ${alpha})`;
});

type TokenDatum = {
  name: string;
  value?: number;
  domains?: string[];
  fill?: string;
};

export function TokenChart(props: { data: TokenDatum[] }) {
  const revisedData = props.data.map((entry, index) => ({
    ...entry,
    fill: COLORS[index % COLORS.length],
    value: Array.isArray(entry.domains) ? entry.domains.length : entry.value,
  }));

  const sortedData = revisedData.sort(
    (a, b) => (b.value ?? 0) - (a.value ?? 0),
  );

  const data = {
    labels: sortedData.map((entry) =>
      typeof entry.name === "string"
        ? entry.name.replace(".json", "")
        : entry.name,
    ),
    datasets: [
      {
        data: sortedData.map((entry) => entry.value ?? 0),
        backgroundColor: sortedData.map((entry) => entry.fill),
        spacing: 10,
        borderRadius: 5,
        borderWidth: 3,
        borderColor: "rgb(30, 41, 75)",
      },
    ],
  };

  const options: ChartOptions<"polarArea"> = {
    responsive: true,
    maintainAspectRatio: false,

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
        pointLabels: {
          color: "#fff",
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
