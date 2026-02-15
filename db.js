import scrutari from "scrutari";
import { writeFile } from "node:fs/promises";
import { domains } from "./sites.js";

const components = new Set();
const clientlibs = new Set();
const sites = [];

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

  for (const [key, value] of types.entries()) {
    components.add(key);
    const existing = temp.get(key) ?? [];
    temp.set(key, existing.concat(value));
  }

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
                component: c,
                count: temp.get(c)?.length ?? 0,
              },
            })),
          },
        },
      },
    },
  },
};

console.log(temp);
/*
await writeFile(
  "./data/overview.json",
  JSON.stringify(overview, null, 2),
  "utf8",
);
*/
console.log("overview:", JSON.stringify(overview));
const comp = {
  PK: { S: "DATASET#CURRENT" },
  SK: { S: "COMPONENTS" },
  components: {},
};

//console.log("entireMap:", temp);
// console.log("processedPages:", processedPages);
// console.log("errorPages:", errorPages);

// await writeFile("./data/componentsMap.json", JSON.stringify(Object.fromEntries(temp), null, 2), "utf8");
