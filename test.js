import 'dotenv/config';

import { Pool } from "pg";

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT) || 5432,
});

async function getAllBugs() {
  const result = await pool.query(
`
SELECT errors.bug_type, errors.bug_message, errors.severity, pages.url
FROM errors
JOIN pages ON errors.page_id = pages.id
WHERE errors.snapshot_id = (
	SELECT id
	FROM snapshots
	ORDER BY id DESC
	LIMIT 1
)

`
  );
  return result.rows;
}

async function main() {
  const bugs = await getAllBugs();

  const domainMap = new Map();

for (const bug of bugs) {
    const url = new URL(bug.url);

    const domain = url.hostname;
    if (!domainMap.has(domain)) {
        domainMap.set(domain, new Map());
    }

    const pageMap = domainMap.get(domain);
    const page = url.pathname;
    if (!pageMap.has(page)) {
        pageMap.set(page, []);
    }
    pageMap.get(page).push({
        bug_type: bug.bug_type,
        bug_message: bug.bug_message,
        severity: bug.severity,
    });

}

const json = {};
for (const [domain, pageMap] of domainMap.entries()) {
    json[domain] = {};
    for (const [page, bugs] of pageMap.entries()) {
        json[domain][page] = bugs;
    }
}
    console.log(JSON.stringify(json, null, 2));

  await pool.end();
}

main().catch(console.error);
