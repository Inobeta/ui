export enum IbFilterOperator {
  NONE,
  EQUALS,
  NOT_EQUALS,
  LESS_THAN,
  LESS_THAN_EQUALS,
  GREATER_THAN,
  GREATER_THAN_EQUALS,
  CONTAINS,
  NOT_CONTAINS,
  STARTS_WITH,
  ENDS_WITH,
  AND,
  OR,
}

export type IbFilterDef = {
  operator: IbFilterOperator;
  value: IbFilterDef[] | string | number;
}

export type IbFilterSyntax  = Record<string, IbFilterDef>;

export type IbTextFilterCriteria = {
  operator: IbFilterOperator;
  value: string;
}

export type IbTagFilterCriteria<T = string> = T[];

export type IbNumberFilterCriteria = {
  min: number;
  max: number;
}

export enum IbDateFilterCategory {
  WITHIN = "within",
  MORE_THAN = "moreThan",
  RANGE = "range",
}

export enum IbDateFilterPeriod {
  MINUTES = 1,
  HOURS,
  DAYS,
  WEEKS,
}

export type IbDateFilterPeriodCriteria = {
  period: IbDateFilterPeriod;
  value: number;
}

export type IbDateFilterRangeCriteria = {
  start: Date;
  end: Date;
}

export type IbDateFilterCriteria = {
  categorySelected: IbDateFilterCategory;
  moreThan: IbDateFilterPeriodCriteria;
  within: IbDateFilterPeriodCriteria;
  range: IbDateFilterRangeCriteria;
}
