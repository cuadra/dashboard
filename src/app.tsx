import {
  createSignal,
  createEffect,
  For,
  Component,
  onMount,
  Show,
} from "solid-js";
import {
  globalStyle,
  createThemeContract,
  createTheme,
} from "@macaron-css/core";
import type {
  DynamoList,
  DynamoMap,
  OverviewComponentMap,
} from "./types/overview";

import { styled } from "@macaron-css/solid";

type SitePage = {
  page: string;
  clientlib: string;
  components: string[];
  componentCounts: Record<string, number>;
};

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
            componentCounts: {
              L: Array<{
                M: {
                  component: { S: string };
                  count: { N: string };
                };
              }>;
            };
            components: { L: Array<{ S: string }> };
          };
        }>;
      };
    };
  };
};

export const App: Component = () => {
  const [componentSource, setComponentSource] = createSignal<ComponentsJson>(
    {},
  );
  const [components, setComponents] = createSignal<ComponentsJson>({});
  const [componentsList, setComponentsList] = createSignal<string[]>([]);
  const [domainsList, setDomainsList] = createSignal<string[]>([]);
  const [clientLibsList, setClientLibsList] = createSignal<string[]>([]);
  const [domainsFilter, setDomainsFilter] = createSignal<string[]>([]);
  const [clientlibsFilter, setClientlibsFilter] = createSignal<string[]>([]);
  const [componentsFilter, setComponentsFilter] = createSignal<string[]>([]);

  const [filteredComponents, setFilteredComponents] = createSignal<DynamoList<
    DynamoMap<OverviewComponentMap>
  > | null>(null);
  const [sitePagesByDomain, setSitePagesByDomain] = createSignal<
    Record<string, SitePage[]>
  >({});
  const [siteFetchStatus, setSiteFetchStatus] = createSignal<
    Record<string, "idle" | "loading" | "loaded" | "error">
  >({});
  const [websitesWithTotals, setWebsitesWithTotals] = createSignal<
    Record<string, number>
  >({});

  const vars = createThemeContract({
    color: {
      background: null,
    },
  });

  const lTheme = createTheme(vars, {
    color: {
      background: "#ffffff",
    },
  });
  const dTheme = createTheme(vars, {
    color: {
      background: "#202127",
    },
  });

  globalStyle("body", {
    margin: 0,
    padding: 0,
    backgroundColor: vars.color.background,
  });

  onMount(async () => {
    const data = await fetch("../data/overview.json");
    const json = await data.json();
    console.log(json);

    console.log(json.overview.M.filters.M.components.L);
    setFilteredComponents(json.overview.M.filters.M.components);

    const websiteDomains = json.overview.M.filters.M.websites.L.map(
      (website: { S: string }) => website.S,
    );
    setDomainsList(websiteDomains);

    const clientlibs = json.overview.M.filters.M.clientlibs.L.map(
      (clientlib: { S: string }) => clientlib.S,
    );
    setClientLibsList(clientlibs);

    const componentNames = json.overview.M.filters.M.components.L.map(
      (component: { M: { component: { S: string } } }) =>
        component.M.component.S,
    );
    setComponentsList(componentNames);

    const totalsList = json.overview.M.filters.M.websitesWithTotals?.L ?? [];
    const totalsMap: Record<string, number> = {};
    for (const entry of totalsList) {
      totalsMap[entry.M.domain.S] = Number(entry.M.totalComponents.N);
    }
    setWebsitesWithTotals(totalsMap);
  });
  createEffect(() => {});

  const Details = styled("details", {
    base: {
      marginBottom: "10px",
      backgroundColor: "white",
      borderRadius: "5px",
      border: "1px solid black",
    },
  });
  const Summary = styled("summary", {
    base: {
      cursor: "pointer",
      padding: "10px",
      fontWeight: "bold",
    },
  });
  const ChildWrapper = styled("div", {
    base: {
      padding: "10px",
    },
  });
  const Table = styled("table", {
    base: {
      width: "100%",
    },
  });

  const TH = styled("td", {
    base: {
      padding: "5px",
      fontWeight: "bold",
      border: "1px solid grey",
    },
  });
  const TR = styled("tr", {
    base: {
      border: "1px solid grey",
    },
  });
  const TD = styled("td", {
    base: {
      padding: "5px",
      border: "1px solid grey",
    },
  });
  const Filters = styled("div", {
    base: {
      padding: "10px",
      display: "flex",
      gap: "20px",
    },
  });
  const Menu = styled("menu", {
    base: {
      padding: "0px",
      width: "100%",
      height: "10vh",
      display: "flex",
      flexDirection: "column",
      overflowY: "scroll",
      border: "1px solid black",
    },
  });
  const Label = styled("label", {
    base: {
      padding: "5px",
      display: "inline-block",
      border: "1px solid red",
    },
  });

  const getPagesForComponent = (domain: string, componentName: string) => {
    const pages = sitePagesByDomain()[domain] ?? [];
    const activeClientlibs = clientlibsFilter();
    return pages
      .filter((page) => page.components.includes(componentName))
      .filter(
        (page) =>
          activeClientlibs.length === 0 ||
          activeClientlibs.includes(page.clientlib),
      )
      .map((page) => ({
        ...page,
        componentInstances: page.componentCounts[componentName] ?? 0,
      }));
  };

  const fetchSiteIfNeeded = async (domain: string) => {
    const status = siteFetchStatus()[domain] ?? "idle";
    if (status === "loading" || status === "loaded") {
      return;
    }

    setSiteFetchStatus((current) => ({ ...current, [domain]: "loading" }));
    try {
      const siteResponse = await fetch(`../data/websites/${domain}.json`);
      const siteJson = (await siteResponse.json()) as SiteRecord;
      const pages = siteJson.site.M.pages.L.map((page) => ({
        page: page.M.page.S,
        clientlib: page.M.clientlib.S,
        components: page.M.components.L.map((component) => component.S),
        componentCounts:
          page.M.componentCounts?.L.reduce(
            (acc, entry) => {
              acc[entry.M.component.S] = Number(entry.M.count.N);
              return acc;
            },
            {} as Record<string, number>,
          ) ?? {},
      }));

      setSitePagesByDomain((current) => ({ ...current, [domain]: pages }));
      setSiteFetchStatus((current) => ({ ...current, [domain]: "loaded" }));
    } catch (error) {
      console.error(error);
      setSiteFetchStatus((current) => ({ ...current, [domain]: "error" }));
    }
  };

  const getWebsitesForComponent = (
    component: DynamoMap<OverviewComponentMap>,
  ) => {
    const totals = websitesWithTotals();
    const all = component.M.websites.L;
    const activeDomains = domainsFilter();
    const activeClientlibs = clientlibsFilter();
    return all.filter((website) => {
      if (Object.keys(totals).length > 0 && totals[website.S] === undefined) {
        return false;
      }
      if (activeDomains.length > 0 && !activeDomains.includes(website.S)) {
        return false;
      }
      if (activeClientlibs.length > 0) {
        const pages = sitePagesByDomain()[website.S] ?? [];
        const hasMatchingPage = pages.some(
          (page) =>
            page.components.includes(component.M.component.S) &&
            activeClientlibs.includes(page.clientlib),
        );
        if (!hasMatchingPage) {
          return false;
        }
      }
      return true;
    });
  };

  const getComponentInstancesForWebsite = (
    domain: string,
    componentName: string,
  ) => {
    const pages = sitePagesByDomain()[domain];
    if (!pages) {
      return null;
    }

    const activeClientlibs = clientlibsFilter();

    return pages.reduce((sum, page) => {
      if (activeClientlibs.length > 0) {
        if (!activeClientlibs.includes(page.clientlib)) {
          return sum;
        }
      }
      return sum + (page.componentCounts[componentName] ?? 0);
    }, 0);
  };

  const getComponentInstancesTotal = (
    component: DynamoMap<OverviewComponentMap>,
  ) => {
    let total = 0;
    for (const website of getWebsitesForComponent(component)) {
      const websiteTotal = getComponentInstancesForWebsite(
        website.S,
        component.M.component.S,
      );
      if (websiteTotal !== null) {
        total += websiteTotal;
      }
    }
    return total;
  };

  const isComponentVisible = (component: DynamoMap<OverviewComponentMap>) => {
    const activeComponents = componentsFilter();
    const activeClientlibs = clientlibsFilter();

    if (
      activeComponents.length > 0 &&
      !activeComponents.includes(component.M.component.S)
    ) {
      return false;
    }

    if (activeClientlibs.length > 0) {
      const componentClientlibs = component.M.clientlibs.L.map(
        (item) => item.S,
      );
      const hasClientlib = activeClientlibs.some((clientlib) =>
        componentClientlibs.includes(clientlib),
      );
      if (!hasClientlib) {
        return false;
      }
    }

    return getWebsitesForComponent(component).length > 0;
  };

  const toggleDomainFilter = (domain: string, isChecked: boolean) => {
    setDomainsFilter((current) => {
      if (isChecked) {
        return current.includes(domain) ? current : [...current, domain];
      }
      return current.filter((entry) => entry !== domain);
    });
  };

  const toggleClientlibFilter = (clientlib: string, isChecked: boolean) => {
    setClientlibsFilter((current) => {
      if (isChecked) {
        return current.includes(clientlib) ? current : [...current, clientlib];
      }
      return current.filter((entry) => entry !== clientlib);
    });
  };

  const toggleComponentFilter = (componentName: string, isChecked: boolean) => {
    setComponentsFilter((current) => {
      if (isChecked) {
        return current.includes(componentName)
          ? current
          : [...current, componentName];
      }
      return current.filter((entry) => entry !== componentName);
    });
  };

  const getComponentDisplayName = (componentName: string) => {
    const raw = componentName.split("/").pop() ?? componentName;
    const cleaned = raw.replace(/[-_]+/g, " ").trim().toLowerCase();
    if (!cleaned) {
      return componentName;
    }
    return cleaned.replace(/\b\w/g, (char) => char.toUpperCase());
  };

  return (
    <>
      <Filters>
        <Menu>
          <Show when={filteredComponents()} fallback={<div>Loading...</div>}>
            <For each={domainsList().sort()}>
              {(domain) => (
                <Label>
                  <input
                    type="checkbox"
                    checked={domainsFilter().includes(domain)}
                    onChange={(event) =>
                      toggleDomainFilter(domain, event.currentTarget.checked)
                    }
                  />
                  {domain}
                </Label>
              )}
            </For>
          </Show>
        </Menu>
        <Menu>
          <For each={clientLibsList().sort()}>
            {(clientlib) => (
              <Label>
                <input
                  type="checkbox"
                  checked={clientlibsFilter().includes(clientlib)}
                  onChange={(event) =>
                    toggleClientlibFilter(
                      clientlib,
                      event.currentTarget.checked,
                    )
                  }
                />
                {clientlib}
              </Label>
            )}
          </For>
        </Menu>
        <Menu>
          <For each={componentsList().sort()}>
            {(componentName) => (
              <Label>
                <input
                  type="checkbox"
                  checked={componentsFilter().includes(componentName)}
                  onChange={(event) =>
                    toggleComponentFilter(
                      componentName,
                      event.currentTarget.checked,
                    )
                  }
                />
                {getComponentDisplayName(componentName)}
              </Label>
            )}
          </For>
        </Menu>
      </Filters>
      <Show when={filteredComponents()} fallback={<div>Loading...</div>}>
        <For each={filteredComponents()!.L.filter(isComponentVisible)}>
          {(component) => (
            <Details>
              <Summary>
                {getComponentDisplayName(component.M.component.S)} (
                {getWebsitesForComponent(component).length} sites
                {/*getComponentInstancesTotal(component)*/})
              </Summary>
              <ChildWrapper>
                <For each={getWebsitesForComponent(component)}>
                  {(website) => (
                    <Details
                      onToggle={(event) => {
                        const target = event.currentTarget;
                        if (target.open) {
                          void fetchSiteIfNeeded(website.S);
                        }
                      }}
                    >
                      <Summary>
                        {website.S} (
                        {(() => {
                          const total = getComponentInstancesForWebsite(
                            website.S,
                            component.M.component.S,
                          );
                          if (total === null) {
                            return (siteFetchStatus()[website.S] ?? "idle") ===
                              "loading"
                              ? "Loading..."
                              : "Not loaded";
                          }
                          return `${total} instances`;
                        })()}
                        )
                      </Summary>
                      <ChildWrapper>
                        <Table>
                          <thead>
                            <tr>
                              <TH>Page</TH>
                              <TH>Client Library</TH>
                              <TH>Instances</TH>
                            </tr>
                          </thead>
                          <tbody>
                            <For
                              each={getPagesForComponent(
                                website.S,
                                component.M.component.S,
                              )}
                              fallback={
                                <tr>
                                  <TD colSpan={3}>
                                    {(siteFetchStatus()[website.S] ??
                                      "idle") === "loading"
                                      ? "Loading..."
                                      : "No pages found."}
                                  </TD>
                                </tr>
                              }
                            >
                              {(page) => (
                                <tr>
                                  <TD width="100%">
                                    <a target="_blank" href={page.page}>
                                      {page.page}
                                    </a>
                                  </TD>
                                  <TD>{page.clientlib}</TD>
                                  <TD>{page.componentInstances}</TD>
                                </tr>
                              )}
                            </For>
                          </tbody>
                        </Table>
                      </ChildWrapper>
                    </Details>
                  )}
                </For>
              </ChildWrapper>
            </Details>
          )}
        </For>
      </Show>
    </>
  );
};
