import { createSignal, onMount, For, Show } from "solid-js";

import { SolidApexCharts } from "solid-apexcharts";
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
        };
      };
    };
  };
};

type ClientlibTotal = {
  clientlib: string;
  sites: number;
};

export const ClientlibTotals = () => {
  const [totals, setTotals] = createSignal<ClientlibTotal[]>([]);
  const [status, setStatus] = createSignal<
    "idle" | "loading" | "loaded" | "error"
  >("idle");

  const [clientSeries, setClientSeries] = createSignal([44, 55, 13, 43, 22]);
  const [clientOptions, setClientOptions] = createSignal({
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
          const uniqueClientlibs = new Set<string>();

          for (const page of pages) {
            const clientlib = page.M.clientlib.S;
            if (clientlib) {
              uniqueClientlibs.add(clientlib);
            }
          }

          for (const clientlib of uniqueClientlibs) {
            totalsMap[clientlib] = (totalsMap[clientlib] ?? 0) + 1;
          }
        }),
      );

      const sortedTotals = Object.entries(totalsMap)
        .map(([clientlib, sites]) => ({ clientlib, sites }))
        .filter((entry) => entry.sites > 0)
        .sort((a, b) => b.sites - a.sites);

      setTotals(sortedTotals);
      setStatus("loaded");

      const totalSites = sortedTotals.reduce(
        (sum, entry) => sum + entry.sites,
        0,
      );
      const arr = sortedTotals.map(({ clientlib, sites }) => ({
        clientlib,
        percentage: totalSites > 0 ? (sites / totalSites) * 100 : 0,
      }));

      setClientSeries(arr.map((entry) => entry.percentage));
      setClientOptions((prev) => ({
        ...prev,
        labels: arr.map(
          (entry) => `${entry.clientlib} ${entry.percentage.toFixed(1)}%`,
        ),
      }));
    } catch (error) {
      console.error(error);
      setStatus("error");
    }
  });

  return (
    <section>
      <SolidApexCharts
        options={clientOptions()}
        series={clientSeries()}
        type="pie"
      />
      <h2>Client Library Popularity (Sites)</h2>
      <Show when={status() === "loading"} fallback={null}>
        <p>Loading client libraries...</p>
      </Show>
      <Show when={status() === "error"} fallback={null}>
        <p>Unable to load client library totals.</p>
      </Show>
      <Show when={status() === "loaded"} fallback={null}>
        <ol>
          <For each={totals()}>
            {(entry) => (
              <li>
                {entry.clientlib} — {entry.sites} sites
              </li>
            )}
          </For>
        </ol>
      </Show>
    </section>
  );
};
