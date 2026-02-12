import scrutari from "scrutari";
import { writeFile } from "node:fs/promises";

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

const domains = [
  "togetherwithgsk.com",
  "blenrep.com",
  "blenrephcp.com",
  //"jemperli.com",
  "jemperlihcp.com",
  "blujepa.com",
  "blujepahcp.com",
  "gskforyou.com",
  "penmenvyhcp.com",
  "penmenvy.com",
  "ojjaarahcp.com",
  "ojjaara.com",
  "myjemperlijourney.com",
  "nucala.com",
  "nucalahcp.com",
  "gskpaf.org",
  "zejula.com",
  "zejulahcp.com",
  //"shingrix.com",
  "shingrixhcp.com",
  "rsvinadults.com",
  //"arexvy.com",
  "arexvyhcp.com",
];
const pages = [];
for (const domain of domains) {
  const s = await scrutari({ origin: `https://${domain}` });
  pages.push(s.split(", "));
}

const list = pages.flat();

const fetchPromises = list.map(async (page) => {
  const j = `./data/${page}.model.json`;
  //console.log("checking:" + j);
  const response = await fetch(j);
  const res = await response.json();
  const urlObj = new URL(page);
  let domain = urlObj.hostname;
  domain = domain.replace("www.", "");

  walk(res, res.clientAppVersion, page, domain);
});

Promise.allSettled(fetchPromises).then(async (results) => {
  // Process all results (successes and failures) once all are complete
  console.log(types);
  const output = Object.fromEntries(types);
  await writeFile("types.json", JSON.stringify(output, null, 2), "utf8");
  /*
  console.log("Domain Count:", domains.length);
  console.log("Pages: ", list.length);
  console.log("------------------------------");
  types.forEach((value, key) => {
    let trimmed = key.replace(
      "authorableComponents/core/components/brs-pharma-us/component-definitions/",
      "",
    );
    trimmed = trimmed.replace("boreas/components/", "");
    trimmed = trimmed.replace("wcm/foundation/", "");
    trimmed = trimmed.replace("components/", "");
    console.log(trimmed, ": ", value.length);
  });
  */
});
