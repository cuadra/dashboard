"use client";

import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip as ChartJsTooltip,
  Legend as ChartJsLegend,
  type ChartOptions,
} from "chart.js";

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  ChartJsTooltip,
  ChartJsLegend,
);
import { ChartBarDecreasing } from "lucide-react";

type ComponentInstanceDatum = {
  name: string;
  instances: number;
};

export function ChartExample(props: { data: ComponentInstanceDatum[] }) {
  const sorted = [...props.data].sort((a, b) => b.instances - a.instances);

  const data = {
    labels: sorted.map((item) => item.name),
    datasets: [
      {
        label: "Instances",
        data: sorted.map((item) => item.instances),
        backgroundColor: "rgb(30, 41, 75)",
        borderRadius: 6,
        barThickness: 12,
      },
    ],
  };

  const options: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: "y" as const,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
      },
    },
    scales: {
      x: {
        ticks: {
          display: false,
        },
        grid: {
          display: false,
        },
        border: {
          display: false,
        },
      },
      y: {
        ticks: {
          color: "#666",
          font: {
            size: 12,
          },
        },
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
    <>
      <h2 className="text-center">
        <ChartBarDecreasing />
        Component Usage
      </h2>
      <small className="subtitle">
        This chart provides a comparative view of component deployment volume,
        identifying which components are most heavily leveraged within the
        current implementation landscape.
      </small>
      <div className="chart chart--vertical">
        <Bar data={data} options={options} />
      </div>
    </>
  );
}
