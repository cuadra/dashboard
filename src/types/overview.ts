export type DynamoString = {
  S: string;
};

export type DynamoNumber = {
  N: string;
};

export type DynamoList<T> = {
  L: T[];
};

export type DynamoMap<T> = {
  M: T;
};

export interface OverviewComponentMap {
  component: DynamoString;
  count: DynamoNumber;
  websites: DynamoList<DynamoString>;
  clientlibs: DynamoList<DynamoString>;
}

export interface OverviewFiltersMap {
  websites: DynamoList<DynamoString>;
  clientlibs: DynamoList<DynamoString>;
  components: DynamoList<DynamoMap<OverviewComponentMap>>;
}

export interface OverviewMap {
  filters: DynamoMap<OverviewFiltersMap>;
}

export interface OverviewRecord {
  PK: DynamoString;
  SK: DynamoString;
  overview: DynamoMap<OverviewMap>;
}
