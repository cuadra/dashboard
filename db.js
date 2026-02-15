import scrutari from "scrutari";
import { mkdir, writeFile } from "node:fs/promises";
import { domains } from "./sites.js";

const components = new Set();
const clientlibs = new Set();
const sites = [];
const websitesMap = new Map();

function walk(node, clientlib, page, domain, types = new Map()) {
  if (!node || typeof node !== "object") return types;

  if (typeof node[":type"] === "string") {
    const t = node[":type"];
    const arr = types.get(t) ?? [];
    arr.push({ domain, clientlib, page });
    types.set(t, arr);
  }

  const items = node[":items"];
  if (items && typeof items === "object") {
    for (const child of Object.values(items)) {
      walk(child, clientlib, page, domain, types);
    }
  }

  for (const v of Object.values(node)) {
    if (Array.isArray(v)) {
      v.forEach((child) => walk(child, clientlib, page, domain, types));
    }
  }

  return types;
}

for (const domain of domains) {
  const s = await scrutari({ origin: `https://${domain}` });
  sites.push(s.split(", "));
}

const sets = sites.flat();

const temp = new Map();

const SitePromises = sets.map(async (page) => {
  const j = `${page}.model.json`;
  const urlObj = new URL(page);
  let domain = urlObj.hostname.replace(/^www\./, "");

  const response = await fetch(j);

  const isJson = response.headers
    .get("content-type")
    ?.toLowerCase()
    .includes("application/json");

  if (!response.ok || !isJson) {
    return { ok: false, page, domain };
  }

  const res = await response.json();

  const clientlib = String(res.clientAppVersion ?? "");
  if (clientlib) clientlibs.add(clientlib);

  const types = walk(res, clientlib, page, domain);
  const pageComponents = [...types.keys()];

  for (const [key, value] of types.entries()) {
    components.add(key);
    const existing = temp.get(key) ?? [];
    temp.set(key, existing.concat(value));
  }

  if (!websitesMap.has(domain)) {
    websitesMap.set(domain, new Map());
  }
  const pagesMap = websitesMap.get(domain);
  pagesMap.set(page, {
    clientlib,
    components: pageComponents,
  });

  return { ok: true, page, domain };
});

const results = await Promise.allSettled(SitePromises);

const processedPages = [];
const errorPages = [];
results.forEach((r) => {
  if (r.status === "fulfilled") {
    if (r.value.ok) processedPages.push(r.value.page);
    else errorPages.push(r.value.page);
  } else {
    errorPages.push("(promise rejected)");
  }
});

const overview = {
  PK: { S: "DATASET#CURRENT" },
  SK: { S: "OVERVIEW" },
  overview: {
    M: {
      filters: {
        M: {
          domains: {
            L: domains.map((d) => ({ S: d })),
          },
          clientlibs: {
            L: [...clientlibs].map((c) => ({ S: c })),
          },
          components: {
            L: [...temp.keys()].map((c) => ({
              M: {
                component: { S: c },
                count: { N: String(temp.get(c)?.length ?? 0) },
              },
            })),
          },
        },
      },
    },
  },
};

console.log("overview:", JSON.stringify(overview));

await mkdir("./data/components", { recursive: true });
await writeFile("./data/overview.json", JSON.stringify(overview, null, 2), "utf8");

const componentItems = [];

for (const [component, refs] of temp.entries()) {
  const sitesMap = new Map();
  const clientlibsForComponent = new Set();

  for (const { domain, page, clientlib } of refs) {
    if (!sitesMap.has(domain)) {
      sitesMap.set(domain, new Set());
    }
    sitesMap.get(domain).add(page);

    if (clientlib) {
      clientlibsForComponent.add(clientlib);
    }
  }

  const websites = [...sitesMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([domain, pages]) => {
      const pageList = [...pages].sort();
      return {
        M: {
          domain: { S: domain },
          pageCount: { N: String(pageList.length) },
          pages: {
            L: pageList.map((p) => ({ S: p })),
          },
        },
      };
    });

  const totalPages = [...sitesMap.values()].reduce(
    (sum, pageSet) => sum + pageSet.size,
    0,
  );

  const item = {
    PK: { S: "DATASET#CURRENT" },
    SK: { S: `COMPONENT#${component}` },
    component: {
      M: {
        name: { S: component },
        websiteCount: { N: String(websites.length) },
        totalPages: { N: String(totalPages) },
        websites: { L: websites },
        clientlibs: {
          L: [...clientlibsForComponent].sort().map((c) => ({ S: c })),
        },
      },
    },
  };

  componentItems.push(item);

  const safeFileName = component.replace(/[^\w.-]+/g, "_");
  await writeFile(
    `./data/components/${safeFileName}.json`,
    JSON.stringify(item, null, 2),
    "utf8",
  );
}

await writeFile(
  "./data/components/items.json",
  JSON.stringify(componentItems, null, 2),
  "utf8",
);

await mkdir("./data/websites", { recursive: true });
const websiteItems = [];

for (const [domain, pagesMap] of websitesMap.entries()) {
  const pages = [...pagesMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([page, meta]) => ({
      M: {
        page: { S: page },
        clientlib: { S: meta.clientlib ?? "" },
        componentCount: { N: String(meta.components.length) },
        components: {
          L: meta.components.sort().map((c) => ({ S: c })),
        },
      },
    }));

  const item = {
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

  websiteItems.push(item);

  const safeFileName = domain.replace(/[^\w.-]+/g, "_");
  await writeFile(
    `./data/websites/${safeFileName}.json`,
    JSON.stringify(item, null, 2),
    "utf8",
  );
}

await writeFile(
  "./data/websites/items.json",
  JSON.stringify(websiteItems, null, 2),
  "utf8",
);

//console.log("entireMap:", temp);
// console.log("processedPages:", processedPages);
// console.log("errorPages:", errorPages);

// await writeFile("./data/componentsMap.json", JSON.stringify(Object.fromEntries(temp), null, 2), "utf8");
