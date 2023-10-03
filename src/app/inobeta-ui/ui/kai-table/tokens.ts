import {InjectionToken} from '@angular/core';

/**
 * Used to provide a table to some of the sub-components without causing a circular dependency.
 */
export const IB_TABLE = new InjectionToken<any>("IbTable");

/** Configurable options for `IbColumn`. */
export interface IbColumnOptions<T> {
  /**
   * Default function that provides the header text based on the column name if a header
   * text is not provided.
   */
  defaultHeaderTextTransform?: (name: string) => string;

  /** Default data accessor to use if one is not provided. */
  defaultDataAccessor?: (data: T, name: string) => string;
}

/** Injection token that can be used to specify the text column options. */
export const IB_COLUMN_OPTIONS = new InjectionToken<IbColumnOptions<any>>(
  'ib-column-options',
);