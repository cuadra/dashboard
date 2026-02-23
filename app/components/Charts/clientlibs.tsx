"use client";

import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip as ChartJsTooltip,
  Legend as ChartJsLegend,
} from "chart.js";
import { ChartPie } from "lucide-react";
const COLORS = Array.from({ length: 16 }, (_, i) => {
  const hue = (i * 137.5) % 360;

  const lightness = i % 2 === 0 ? 60 : 70;
  const alpha = i % 3 === 0 ? 1 : 0.85;

  return `hsla(${hue}, 95%, ${lightness}%, ${alpha})`;
});

ChartJS.register(ArcElement, ChartJsTooltip, ChartJsLegend);

type ClientlibEntry = {
  name: string;
  percentage: number;
  fill?: string;
};

export function PChart(props: { data: ClientlibEntry[] }) {
  const revisedData = props.data.map((entry, index) => ({
    ...entry,
    fill: COLORS[index % COLORS.length],
  }));

  function compareVersions(a: string, b: string) {
    const aParts = a.split(".").map(Number);
    const bParts = b.split(".").map(Number);

    for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
      const diff = (aParts[i] || 0) - (bParts[i] || 0);
      if (diff !== 0) return diff;
    }

    return 0;
  }

  const sortedData = revisedData.sort((a, b) =>
    compareVersions(b.name, a.name),
  );

  const doughnutData = {
    labels: sortedData.map((entry) => entry.name),
    datasets: [
      {
        spacing: 10,
        borderRadius: 10,
        borderWidth: 4,
        borderColor: "rgb(30, 41, 75)",
        data: sortedData.map((entry) => entry.percentage),
        backgroundColor: sortedData.map((entry) => entry.fill),
      },
    ],
  };

  const doughnutOptions = {
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
    cutout: "48%",
  };

  return (
    <>
      <h2 className="text-lg font-semibold mb-4 text-center">
        <ChartPie />
        Client Libraries Usage
      </h2>
      <div className="chart chart--donut">
        <Doughnut data={doughnutData} options={doughnutOptions} />
      </div>
    </>
  );
}
