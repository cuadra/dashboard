import 'dotenv/config';
import scrutari from "scrutari";

import { Pool } from "pg";

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
  const metadata = res["metaTags"] || [];
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

const tableNames = new Set([
  "snapshots",
  "sites",
  "pages",
  "tealium_datalayer",
  "wizard_attributes",
  "components",
  "page_component_index",
  "errors",
])



const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT),
});

const insetObject = async (client, table, object) => {
  //insert into table with values, return ID

  if(!tableNames.has(table)){
    throw new Error(`Table ${table} is not allowed`);
  }

  const entries = Object.entries(object);
  const keys = entries.map(([key]) => key);
  const values = entries.map(([, value]) => value);

  const insetText = `INSERT INTO ${table} (${keys.join(", ")}) VALUES (${keys.map((_, i) => `$${i + 1}`).join(", ")}) RETURNING id`;

  try {
    const res = await client.query(insetText, values);
    return res.rows[0].id;
  } catch (err) {
    console.error(`Error inserting into ${table}:`, err);
    throw err;
  }
};


const client = await pool.connect();


try{
await client.query("BEGIN");

const r = await client.query(
  `INSERT INTO snapshots DEFAULT VALUES RETURNING id`
);

const snapshot_id = r.rows[0].id;


for (const key of domainMap.keys()) {
  const site_row = {
    domain: key,
    snapshot_id: snapshot_id,
  };

  const site_id = await insetObject(client, "sites", site_row);

  //add domain to site table, return ID, then set in map
  domainMap.set(key, { id: site_id, snapshot_id: snapshot_id });
}

const getOrCreateComponentId = async (client, name, snapshot_id) => {
  const query = `
    INSERT INTO components (name, snapshot_id)
    VALUES ($1, $2)
    ON CONFLICT (snapshot_id, name)
    DO UPDATE SET name = EXCLUDED.name
    RETURNING id
  `;

  const res = await client.query(query, [name, snapshot_id]);
  return res.rows[0].id;
};

for (const r of results) {
  if (r.status === "fulfilled") {
    if (r.value.ok) {
      const site_id = domainMap.get(r.value.pageObject.domain).id;
      //return site ID
console.log('////// last modified', r.value.pageObject.lastModified)

      const page_row = {
        path: new URL(r.value.pageObject.url).pathname,
        design_token: r.value.pageObject.designToken,
        clientlib: r.value.pageObject.clientlib,
        url: r.value.pageObject.url,
        raw: r.value.pageObject.raw,
        last_modified: new Date(Number(r.value.pageObject.lastModified)).toISOString(),
        site_id: site_id,
        snapshot_id: snapshot_id,
      };
      const page_id = await insetObject(client,"pages", page_row);
      //returns page ID

      /*
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
      */

      for (const component of r.value.pageObject.components) {
        //keep pushing to component table like an array

        const component_id = await getOrCreateComponentId(client, {name:component}, snapshot_id);
        //returns component_ID

        const page_component_index_row = {
          page_id: page_id,
          component_id: component_id,
          snapshot_id: snapshot_id,
          site_id: site_id,
        };
        await insetObject(
          client,
          "page_component_index",
          page_component_index_row,
        );

      }

      //create bugs
      const metadata = r.value.pageObject["metadata"] || [];

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
              bug_type: "metadata",
              bug_message: `Unexpected metadata name: ${meta.name}`,
              snapshot_id: snapshot_id,
              severity: "low",
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
              bug_type: "metadata",
              bug_message: `Unexpected metadata name: ${meta.property}`,
              snapshot_id: snapshot_id,
              severity: "low",
            });
          }
        }
      });

      //check if each metadataTag is present, if not add error message
      missingTags.forEach((tag) => {
        errors_table.push({
          page_id: page_id,
          bug_type: "metadata",
          bug_message: `Missing metadata tag: ${tag}`,
          snapshot_id: snapshot_id,
          severity: "low",
        });
      });
      //insert all errors for page
      for (const error of errors_table) {
        await insetObject(client, "errors", error);
      }
    }
  }
};

await client.query("COMMIT");

}catch(err){
  console.error("Transaction error:", err);
  await client.query("ROLLBACK");
  throw err;
} finally {
  client.release();
  await pool.end();
}