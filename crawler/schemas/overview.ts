export const generateOverviewJSON = (
  domains: string[],
  temp: Map<string, string>,
  websitesWithTotals: { domain: string; totalComponents: number }[],
  clientlibs: Set<string>,
) => {
  return {
    PK: { S: "DATASET#CURRENT" },
    SK: { S: "OVERVIEW" },
    overview: {
      M: {
        filters: {
          M: {
            websites: {
              L: domains.map((d) => ({ S: d })),
            },
            websitesWithTotals: {
              L: websitesWithTotals.map(({ domain, totalComponents }) => ({
                M: {
                  domain: { S: domain },
                  totalComponents: { N: String(totalComponents) },
                },
              })),
            },
            clientlibs: {
              L: [...clientlibs].map((c) => ({ S: c })),
            },
            components: {
              L: [...temp.entries()].map(([component, refs]) => {
                const websites = [...new Set(refs.map((r) => r.domain))].sort();
                const componentClientlibs = [
                  ...new Set(refs.map((r) => r.clientlib).filter(Boolean)),
                ].sort();

                return {
                  M: {
                    component: { S: component },
                    count: { N: String(refs.length) },
                    websites: {
                      L: websites.map((w) => ({ S: w })),
                    },
                    clientlibs: {
                      L: componentClientlibs.map((c) => ({ S: c })),
                    },
                  },
                };
              }),
            },
          },
        },
      },
    },
  };
};
