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
import { ChartBarDecreasing } from "lucide-react";

export function ChartExample(props: any) {
  const sorted = [...props.data].sort(
    (a: any, b: any) => b.instances - a.instances,
  );
  console.log("sorted", sorted);

  const data = {
    labels: sorted.map((item: any) => item.name),
    datasets: [
      {
        label: "Instances",
        data: sorted.map((item: any) => item.instances),
        backgroundColor: "rgb(30, 41, 75)",
        borderRadius: 6,
        barThickness: 12,
      },
    ],
  };

  const options = {
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
