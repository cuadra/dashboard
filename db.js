import scrutari from "scrutari";
import { writeFile } from "node:fs/promises";
import { domains } from "./sites.js";
import { crawler, condensePageComponent } from "./crawler/utils/crawler.ts";

const sites = [];
const errorMessages = new Map();

for (const domain of domains) {
  const s = await scrutari({ origin: `https://${domain}` });
  sites.push(s.split(", "));
}

const sets = sites.flat();

const SitePromises = sets.map(async (url) => {
  //returns pageObject
  const j = `${url}.model.json`;
  const urlObj = new URL(url);
  let domain = urlObj.hostname.replace(/^www\./, "");

  const response = await fetch(j);

  const isJson = response.headers
    .get("content-type")
    ?.toLowerCase()
    .includes("application/json");

  if (!response.ok || !isJson) {
    return { ok: false, pageObject: null };
  }

  const res = await response.json();

  //Collect all clientlibs
  const clientlib = String(res.clientAppVersion ?? "Not Found");
  const pageComponentMap = crawler(res, clientlib, url, new Map());
  const pageComponents = condensePageComponent(pageComponentMap, clientlib);
  const metadata = res["metaTags"] || {};
  const whitelistedExternalDomains = res["whitelistedExternalDomains"] || [];
  const trealiumDatalayer = res["trealiumDataLayer"] || {};
  const wizardAttributes = res["wizardAttributes"] || {};
  const designToken = res["designTokenFilePath"] || {};
  const googleAPIKey =
    res["genericConfigurationMap"]?.Generic.googleApiKey || null;
  const lastModified = res["lastModifiedDate"] || null;
  const pageObject = {
    lastModified: lastModified,
    clientlib: clientlib,
    designToken: designToken,
    googleAPIKey: googleAPIKey,
    trealiumDataLayer: trealiumDatalayer,
    wizardAttributes: wizardAttributes,
    whitelistedExternalDomains: whitelistedExternalDomains,
    metadata: metadata,
    domain: domain,
    url: url,
    components: pageComponents,
  };
  return { ok: true, pageObject: pageObject };
});

const results = await Promise.allSettled(SitePromises);
const processedPages = [];
const errorPages = [];
const overview = {
  clientlibs: new Map(),
  components: new Map(), //include instances
  latestPages: new Map(),
  totalSites: domains.length,
  totalPages: 0,
  tokens: new Map(),
};
const allSites = new Map();

