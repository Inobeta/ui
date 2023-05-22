export enum IbFilterOperator {
  NONE,
  EQUALS,
  NOT_EQUALS,
  LESS_THAN,
  LESS_THAN_EQUALS,
  GREATHER_THAN,
  GREATHER_THAN_EQUALS,
  CONTAINS,
  NOT_CONTAINS,
  STARTS_WITH,
  ENDS_WITH,
  AND,
  OR,
}

export interface IbFilterDef {
  operator: IbFilterOperator;
  value: IbFilterDef[] | string | number;
}

export interface IbFilterSyntax {
  [key: string]: IbFilterDef;
}
