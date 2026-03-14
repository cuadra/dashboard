import scrutari from "scrutari";
import { Client, Pool } from "pg";

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

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

const insetObject = async (table, object) => {
  //insert into table with values, return ID

  const [keys, values] = Object.entries(object);

  const insetText = `INSERT INTO ${table} (${keys.join(", ")}) VALUES (${keys.map((_, i) => `$${i + 1}`).join(", ")}) RETURNING id`;

  try {
    const res = await pool.query(insetText, values);
    return res.rows[0].id;
  } catch (err) {
    console.error(`Error inserting into ${table}:`, err);
  }
};

const snapshots = {
  created_at: currentTime,
};

const snapshot_id = await insetObject("snapshot", snapshots);

for (const key of domainMap.keys()) {
  const site_row = {
    domain: key,
    snapshot_id: snapshot_id,
  };

  const site_id = await insetObject("site", site_row);

  //add domain to site table, return ID, then set in map
  domainMap.set(key, { id: 0, snapshot_id: snapshot_id });
}

results.forEach(async (r) => {
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
      const page_id = await insetObject("page", page_row);
      //returns page ID

      const tealiumDatalayer_row = {
        ...r.value.pageObject.tealiumDatalayer,
        page_id: page_id,
        snapshot_id: snapshot_id,
      };
      const tealiumDatalayer_id = await insetObject(
        "tealium_datalayer",
        tealiumDatalayer_row,
      );

      const wizardAttributes_row = {
        ...r.value.pageObject.wizardAttributes,
        page_id: page_id,
        snapshot_id: snapshot_id,
      };
      const wizardAttributes_id = await insetObject(
        "wizard_attributes",
        wizardAttributes_row,
      );

      for (const component of r.value.pageObject.components) {
        //keep pushing to component table like an array

        const component_row = {
          name: component,
          snapshot_id: snapshot_id,
        };
        const component_id = await insetObject("components", component_row);
        //returns component_ID

        const page_component_index_row = {
          page_id: page_id,
          component_id: component_id,
          snapshot_id: snapshot_id,
        };
        const page_component_index_id = await insetObject(
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
      errors_table.forEach(async (error) => await insetObject("errors", error));
    }
  }
});

console.log("Domains processed:", domainMap);