results.forEach((r) => {
  if (r.status === "fulfilled") {
    if (r.value.ok) {
      processedPages.push(r.value.pageObject.url);

      r.value.pageObject.components.forEach((value, key) => {
        if (overview.components.has(key)) {
          overview.components.set(key, overview.components.get(key) + 1);
        } else {
          overview.components.set(key, 1);
        }
      });

      if (allSites.has(r.value.pageObject.domain)) {
        allSites.get(r.value.pageObject.domain).push(r.value.pageObject);
      } else {
        allSites.set(r.value.pageObject.domain, [r.value.pageObject]);
      }

      //Set overview props
      if (overview.clientlibs.has(r.value.pageObject.clientlib)) {
        const arr = overview.clientlibs.get(r.value.pageObject.clientlib);
        if (!arr.includes(r.value.pageObject.domain)) {
          arr.push(r.value.pageObject.domain);
        }
        overview.clientlibs.set(r.value.pageObject.clientlib, [...arr]);
      } else {
        overview.clientlibs.set(r.value.pageObject.clientlib, [
          r.value.pageObject.domain,
        ]);
      }

      if (overview.tokens.has(r.value.pageObject.designToken)) {
        const arr = overview.tokens.get(r.value.pageObject.designToken);
        if (!arr.includes(r.value.pageObject.domain)) {
          arr.push(r.value.pageObject.domain);
        } else {
          overview.tokens.set(r.value.pageObject.designToken, [...arr]);
        }
      } else {
        overview.tokens.set(r.value.pageObject.designToken, [
          r.value.pageObject.domain,
        ]);
      }
      const metadata = r.value.pageObject["metadata"] || {};

      const metadataTags = [
        "og:title",
        "og:description",
        "og:image",
        "twitter:title",
        "twitter:description",
        "twitter:image",
      ];
      const normalizeMetaTag = (value) =>
        typeof value === "string" ? value.toLowerCase() : "";
      const resolveMissingTagKey = (value) => {
        if (typeof value !== "string") return "";
        if (value.startsWith("x:")) {
          return `twitter:${value.slice(2)}`;
        }
        return value;
      };
      const metadataTagsLower = metadataTags.map((tag) => tag.toLowerCase());
      const missingTags = new Set(metadataTagsLower);
      const pushError = (message) => {
        if (errorMessages.has(r.value.pageObject.url)) {
          const messages = errorMessages.get(r.value.pageObject.url);
          messages.push(message);
          errorMessages.set(r.value.pageObject.url, messages);
        } else {
          errorMessages.set(r.value.pageObject.url, [message]);
        }
      };

      metadata.forEach((meta) => {
        if (meta.name) {
          const nameLower = normalizeMetaTag(meta.name);
          const missingTagKey = resolveMissingTagKey(nameLower);
          if (missingTags.has(missingTagKey)) {
            missingTags.delete(missingTagKey);
          }
          if (!metadataTagsLower.includes(nameLower)) {
            pushError(`Unexpected metadata name: ${meta.name}`);
          }
        }

        if (meta.property) {
          const propertyLower = normalizeMetaTag(meta.property);
          const missingTagKey = resolveMissingTagKey(propertyLower);
          if (missingTags.has(missingTagKey)) {
            missingTags.delete(missingTagKey);
          }
          if (!metadataTagsLower.includes(propertyLower)) {
            pushError(`Unexpected metadata property: ${meta.property}`);
          }
        }
      });

      //check if each metadataTag is present, if not add error message
      missingTags.forEach((tag) => {
        pushError(`Missing metadata tag: ${tag}`);
      });

      //check datalayer
      //quick dom checks

      overview.totalPages += 1;
    } else errorPages.push(r.value.pageObject);
  } else {
    errorPages.push("(promise rejected)");
  }
});

overview.errorMessages = Object.fromEntries(errorMessages);

overview.latestPages = [...allSites.values()]
  .flat()
  .sort((a, b) => b.lastModified - a.lastModified)
  .map((item) => {
    return { url: item.url, lastModified: item.lastModified };
  })
  .slice(0, 40);

//console.log(overview);

//change map objects to arrays for JSON serialization

overview.clientlibs = [...overview.clientlibs.entries()].map(
  ([key, value]) => ({
    name: key,
    domains: value,
  }),
);

overview.components = [...overview.components.entries()].map(
  ([key, value]) => ({
    name: key,
    instances: value,
  }),
);
overview.tokens = [...overview.tokens.entries()].map(([key, value]) => ({
  name: key,
  domains: value,
}));

console.log(overview);
await writeFile(
  `./data/overview.json`,
  JSON.stringify(overview, null, 2),
  "utf8",
);

//console.log(allSites);
/*
const websitesWithTotals = domains.map((domain) => {
  const pagesMap = websitesMap.get(domain);
  if (!pagesMap) {
    return { domain, totalComponents: 0 };
  }

  const componentSet = new Set();
  for (const meta of pagesMap.values()) {
    meta.components.forEach((component) => componentSet.add(component));
  }
  return { domain, totalComponents: componentSet.size };
});

const overview = generateOverviewJSON(
  domains,
  temp,
  websitesWithTotals,
  clientlibs,
);
//console.log("allComponents:", [...allComponents].sort());
//console.log("overview:", JSON.stringify(overview, null, 2));

await mkdir("./data/components", { recursive: true });
await writeFile(
  "./data/overview.json",
  JSON.stringify(overview, null, 2),
  "utf8",
);

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
  websiteItems.push(getWebsiteJSON(pages, domain));

  const safeFileName = domain.replace(/[^\w.-]+/g, "_");
  await writeFile(
    `./data/websites/${safeFileName}.json`,
    JSON.stringify(item, null, 2),
    "utf8",
  );
}
*/
/*
await writeFile(
  "./data/websites/items.json",
  JSON.stringify(websiteItems, null, 2),
  "utf8",
);
*/

//console.log("entireMap:", temp);
// console.log("processedPages:", processedPages);
// console.log("errorPages:", errorPages);

// await writeFile("./data/componentsMap.json", JSON.stringify(Object.fromEntries(temp), null, 2), "utf8");
