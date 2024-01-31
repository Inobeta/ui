import { formatNumber } from "@angular/common";
import {
  Component,
  Directive,
  Inject,
  Optional,
  TemplateRef,
} from "@angular/core";
import { IbTableDataSource } from "./table-data-source";
import { IB_AGGREGATE, IB_AGGREGATE_TYPE, IB_COLUMN } from "./tokens";

@Directive({
  selector: "[ibCellDef]",
})
export class IbCellDef {
  constructor(public templateRef: TemplateRef<unknown>) {}
}

interface IbAggregateResult {
  currentPage: string;
  total: string;
}

/**
 *
 */
export abstract class IbAggregate {
  /** Unique identifier for the aggregate function. */
  abstract id: string;
  /** Function name displayed before the results. i18n supported. */
  abstract name: string;
  /** Text shown hovering the result of the function. i18n supported. */
  abstract help: string;
  /** Menu item label. i18n supported. */
  abstract label: string;
  /**
   * Function type. Used to include this function in the available functions of
   * a given column with the same `IB_AGGREGATE_TYPE` token value.
   * Currently, only `number` is supported.
   */
  abstract type: string;

  /**
   * Calls {@link aggregateData} twice and returns an {@link IbAggregateResult}
   * with the aggregated value for the entire column and the current visible page.
   *
   * It takes into account only filtered data.
   *
   * @param dataSource `IbTableDataSource` compatible data source instance
   * @param column Column name
   */
  aggregate(
    dataSource: IbTableDataSource<unknown>,
    column: string
  ): IbAggregateResult {
    const dataset = dataSource
      ._orderData(dataSource.filteredData)
      .map((i) => i[column]);
    const pagedData = dataSource._pageData(dataset);
    return {
      currentPage: this.aggregateData(pagedData),
      total: this.aggregateData(dataset),
    };
  }

  /**
   * An aggregate function.
   *
   * @param data Data array of a given column.
   * @returns A string representation of the value. In case of a numeric result, use `formatNumber` or `formatCurrency.`
   */
  abstract aggregateData(data: any[]): string;
}

class IbSumAggregate extends IbAggregate {
  id = "sum";
  name = "shared.aggregate.sum.name";
  label = "shared.aggregate.sum.label";
  help = "shared.aggregate.sum.help";
  type = "number";

  aggregateData(data: number[]) {
    const total = data.reduce((acc, cur) => acc + cur, 0);
    return formatNumber(total, "it");
  }
}

export const IbSumAggregateProvider = {
  provide: IB_AGGREGATE,
  useClass: IbSumAggregate,
  multi: true,
};

class IbAverageAggregate extends IbAggregate {
  id = "avg";
  name = "shared.aggregate.avg.name";
  label = "shared.aggregate.avg.label";
  help = "shared.aggregate.avg.help";
  type = "number";

  aggregateData(data: number[]) {
    const length = Math.max(data.length, 1);
    const average = data.reduce((acc, cur) => acc + cur, 0) / length;
    return formatNumber(average, "it");
  }
}

export const IbAverageAggregateProvider = {
  provide: IB_AGGREGATE,
  useClass: IbAverageAggregate,
  multi: true,
};

@Component({
  selector: "ib-aggregate, [ib-aggregate]",
  template: `
    <section class="ib-aggregate__function">
      <button
        mat-icon-button
        [matMenuTriggerFor]="menu"
        [matTooltip]="'shared.aggregate.apply' | translate"
      >
        <mat-icon>functions</mat-icon>
      </button>
      <span class="mat-caption">{{ displayName | translate }}</span>
    </section>
    <mat-menu #menu="matMenu">
      <button
        *ngFor="let function of availableFunctions"
        mat-menu-item
        (click)="apply(function.id, true)"
      >
        {{ function.label | translate }}
      </button>
    </mat-menu>
    <section class="ib-aggregate__display-value">
      <div>
        <span class="mat-caption">{{
          "shared.aggregate.currentPage" | translate
        }}</span>
        {{ result.currentPage }}
      </div>

      <div>
        <span class="mat-caption">{{
          "shared.aggregate.total" | translate
        }}</span>
        {{ result.total }}
      </div>
    </section>
  `,
})
export class IbAggregateCell {
  function: string;
  displayName = "";
  help = "shared.aggregate.help";
  result: IbAggregateResult = {
    currentPage: "--",
    total: "--",
  };
  get displayValue() {
    return `${this.result.currentPage} (${this.result.total})`;
  }

  availableFunctions: IbAggregate[] = [];

  constructor(
    @Inject(IB_COLUMN) private column: any,
    @Optional() @Inject(IB_AGGREGATE_TYPE) private type: string,
    @Optional() @Inject(IB_AGGREGATE) private functions: IbAggregate[]
  ) {
    this.availableFunctions = functions.filter((f) => f.type === type);
  }

  apply(fun: string, update = false) {
    this.function = fun;
    update && this.aggregate();
    update && this.column._table.aggregate.emit();
  }

  aggregate() {
    const strategy = this.availableFunctions.find(
      (f) => f.id === this.function
    );
    if (!strategy) {
      this.displayName = "";
      this.help = "shared.aggregate.help";
      this.result = { currentPage: "--", total: "--" };
      return;
    }

    this.displayName = strategy.name;
    this.help = strategy.help;
    this.result = strategy.aggregate(
      this.column._table.dataSource,
      this.column.name
    );
  }
}
