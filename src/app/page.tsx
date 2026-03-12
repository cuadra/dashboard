import { Fragment } from "react";
import * as stylex from "@stylexjs/stylex";
import overview from "@/src/data/2026-03-12/overview.json";

import typography from "@/src/styles/typography";
import HorizontalBarChart from "@/src/components/Charts/HorizontalBarChart/index";
import { PChart } from "@/src/components/Charts/clientlibs";
import { filteredComponents } from "@/features/filters/excludeComponents";
import { excludedList } from "@/src/data/excludedComponents";
import { friendlyMapping } from "@/src/data/friendlyMapping";
import Chips from "@/src/components/Chips/Chips";
import {
  ChartPie,
  ChartBarDecreasing,
  Library,
  Coins,
  Layers,
  Settings,
  AppWindow,
  Sparkles,
  Bug,
  Newspaper,
} from "lucide-react";
export default function Home() {
  const components = filteredComponents(overview.components);

  const totalInstances = components.reduce((sum, c) => sum + c.instances, 0);

  const percentages = components.map((component) => ({
    ...component,
    percentage: Number(
      ((component.instances / totalInstances) * 100).toFixed(2),
    ),
  }));

  const clientlibPercentages = overview.clientlibs.map((clientlib) => ({
    name: clientlib.name,
    percentage: Number(
      ((clientlib.domains.length / overview.totalSites) * 100).toFixed(2),
    ),
  }));

  const chartClientlibData = clientlibPercentages.map((clientlib) => ({
    name: clientlib.name,
    percentage: clientlib.percentage,
  }));

  const maxInstances = Math.max(...percentages.map((c) => c.instances));

  const simplifiedName = (name: string) => {
    return name.split("/").pop() || name;
  };
  const friendlyMapped = (name: string) => {
    return friendlyMapping[simplifiedName(name)] || simplifiedName(name);
  };

  const conformed = percentages.map((component) => ({
    xLabel: friendlyMapped(component.name),
    yLabel: "test",
    value: (component.instances / maxInstances) * 100,
    tip: `${component.instances} ${component.instances === 1 ? "instance" : "instances"}`,
  }));

  const conformedSorted = conformed.sort((a, b) => b.value - a.value);
  const COLORS = [
    "#ff4d4d",
    "#ff7a4d",
    "#ffa64d",
    "#ffd24d",
    "#ffff4d",
    "#d2ff4d",
    "#a6ff4d",
    "#7aff4d",
    "#4dff4d",
    "#4dff7a",

    "#4dffa6",
    "#4dffd2",
    "#4dffff",
    "#4dd2ff",
    "#4da6ff",
    "#4d7aff",
    "#4d4dff",
    "#7a4dff",
    "#a64dff",
    "#d24dff",

    "#ff4dff",
    "#ff4dd2",
    "#ff4da6",
    "#ff4d7a",
    "#ff4d99",
    "#ff6680",
    "#ff8059",
    "#ffaa33",
    "#ffd11a",
    "#e6ff1a",

    "#bfff1a",
    "#80ff1a",
    "#40ff1a",
    "#1aff66",
    "#1affb3",
    "#1ae6ff",
    "#1ab3ff",
    "#1a80ff",
    "#1a4dff",
    "#661aff",
  ];

  const legal = stylex.create({
    default: {
      fontSize: 12,
      color: "#999",
      textAlign: "center",
      margin: "20px 0",
      opacity: 0.3,
    },
  });
  const cards = stylex.create({
    container: {
      margin: "16px 0",
      gap: 16,
      display: "flex",
      flexDirection: "column",
      "@media (min-width: 768px)": {
        flexDirection: "row",
      },
    },
    card: {
      padding: 16,
      "@media (min-width: 768px)": {
        width: "50%",
      },
      textAlign: "center",
      backgroundColor: "rgb(30, 41, 75)",
      borderRadius: 10,
      flexGrow: 1,
      overflow: "hidden",
    },
  });
  const smallCards = stylex.create({
    container: {
      marginTop: 16,
      gap: 8,
      display: "flex",
      flexWrap: "wrap",
      justifyContent: "space-around",
      boxSizing: "border-box",
    },
    card: {
      padding: 8,
      fontSize: 14,
      flexGrow: 1,
      textAlign: "left",
      backgroundColor: "rgba(255, 255, 255, 0.05)",
      borderRadius: 4,
    },
    list: {
      paddingLeft: 24,
      color: "rgba(255, 255, 255, 0.3)",
    },
  });

  const fonts = stylex.create({
    line0: {
      lineHeight: "0",
    },
    default: {
      color: "#eee",
      family: "'Manrope', sans-serif",
    },
    h1: {
      margin: "0",
      fontSize: 50,
      fontWeight: 200,
      textAlign: "center",
    },
    h2: {
      marginTop: "10px",
      marginBottom: 0,
      fontSize: 70,
      color: "grey",
      fontWeight: 200,
      lineHeight: "50px",
    },
    h3: {
      marginTop: "5px",
      color: "grey",
      fontSize: 30,
      fontWeight: 200,
    },
    description: {
      marginTop: "20px",
      marginBottom: "10px",
      fontSize: 14,
      display: "block",
      fontWeight: 600,
      textAlign: "center",
      color: "rgba(255, 255, 255, 0.2)",
    },
  });
  const layouts = stylex.create({
    main: {
      "@media (min-width: 768px)": {
        margin: "100px 30px",
      },
    },
  });
  const list = stylex.create({
    title: {
      fontSize: 16,
      color: "#eee",
      fontWeight: 600,
      marginBottom: 4,
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
      textAlign: "left",
    },
    description: {
      marginLeft: 0,
      fontSize: 14,
      color: "rgba(255, 255, 255, 0.2)",
      marginBottom: 16,
      textAlign: "left",
    },
  });
  return (
    <>
      <header>
        <h1 {...stylex.props(typography.default, typography.h1)}>Overview</h1>
      </header>
      <section {...stylex.props(cards.container)}>
        <div {...stylex.props(cards.card)}>
          <AppWindow color="#0f172a" size={30} />
          <h2 {...stylex.props(fonts.h2)}>
            {overview.totalSites}{" "}
            <span {...stylex.props(fonts.description, fonts.line0)}>
              websites
            </span>
          </h2>
        </div>
        <div {...stylex.props(cards.card)}>
          <Library color="#0f172a" size={30} />
          <h2 {...stylex.props(fonts.h2)}>
            {overview.clientlibs.length}{" "}
            <span {...stylex.props(fonts.description, fonts.line0)}>
              clientlibs
            </span>
          </h2>
        </div>
        <div {...stylex.props(cards.card)}>
          <Coins color="#0f172a" size={30} />
          <h2 {...stylex.props(fonts.h2)}>
            {overview.tokens.length}

            <span {...stylex.props(fonts.description, fonts.line0)}>
              token files
            </span>
          </h2>
        </div>
        <div {...stylex.props(cards.card)}>
          <Layers color="#0f172a" size={30} />
          <h2 {...stylex.props(fonts.h2)}>
            {overview.totalPages}
            <span {...stylex.props(fonts.description, fonts.line0)}>pages</span>
          </h2>
        </div>
        <div {...stylex.props(cards.card)}>
          <Settings color="#0f172a" size={30} />
          <h2 {...stylex.props(fonts.h2)}>
            {components.length}
            <span {...stylex.props(fonts.description, fonts.line0)}>
              component types
            </span>
          </h2>
        </div>
      </section>
      <section {...stylex.props(cards.container)}>
        <div {...stylex.props(cards.card)}>
          <h2 {...stylex.props(fonts.h2)}>
            {totalInstances}+
            <span {...stylex.props(fonts.description, fonts.line0)}>
              total components in the wild
            </span>
          </h2>
        </div>
      </section>

      <section {...stylex.props(cards.container)}>
        <div {...stylex.props(cards.card)}>
          <ChartPie color="#0f172a" size={30} />
          <h2 {...stylex.props(fonts.h3)}>Client Libraries Usage</h2>
          <PChart data={chartClientlibData} />

          <div {...stylex.props(smallCards.container)}>
            {[...overview.clientlibs]
              .sort((a, b) => b.domains.length - a.domains.length)
              .map((lib, i) => (
                <div key={i} {...stylex.props(smallCards.card)}>
                  <div>{lib.name}</div>
                  <ol {...stylex.props(smallCards.list)}>
                    {lib.domains.map((domain) => (
                      <li key={domain}>{domain}</li>
                    ))}
                  </ol>
                </div>
              ))}
          </div>
        </div>
        <div {...stylex.props(cards.card)}>
          <Coins color="#0f172a" size={30} />
          <h2 {...stylex.props(fonts.h3)}>Token Usage</h2>
          <svg width="100%" height="330" viewBox="0 0 200 240">
            {(() => {
              type Token = {
                name: string;
                domains: string[];
              };

              const sorted: Token[] = [...overview.tokens].sort(
                (a, b) => a.domains.length - b.domains.length,
              );

              const maxDomains = Math.max(
                ...sorted.map((t) => t.domains.length),
              );

              const ringGap = 2;
              const minWidth = 0.5;

              const maxWidth = 10;
              const startPad = 17;

              const widths: number[] = sorted.map((t) => {
                const frac = maxDomains ? t.domains.length / maxDomains : 0;
                return minWidth + frac * (maxWidth - minWidth);
              });

              const radii: number[] = widths.reduce(
                (acc: number[], width: number, i: number) => {
                  if (i === 0) {
                    acc.push(startPad + width / 2);
                  } else {
                    const prevR = acc[i - 1];
                    const prevW = widths[i - 1];
                    acc.push(prevR + prevW / 2 + ringGap + width / 2);
                  }
                  return acc;
                },
                [],
              );

              return sorted.map((token: Token, i: number) => {
                const strokeWidth = widths[i];
                const r = radii[i];

                const C = 2 * Math.PI * r;
                const n = token.domains.length || 1;

                const gap = 0;
                const seg = Math.max(0, (C - n * gap) / n);

                return (
                  <g key={token.name} transform="rotate(-90 100 100)">
                    {token.domains.map((domain: string, index: number) => (
                      <circle
                        key={`${token.name}:${domain}:${index}`}
                        cx="80"
                        cy="100"
                        r={r}
                        fill="none"
                        stroke={COLORS[(i * 7 + index * 13) % COLORS.length]}
                        strokeWidth={strokeWidth}
                        strokeOpacity={token.domains.length === 1 ? 0.3 : 0.9}
                        strokeLinecap="butt"
                        strokeDasharray={`${seg} ${C}`}
                        strokeDashoffset={-(index * (seg + gap))}
                      >
                        <title>
                          {`${token.name} - ${token.domains.length} sites`}
                        </title>
                      </circle>
                    ))}
                  </g>
                );
              });
            })()}
          </svg>

          <div {...stylex.props(smallCards.container)}>
            {[...overview.tokens]
              .sort((a, b) => b.domains.length - a.domains.length)
              .map((token, i) => (
                <div key={i} {...stylex.props(smallCards.card)}>
                  <div>
                    {token.name.replace(".json", "").replace("gsk-", "")}
                  </div>
                  <ol {...stylex.props(smallCards.list)}>
                    {token.domains.map((domain) => (
                      <li key={domain}>{domain}</li>
                    ))}
                  </ol>
                </div>
              ))}
          </div>
        </div>
      </section>

      <main {...stylex.props(layouts.main)}>
        <div className="text-center">
          <ChartBarDecreasing color="rgb(30, 41, 75)" size={40} />
          <h2 {...stylex.props(typography.h2)}>Component Usage</h2>
        </div>
        <div {...stylex.props(fonts.description)}>
          This chart provides a comparative view of component deployment volume,
          identifying which components are most heavily leveraged within the
          current implementation landscape.
        </div>
        <HorizontalBarChart
          horizontal={true}
          barBackgroundColor="#1e294b"
          barColor="#79C1D1"
          data={conformedSorted}
        />
        <div {...stylex.props(legal.default)}>
          The following core infrastructure components have been excluded to
          focus attention on optional and content-driven components.
        </div>
        <Chips list={excludedList} />
      </main>
      <section {...stylex.props(cards.container)}>
        <div {...stylex.props(cards.card)}>
          <Newspaper color="#0f172a" size={30} />
          <h2 {...stylex.props(fonts.h3)}>Latest 10 Pages</h2>
          <dl>
            {overview.latestPages.slice(0, 10).map((page, i) => (
              <Fragment key={i}>
                <dt {...stylex.props(list.title)}>
                  <a target="_blank" href={page.url.toLowerCase()}>
                    {page.url.toLowerCase()}
                  </a>
                </dt>
                <dd {...stylex.props(list.description)}>
                  {new Date(page.lastModified).toLocaleString()}
                </dd>
              </Fragment>
            ))}
          </dl>
        </div>
      </section>
    </>
  );
}
