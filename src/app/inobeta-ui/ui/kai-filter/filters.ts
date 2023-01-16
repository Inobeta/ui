export const eq = (value) => ({ _eq: value });
export const gt = (value) => ({ _gt: value });
export const gte = (value) => ({ _gte: value });
export const lt = (value) => ({ _lt: value });
export const lte = (value) => ({ _lte: value });
export const contains = (value) => ({ _contains: value });
export const ncontains = (value) => ({ _ncontains: value });
export const startsWith = (value) => ({ _starts_with: value });
export const endsWith = (value) => ({ _ends_with: value });

export const and = (c) => ({ _and: c });
export const or = (c) => ({ _or: c });

export function applyFilter(filter: any, filterValue: any) {
  if (!filter) {
    return true;
  }
  for (const [key, value] of Object.entries<any[]>(filter)) {
    if (key === '_or') {
      return value.some((subFilter) => applyFilter(subFilter, filterValue));
    }

    if (key === '_and') {
      return value.every((subFilter) => applyFilter(subFilter, filterValue));
    }

    return evalOperation(key, value, filterValue);
  }
}

export function evalOperation(operation, value, filterValue) {
  const valueType = typeof value;
  const filterValueType = typeof filterValue;
  if (valueType == 'string') {
    value = (value as string).trim().toLowerCase();
  }
  if (filterValueType == 'string') {
    filterValue = (filterValue as string).trim().toLowerCase();

    if (operation === '_contains') {
      return filterValue.indexOf(value) != -1;
    }

    if (operation === '_ncontains') {
      return filterValue.indexOf(value) === -1;
    }

    if (operation === '_starts_with') {
      return filterValue.startsWith(value);
    }

    if (operation === '_ends_with') {
      return filterValue.endsWith(value);
    }
  }

  if (operation === '_eq') {
    return filterValue === value;
  }

  if (operation === '_gt') {
    return filterValue > value;
  }

  if (operation === '_gte') {
    return filterValue >= value;
  }

  if (operation === '_lt') {
    return filterValue < value;
  }

  if (operation === '_lte') {
    return filterValue <= value;
  }
}
