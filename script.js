import scrutari from "scrutari";
import { writeFile } from "node:fs/promises";
import { domains } from "./sites.js";
const types = new Map();

function walk(node, clientlib, page, domain) {
  if (!node || typeof node !== "object") return;

  if (typeof node[":type"] === "string") {
    const t = node[":type"];

    //console.log("found type:", t, types.has(t));
    if (!types.has(t)) {
      types.set(t, [{ domain: domain, clientlib: clientlib, page: page }]);
    } else {
      const arr = types.get(t);
      arr.push({ domain: domain, clientlib: clientlib, page: page });
      types.set(t, arr);
    }
  }

  const items = node[":items"];
  if (items && typeof items === "object") {
    for (const child of Object.values(items))
      walk(child, clientlib, page, domain);
  }

  // Sometimes there are arrays too
  for (const v of Object.values(node)) {
    if (Array.isArray(v)) v.forEach(walk, clientlib, page, domain);
  }
}

const pages = [];
for (const domain of domains) {
  const s = await scrutari({ origin: `https://${domain}` });
  pages.push(s.split(", "));
}

const list = pages.flat();

const fetchPromises = list.map(async (page) => {
  const j = `${page}.model.json`;
  const urlObj = new URL(page);
  let domain = urlObj.hostname;
  domain = domain.replace("www.", "");

  const response = await fetch(j);
  const res = await response.json();

  walk(res, res.clientAppVersion, page, domain);
});

Promise.allSettled(fetchPromises).then(async (results) => {
  const output = Object.fromEntries(types);

  await writeFile(
    "./data/components.json",
    JSON.stringify(output, null, 2),
    "utf8",
  );
});
