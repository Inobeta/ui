import { IbFilterDef, IbFilterOperator } from "./filter.types";

export const eq = (value: any): IbFilterDef => ({
  operator: IbFilterOperator.EQUALS,
  value,
});
export const neq = (value: any): IbFilterDef => ({
  operator: IbFilterOperator.NOT_EQUALS,
  value,
});
export const gt = (value: any): IbFilterDef => ({
  operator: IbFilterOperator.GREATER_THAN,
  value,
});
export const gte = (value: any): IbFilterDef => ({
  operator: IbFilterOperator.GREATER_THAN_EQUALS,
  value,
});
export const lt = (value: any): IbFilterDef => ({
  operator: IbFilterOperator.LESS_THAN,
  value,
});
export const lte = (value: any): IbFilterDef => ({
  operator: IbFilterOperator.LESS_THAN_EQUALS,
  value,
});
export const contains = (value: any): IbFilterDef => ({
  operator: IbFilterOperator.CONTAINS,
  value,
});
export const ncontains = (value: any): IbFilterDef => ({
  operator: IbFilterOperator.NOT_CONTAINS,
  value,
});
export const startsWith = (value: any): IbFilterDef => ({
  operator: IbFilterOperator.STARTS_WITH,
  value,
});
export const endsWith = (value: any): IbFilterDef => ({
  operator: IbFilterOperator.ENDS_WITH,
  value,
});

export const and = (value: any): IbFilterDef => ({
  operator: IbFilterOperator.AND,
  value,
});
export const or = (value: any): IbFilterDef => ({
  operator: IbFilterOperator.OR,
  value,
});

export const none = (): IbFilterDef => ({
  operator: IbFilterOperator.NONE,
  value: '',
});

export function applyFilter(filter: IbFilterDef, filterValue: any): boolean {
  if (!filter) {
    return true;
  }

  if (!filter.operator) {
    return true;
  }

  if (filter.operator === IbFilterOperator.OR) {
    return (filter.value as IbFilterDef[]).some((subFilter) =>
      applyFilter(subFilter, filterValue)
    );
  }

  if (filter.operator === IbFilterOperator.AND) {
    return (filter.value as IbFilterDef[]).every((subFilter) =>
      applyFilter(subFilter, filterValue)
    );
  }

  return evalOperation(filter.operator, filter.value, filterValue);
}

export function evalOperation(
  operation: IbFilterOperator,
  value: any,
  filterValue: any
): boolean {
  const valueType = typeof value;
  const filterValueType = typeof filterValue;

  if (filterValue instanceof Date) {
    filterValue = filterValue.toISOString();
  }

  if (valueType == "string") {
    value = (value as string).trim().toLowerCase();
  }

  if (filterValueType == "string") {
    filterValue = (filterValue as string).trim().toLowerCase();

    if (operation === IbFilterOperator.CONTAINS) {
      return filterValue.indexOf(value) != -1;
    }

    if (operation === IbFilterOperator.NOT_CONTAINS) {
      return filterValue.indexOf(value) === -1;
    }

    if (operation === IbFilterOperator.STARTS_WITH) {
      return filterValue.startsWith(value);
    }

    if (operation === IbFilterOperator.ENDS_WITH) {
      return filterValue.endsWith(value);
    }
  }

  if (operation === IbFilterOperator.EQUALS) {
    return filterValue === value;
  }

  if (operation === IbFilterOperator.GREATER_THAN) {
    return filterValue > value;
  }

  if (operation === IbFilterOperator.GREATER_THAN_EQUALS) {
    return filterValue >= value;
  }

  if (operation === IbFilterOperator.LESS_THAN) {
    return filterValue < value;
  }

  if (operation === IbFilterOperator.LESS_THAN_EQUALS) {
    return filterValue <= value;
  }
  return false;
}
