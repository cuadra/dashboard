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
import { friendlyMapping } from "@/src/data/friendlyMapping";
type ComponentInstanceDatum = {
  name: string;
  instances: number;
  //percentage: string;
};

export function ChartExample({
  data,
  heightClass,
  basedOn,
}: {
  data: ComponentInstanceDatum[];
  heightClass: string;
  basedOn?: string;
}) {
  const chartData = data.map((component) => ({
    name: component.name.split("/").pop() || component.name,
    //percentage: parseFloat(component.percentage),
    instances: component.instances,
  }));

  const sorted = [...chartData].sort((a, b) => b.instances - a.instances);

  const d = {
    labels: sorted.map((item) => friendlyMapping[item.name] || item.name),
    datasets: [
      {
        label: "Instances",
        data: sorted.map((item) => item.instances),
        backgroundColor: "rgb(30, 41, 75)",
        borderRadius: 6,
        barThickness: 7,
        categoryPercentage: 0.9,
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
        {basedOn && (
          <>
            <ChartBarDecreasing />
            `Component Usage based on ${basedOn}`
          </>
        )}
      </h2>
      {basedOn && (
        <small className="subtitle">
          This chart provides a comparative view of component deployment volume,
          identifying which components are most heavily leveraged within the
          current implementation landscape.
        </small>
      )}
      <div className={`${heightClass} chart chart--vertical`}>
        <Bar data={d} options={options} />
      </div>
    </>
  );
}
