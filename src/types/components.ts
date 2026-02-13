export type ComponentUsage = {
  domain: string;
  page: string;
  clientlib?: string;
};

export type ComponentsJson = Record<string, ComponentUsage[]>;
