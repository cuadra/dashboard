interface Components {
  url: string;
  clientlib: string;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

export const crawler = (
  node: unknown,
  clientlib: string,
  url: string,
  components: Map<string, Components[]> = new Map(),
) => {
  if (!isRecord(node)) return components;

  const nodeType = node[":type"];
  if (typeof nodeType === "string") {
    const t = nodeType;
    const arr = components.get(t) ?? [];
    arr.push({ clientlib, url });
    components.set(t, arr);
  }

  const items = node[":items"];
  if (isRecord(items)) {
    for (const child of Object.values(items)) {
      crawler(child, clientlib, url, components);
    }
  }

  for (const v of Object.values(node)) {
    if (Array.isArray(v)) {
      v.forEach((child) => crawler(child, clientlib, url, components));
    }
  }

  return components;
};

export const condensePageComponent = (
  pageComponentMap: Map<string, Components[]>,
  clientlib: string,
) => {
  const pageComponentTotals: Map<string, { total: number; clientlib: string }> =
    new Map();
  for (const [key, value] of pageComponentMap.entries()) {
    pageComponentTotals.set(key, { total: value.length, clientlib: clientlib });
  }
  return pageComponentTotals;
};
