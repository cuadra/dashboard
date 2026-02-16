import { createSignal, onMount, For, Show } from "solid-js";
import { SolidApexCharts } from "solid-apexcharts";
import type {
  DynamoList,
  DynamoMap,
  OverviewComponentMap,
} from "../types/overview";

type SiteRecord = {
  site: {
    M: {
      domain: { S: string };
      pageCount: { N: string };
      pages: {
        L: Array<{
          M: {
            page: { S: string };
            clientlib: { S: string };
            componentCount: { N: string };
            componentCounts?: {
              L: Array<{
                M: {
                  component: { S: string };
                  count: { N: string };
                };
              }>;
            };
            components?: { L: Array<{ S: string }> };
          };
        }>;
      };
    };
  };
};

type OverviewResponse = {
  overview: {
    M: {
      filters: {
        M: {
          websites: { L: Array<{ S: string }> };
          components?: DynamoList<DynamoMap<OverviewComponentMap>>;
        };
      };
    };
  };
};

type ComponentTotal = {
  component: string;
  count: number;
};

const getComponentDisplayName = (componentName: string) => {
  const raw = componentName.split("/").pop() ?? componentName;
  const cleaned = raw.replace(/[-_]+/g, " ").trim().toLowerCase();
  if (!cleaned) {
    return componentName;
  }
  return cleaned.replace(/\b\w/g, (char) => char.toUpperCase());
};

export const ComponentTotals = () => {
  const [totals, setTotals] = createSignal<ComponentTotal[]>([]);
  const [status, setStatus] = createSignal<
    "idle" | "loading" | "loaded" | "error"
  >("idle");

  const [componentSeries, setComponentSeries] = createSignal([
    44, 55, 13, 43, 22,
  ]);
  const [componentOptions, setComponentOptions] = createSignal({
    labels: ["Team A", "Team B", "Team C", "Team D", "Team E"], // Labels for each slice
    chart: {
      type: "donut", // Specify chart type as 'pie'
      width: "50%",
    },
    responsive: [
      {
        // Optional responsive settings
        breakpoint: 480,
        options: {
          chart: {
            width: "50%",
            height: "500px",
          },
          legend: {
            position: "bottom",
          },
        },
      },
    ],
  });
  onMount(async () => {
    setStatus("loading");
    try {
      const overviewResponse = await fetch("../data/overview.json");
      const overviewJson = (await overviewResponse.json()) as OverviewResponse;
      const domains = overviewJson.overview.M.filters.M.websites.L.map(
        (site) => site.S,
      );

      const totalsMap: Record<string, number> = {};

      await Promise.all(
        domains.map(async (domain) => {
          const siteResponse = await fetch(`../data/websites/${domain}.json`);
          const siteJson = (await siteResponse.json()) as SiteRecord;
          const pages = siteJson.site.M.pages.L;

          for (const page of pages) {
            const counts = page.M.componentCounts?.L ?? [];
            for (const entry of counts) {
              const component = entry.M.component.S;
              const count = Number(entry.M.count.N);
              totalsMap[component] = (totalsMap[component] ?? 0) + count;
            }
          }
        }),
      );

      const sortedTotals = Object.entries(totalsMap)
        .map(([component, count]) => ({ component, count }))
        .filter((entry) => entry.count > 0)
        .sort((a, b) => b.count - a.count);

      setTotals(sortedTotals);
      setStatus("loaded");

      const totalCount = sortedTotals.reduce(
        (sum, entry) => sum + entry.count,
        0,
      );
      const arr = sortedTotals.map(({ component, count }) => ({
        component,
        percentage: totalCount > 0 ? (count / totalCount) * 100 : 0,
      }));

      setComponentSeries(arr.map((entry) => entry.percentage));
      setComponentOptions((prev) => ({
        ...prev,
        labels: arr.map(
          (entry) =>
            `${getComponentDisplayName(entry.component)} ${entry.percentage.toFixed(1)}%`,
        ),
      }));

      setComponentSeries(arr.map((entry) => entry.percentage));
      setComponentOptions((prev) => ({
        ...prev,
        labels: arr.map(
          (entry) =>
            `${getComponentDisplayName(entry.component)} ${entry.percentage.toFixed(1)}%`,
        ),
      }));
    } catch (error) {
      console.error(error);
      setStatus("error");
    }
  });

  return (
    <section>
      <h2>Most Used Components (All Sites)</h2>
      <Show when={status() === "loading"} fallback={null}>
        <p>Loading totals...</p>
      </Show>
      <Show when={status() === "error"} fallback={null}>
        <p>Unable to load totals.</p>
      </Show>
      <Show when={status() === "loaded"} fallback={null}>
        <ol>
          <For each={totals()}>
            {(entry) => (
              <li>
                {getComponentDisplayName(entry.component)} — {entry.count}
              </li>
            )}
          </For>
        </ol>
      </Show>

      <SolidApexCharts
        options={componentOptions()}
        series={componentSeries()}
        type="pie"
      />
    </section>
  );
};
