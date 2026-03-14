import scrutari from "scrutari";
import { mkdir, writeFile } from "node:fs/promises";
import { domains } from "./src/data/config.js";
import { crawlPage } from "./crawler.ts";

const sites = [];

for (const domain of domains) {
  const s = await scrutari({ origin: `https://${domain}` });

  sites.push(s.split(", "));
}

const sets = sites.flat();

const domainMap = new Map();

const getDomain = (url) => {
  url = new URL(url);
  return url.hostname.replace(/^www\./, "");
};

const SitePromises = sets.map(async (url) => {
  //returns pageObject
  const j = `${url}.model.json`;

  let domain = getDomain(url);
  domainMap.set(domain, {});

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
  //const pageComponentMap = crawler(res, clientlib, url, new Map());

  const pageComponentsTest = crawlPage(res, []);

  //const pageComponents = condensePageComponent(pageComponentMap);
  const metadata = res["metaTags"] || {};
  const whitelistedExternalDomains = res["whitelistedExternalDomains"] || [];
  const tealiumDatalayer = res["tealiumDataLayer"] || {};

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
    tealiumDataLayer: tealiumDatalayer,
    wizardAttributes: wizardAttributes,
    whitelistedExternalDomains: whitelistedExternalDomains,
    metadata: metadata,
    domain: domain,
    url: url,
    components: pageComponentsTest,
    raw: res,
  };
  return { ok: true, pageObject: pageObject };
});

const results = await Promise.allSettled(SitePromises);

const metadataTags = [
  "og:title",
  "og:description",
  "og:image",
  "twitter:title",
  "twitter:description",
  "twitter:image",
];

const currentTime = new Date().toISOString();

const insetObject = (table, values) => {
  //insert into table with values, return ID
  console.log(`Inserting into ${table}:`, values);
  return 0;
};

const snapshots = {
  created_at: currentTime,
};

const snapshot_id = insetObject("snapshot", snapshots);

for (const key of domainMap.keys()) {
  //add domain to site table, return ID, then set in map
  domainMap.set(key, { id: 0, snapshot_id: snapshot_id });
}

results.forEach((r) => {
  if (r.status === "fulfilled") {
    if (r.value.ok) {
      const site_id = domainMap.get(r.value.pageObject.domain).id;
      //return site ID

      const page_row = {
        path: new URL(r.value.pageObject.url).pathname,
        designToken: r.value.pageObject.designToken,
        clientlib: r.value.pageObject.clientlib,
        url: r.value.pageObject.url,
        raw: JSON.stringify(r.value.pageObject.raw),
        lastModified: r.value.pageObject.lastModified,
        site_id: site_id,
        snapshot_id: snapshot_id,
      };
      const page_id = insetObject("page", page_row);
      //returns page ID

      const tealiumDatalayer_row = {
        ...r.value.pageObject.tealiumDatalayer,
        page_id: page_id,
        snapshot_id: snapshot_id,
      };
      const tealiumDatalayer_id = insetObject(
        "tealium_datalayer",
        tealiumDatalayer_row,
      );

      const wizardAttributes_row = {
        ...r.value.pageObject.wizardAttributes,
        page_id: page_id,
        snapshot_id: snapshot_id,
      };
      const wizardAttributes_id = insetObject(
        "wizard_attributes",
        wizardAttributes_row,
      );

      for (const component of r.value.pageObject.components) {
        //keep pushing to component table like an array

        const component_row = {
          name: component,
          snapshot_id: snapshot_id,
        };
        const component_id = insetObject("components", component_row);
        //returns component_ID

        const page_component_index_row = {
          page_id: page_id,
          component_id: component_id,
          snapshot_id: snapshot_id,
        };
        const page_component_index_id = insetObject(
          "page_component_index",
          page_component_index_row,
        );
        //return ID
      }

      //create bugs
      const metadata = r.value.pageObject["metadata"] || {};

      const normalizeMetaTag = (value) =>
        typeof value === "string" ? value.toLowerCase() : "";
      const resolveMissingTagKey = (value) => {
        if (typeof value !== "string") return "";
        if (value.startsWith("x:")) {
          return `twitter:${value.slice(2)}`;
        }
        return value;
      };

      const errors_table = [];
      const metadataTagsLower = metadataTags.map((tag) => tag.toLowerCase());
      const missingTags = new Set(metadataTagsLower);

      metadata.forEach((meta) => {
        if (meta.name) {
          const nameLower = normalizeMetaTag(meta.name);
          const missingTagKey = resolveMissingTagKey(nameLower);

          if (missingTags.has(missingTagKey)) {
            missingTags.delete(missingTagKey);
          }
          if (!metadataTagsLower.includes(nameLower)) {
            errors_table.push({
              page_id: page_id,
              type: "metadata",
              message: `Unexpected metadata name: ${meta.name}`,
              snapshot_id: snapshot_id,
            });
          }
        }

        if (meta.property) {
          const propertyLower = normalizeMetaTag(meta.property);
          const missingTagKey = resolveMissingTagKey(propertyLower);
          if (missingTags.has(missingTagKey)) {
            missingTags.delete(missingTagKey);
          }
          if (!metadataTagsLower.includes(propertyLower)) {
            errors_table.push({
              page_id: page_id,
              type: "metadata",
              message: `Unexpected metadata name: ${meta.property}`,
              snapshot_id: snapshot_id,
            });
          }
        }
      });

      //check if each metadataTag is present, if not add error message
      missingTags.forEach((tag) => {
        errors_table.push({
          page_id: page_id,
          type: "metadata",
          message: `Missing metadata tag: ${tag}`,
          snapshot_id: snapshot_id,
        });
      });
      //insert all errors for page
      errors_table.forEach((error) => insetObject("errors", error));
    }
  }
});

console.log("Domains processed:", domainMap);
