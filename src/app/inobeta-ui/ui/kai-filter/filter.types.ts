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
};

export type IbFilterSyntax = Record<string, IbFilterDef>;
//FIXME: why ibSearchBar is not in IbFilterSyntax? It should be a text filter with operator "contains"
export type IbFilterSyntaxExtended = IbFilterSyntax & { ibSearchBar?: string };

export type IbTextFilterCriteria = {
  operator: IbFilterOperator;
  value: string;
};

export type IbTagFilterCriteria<T = string> = T[];

export type IbNumberFilterCriteria = {
  min: number;
  max: number;
};

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
};

export type IbDateFilterRangeCriteria = {
  start: Date;
  end: Date;
};

export type IbDateFilterCriteria = {
  categorySelected: IbDateFilterCategory;
  moreThan: IbDateFilterPeriodCriteria;
  within: IbDateFilterPeriodCriteria;
  range: IbDateFilterRangeCriteria;
};

/**
 * Text query object.
 *
 * Provides a regular expression or a `like` pattern.
 */
export type IbTextQuery = {
  /**
   * Generated regular expression.
   * The result depends on the selected condition.
   *
   * | Condition   | Regex       |
   * |-------------|-------------|
   * | Contains    | `.*apple.*` |
   * | Starts with | `^apple.*`  |
   * | Ends with   | `.*apple$`  |
   * | Equals      | `^apple$`   |
   */
  regex: string;
  /**
   * Generated pattern to be used in a SQL LIKE operation.
   * The result depends on the selected condition.
   *
   * | Condition   | Pattern   |
   * |-------------|-----------|
   * | Contains    | `%apple%` |
   * | Starts with | `apple%`  |
   * | Ends with   | `%apple`  |
   * | Equals      | `apple`   |
   */
  like: string;
  /**
   * Condition provided by the user
   *
   * | Condition   | Operator   |
   * |-------------|-----------|
   * | Contains    | IbFilterOperator.CONTAINS    |
   * | Starts with | IbFilterOperator.STARTS_WITH |
   * | Ends with   | IbFilterOperator.ENDS_WITH   |
   * | Equals      | IbFilterOperator.EQUALS      |
   *
   * @example
   * ```typescript
   * if (filter.title.condition === IbFilterOperator.STARTS_WITH) {
   *    // your login
   * }
   * ```
   */
  condition: IbFilterOperator;
  /** Query provided by the user */
  text: string;
};

/**
 * Number query object.
 *
 * Provides a range of numbers.
 */
export type IbNumberQuery = {
  /** Minimum value of the range */
  min: number;
  /** Maximum value of the range */
  max: number;
};

/**
 * Options query object.
 *
 * Provides a list of options selected.
 */
export type IbTagQuery<T = string> = {
  /** Array of options selected */
  items: T[];
  /** String of options separated by a comma */
  joined: string;
};

/**
 * Date query object.
 *
 * Provides a range of a dates.
 */
export type IbDateQuery = {
  /** Start date of the interval in ISO format */
  start: string;
  /** End date of the interval in ISO format */
  end: string;
};
