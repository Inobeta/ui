import { formatNumber } from "@angular/common";
import {
  Component,
  Directive,
  Inject,
  Optional,
  TemplateRef,
} from "@angular/core";
import { MatTableDataSource } from "@angular/material/table";
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

abstract class IbAggregate {
  abstract name: string;
  abstract label: string;
  abstract type: string;
  aggregate(
    dataSource: MatTableDataSource<unknown>,
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

  abstract aggregateData(data: any[]): any;
}

class IbSumAggregate extends IbAggregate {
  name = "sum";
  label = "shared.aggregate.sum";
  type = "number";

  aggregateData(data: any[]) {
    const total = data.reduce((acc, cur) => acc + cur, 0);
    return formatNumber(total, "it", "1.0-2");
  }
}

export const IbSumAggregateProvider = {
  provide: IB_AGGREGATE,
  useClass: IbSumAggregate,
  multi: true,
};

class IbAverageAggregate extends IbAggregate {
  name = "avg";
  label = "shared.aggregate.avg";
  type = "number";

  aggregateData(data: any[]) {
    const average = data.reduce((acc, cur) => acc + cur, 0) / data.length;
    return formatNumber(average, "it", "1.0-2");
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
    <button
      mat-icon-button
      [matMenuTriggerFor]="menu"
      [matTooltip]="'shared.aggregate.apply' | translate"
    >
      <mat-icon>functions</mat-icon>
    </button>
    <mat-menu #menu="matMenu">
      <button
        *ngFor="let function of availableFunctions"
        mat-menu-item
        (click)="apply(function.name)"
      >
        {{ function.label | translate }}
      </button>
    </mat-menu>
    <span
      class="ib-aggregate-display"
      [matTooltip]="'shared.aggregate.help' | translate"
      >{{ display }}</span
    >
  `,
})
export class IbAggregateCell {
  function: string;
  result: IbAggregateResult;
  get display() {
    if (!this.function) {
      return "-- (--)";
    }
    this.aggregate();
    return `${this.result.currentPage} (${this.result.total})`;
  }

  get availableFunctions() {
    return this.functions.filter((f) => f.type === this.type);
  }

  constructor(
    @Inject(IB_COLUMN) private column: any,
    @Optional() @Inject(IB_AGGREGATE_TYPE) private type: string,
    @Optional() @Inject(IB_AGGREGATE) private functions: IbAggregate[]
  ) {}

  apply(fun: string) {
    this.function = fun;
  }

  aggregate() {
    const strategy = this.availableFunctions.find(
      (f) => f.name === this.function
    );
    this.result = strategy.aggregate(
      this.column._table.dataSource,
      this.column.name
    );
  }
}
