import {
  Component,
  Directive,
  EventEmitter,
  Inject,
  Input,
  Optional,
  Output,
  TemplateRef,
} from "@angular/core";
import { IB_AGGREGATE, IB_AGGREGATE_TYPE, IB_COLUMN } from "./tokens";

@Directive({
  selector: "[ibCellDef]",
})
export class IbCellDef {
  constructor(public templateRef: TemplateRef<unknown>) {}
}

export interface IbAggregateResult {
  currentPage?: number | string | undefined;
  total?: number | string | undefined;
}

export abstract class IbAggregate {
  /** Unique identifier for the aggregate function. */
  abstract id: string;
  /** Function name displayed before the results. i18n supported. */
  abstract name: string;
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
    /**
     * Note: this is any to avoid an importing cycle
     */
    dataSource: any,
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
   * @returns Aggregated value.
   */
  abstract aggregateData(data: any[]): number | string;
}

class IbSumAggregate extends IbAggregate {
  id = "sum";
  name = "shared.aggregate.sum.name";
  label = "shared.aggregate.sum.label";
  type = "number";

  aggregateData(data: number[]) {
    return data.reduce((acc, cur) => acc + cur, 0);
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
  type = "number";

  aggregateData(data: number[]) {
    const length = Math.max(data.length, 1);
    return data.reduce((acc, cur) => acc + cur, 0) / length;
  }
}

export const IbAverageAggregateProvider = {
  provide: IB_AGGREGATE,
  useClass: IbAverageAggregate,
  multi: true,
};

@Component({
  selector: "ib-aggregate",
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
        (click)="apply(function.id)"
      >
        {{ function.label | translate }}
      </button>
    </mat-menu>
    <section class="ib-aggregate__display-value">
      <div>
        <span class="mat-caption">{{
          "shared.aggregate.currentPage" | translate
        }}</span>
        {{ result?.currentPage ? (result.currentPage | number) : "--" }}
      </div>

      <div *ngIf="showTotal">
        <span class="mat-caption">{{
          "shared.aggregate.total" | translate
        }}</span>
        {{ result?.total ? (result.total | number) : "--" }}
      </div>
    </section>
  `,
})
export class IbAggregateCell {
  @Input() set function(fun: string) {
    this.updateDisplayName(fun);
  }
  @Input() result: IbAggregateResult = {
    currentPage: undefined,
    total: undefined,
  };

  @Input() showTotal = true;
  @Output() ibFunctionChange = new EventEmitter<string>();

  availableFunctions: IbAggregate[] = [];
  displayName = "";

  constructor(
    @Inject(IB_COLUMN) private column: any,
    @Optional() @Inject(IB_AGGREGATE_TYPE) private type: string,
    @Optional() @Inject(IB_AGGREGATE) private functions: IbAggregate[]
  ) {
    this.availableFunctions = functions.filter((f) => f.type === type);
  }

  apply(fun: string) {
    this.ibFunctionChange.emit(fun);
  }

  updateDisplayName(fun: string) {
    const strategy = this.availableFunctions.find((f) => f.id === fun);
    if (!strategy) {
      this.displayName = "";
      this.result = { currentPage: undefined, total: undefined };
      return;
    }

    this.displayName = strategy.name;
  }
}
