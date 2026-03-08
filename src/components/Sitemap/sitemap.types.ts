export type TPage = {
  url: string;
  children: TChildren;
  clientlib?: string;
  totalComponents?: number;
  instances?: number;
  token?: string;
  lastModified?: number;
};

export type TChildren = TPage[];
