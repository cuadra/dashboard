type WebsitePageMeta = {
  clientlib?: string;
  components: string[];
  componentCounts: Map<string, number>;
};

export const getWebsiteJSON = (
  websiteMap: Map<string, WebsitePageMeta>,
  domain: string,
) => {
  const pages = [...websiteMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([page, meta]) => ({
      M: {
        page: { S: page },
        clientlib: { S: meta.clientlib ?? "" },
        componentCount: { N: String(meta.components.length) },
        componentCounts: {
          L: [...meta.componentCounts.entries()]
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([component, count]) => ({
              M: {
                component: { S: component },
                count: { N: String(count) },
              },
            })),
        },
        components: {
          L: meta.components.sort().map((c) => ({ S: c })),
        },
      },
    }));

  return {
    PK: { S: "DATASET#CURRENT" },
    SK: { S: `SITE#${domain}` },
    site: {
      M: {
        domain: { S: domain },
        pageCount: { N: String(pages.length) },
        pages: { L: pages },
      },
    },
  };
};
