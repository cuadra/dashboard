interface Components {
  url: string;
  clientlib: string;
}

export const crawler = (
  node: any,
  clientlib: string,
  url: string,
  components: Map<string, Components[]> = new Map(),
) => {
  if (!node || typeof node !== "object") return components;

  if (typeof node[":type"] === "string") {
    const t = node[":type"];
    const arr = components.get(t) ?? [];
    arr.push({ clientlib, url });
    components.set(t, arr);
  }

  const items = node[":items"];
  if (items && typeof items === "object") {
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

export const condensePageComponent = (pageComponentMap, clientlib) => {
  const pageComponentTotals: Map<string, { total: number; clientlib: string }> =
    new Map();
  for (const [key, value] of pageComponentMap.entries()) {
    pageComponentTotals.set(key, { total: value.length, clientlib: clientlib });
  }
  return pageComponentTotals;
};
