"use client";

import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip as ChartJsTooltip,
  Legend as ChartJsLegend,
} from "chart.js";

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  ChartJsTooltip,
  ChartJsLegend,
);

const COLORS = Array.from({ length: 24 }, (_, i) => {
  const hue = (i * 137.5) % 360;
  const lightness = i % 2 === 0 ? 60 : 70;
  const alpha = i % 3 === 0 ? 1 : 0.85;

  return `hsla(${hue}, 95%, ${lightness}%, ${alpha})`;
});

export function ComponentStackBar(props: any) {
  const sorted = [...props.data].sort(
    (a: any, b: any) => b.percentage - a.percentage,
  );

  const data = {
    labels: ["Components"],
    datasets: sorted.map((item: any, index: number) => ({
      label: item.name,
      data: [item.percentage],
      backgroundColor: COLORS[index % COLORS.length],
    })),
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: "y" as const,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          color: "#666",
          boxWidth: 10,
          boxHeight: 10,
          padding: 12,
        },
      },
      tooltip: {
        enabled: true,
        callbacks: {
          label: (context: any) => {
            const value = context.raw ?? 0;
            return `${context.dataset.label}: ${value}%`;
          },
        },
      },
    },
    scales: {
      x: {
        stacked: true,
        max: 100,
        ticks: {
          callback: (value: number) => `${value}%`,
        },
        grid: {
          display: false,
        },
        border: {
          display: false,
        },
      },
      y: {
        stacked: true,
        grid: {
          display: false,
        },
        border: {
          display: false,
        },
      },
    },
  };

  return (
    <div className="chart chart--stack">
      <Bar data={data} options={options} />
    </div>
  );
}
