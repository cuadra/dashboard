import scrutari from "scrutari";
import { mkdir, writeFile } from "node:fs/promises";
import { domains } from "./src/data/sites.js";
import { crawler, condensePageComponent } from "./crawler.ts";

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
  const designToken = res["designTokenFilePath"] || null;
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

//console.log(allSites);

const stamp = new Date().toISOString().split("T")[0];

await mkdir(`./src/data/${stamp}`, { recursive: true });

await writeFile(
  `./src/data/${stamp}/overview.json`,
  JSON.stringify(overview, null, 2),
  "utf8",
);
////////////////////////// create website overview JSON

const websitesJson = {};
websitesJson.websites = [...allSites.entries()]
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([domain, pages]) => {
    let lastModified = null;
    let totalInstances = 0;
    let componentSet = new Map();
    const clientlibs = new Set();
    const tokens = new Set();

    pages.forEach((page) => {
      if (page?.clientlib) {
        clientlibs.add(page.clientlib);
      }
      if (page?.designToken) {
        tokens.add(page.designToken);
      }

      const pageLast =
        typeof page.lastModified === "number"
          ? page.lastModified
          : Number.isFinite(Date.parse(page.lastModified))
            ? Date.parse(page.lastModified)
            : null;
      if (
        pageLast !== null &&
        (lastModified === null || pageLast > lastModified)
      ) {
        lastModified = pageLast;
      }

      for (const [key, value] of page.components) {
        const count = value?.total ?? 0;
        totalInstances += count;
        componentSet.set(key, (componentSet.get(key) ?? 0) + count);
      }
    });

    const clientlib =
      clientlibs.size === 1
        ? [...clientlibs][0]
        : clientlibs.size === 0
          ? null
          : "mixed";
    const token =
      tokens.size === 1 ? [...tokens][0] : tokens.size === 0 ? null : "mixed";

    componentSet = [...componentSet.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([name, instances]) => ({
        name,
        instances,
      }));

    return {
      lastModified: lastModified,
      clientlib: clientlib,
      designToken: token,
      totalInstances: totalInstances,
      domain,
      componentCount: componentSet.length,
      components: componentSet,
    };
  });

await writeFile(
  `./src/data/${stamp}/websites.json`,
  JSON.stringify(websitesJson, null, 2),
  "utf8",
);
const componentsJsonMap = new Map();

for (const [site, siteValue] of allSites) {
  siteValue.forEach((page) => {
    for (const [component, componentValue] of page.components) {
      const pageInstances = componentValue?.total ?? 0;
      if (!componentsJsonMap.has(component)) {
        componentsJsonMap.set(component, new Map());
      }

      const sitesMap = componentsJsonMap.get(component);
      if (!sitesMap.has(site)) {
        sitesMap.set(site, {
          clientlibs: new Set(),
          totalInstances: 0,
        });
      }

      const siteComponentData = sitesMap.get(site);
      siteComponentData.clientlibs.add(page.clientlib ?? null);
      siteComponentData.totalInstances += pageInstances;
    }
  });
}

const componentsJson = {
  components: [...componentsJsonMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([component, sitesMap]) => {
      const sites = [...sitesMap.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([domain, siteData]) => {
          const clientlibs = [...siteData.clientlibs].filter(
            (value) => value !== null,
          );
          const clientlib =
            clientlibs.length === 1
              ? clientlibs[0]
              : clientlibs.length === 0
                ? null
                : "mixed";
          return {
            domain,
            clientlib,
            totalInstances: siteData.totalInstances,
          };
        });

      const totalInstances = sites.reduce(
        (sum, site) => sum + (site.totalInstances ?? 0),
        0,
      );

      return {
        component,
        totalInstances,
        sites,
      };
    }),
};
await writeFile(
  `./src/data/${stamp}/components.json`,
  JSON.stringify(componentsJson, null, 2),
  "utf8",
);
