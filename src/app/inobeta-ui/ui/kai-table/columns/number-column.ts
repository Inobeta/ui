import {
  ChangeDetectionStrategy,
  Component,
  input,
  ViewEncapsulation,
} from "@angular/core";
import { IB_AGGREGATE_TYPE, IB_COLUMN } from "../tokens";
import { IbColumn } from "./column";
import { DecimalPipe } from "@angular/common";
import { IB_COLUMN_MAT_SORT_PROVIDER } from "./column-sort.provider";

/**
 * Column that shows a formatted number for the row cells.
 *
 * By default, the name of this column will be the header text and data property accessor.
 * The header text can be overridden with the `headerText` input. Cell values can be overridden with
 * the `dataAccessor` input. Change the decimal representation using the
 * `digitsInfo` input. Same as `DecimalPipe` or `formatNumber` function.
 */
@Component({
  selector: "ib-number-column",
  template: `
    <ng-container
      matColumnDef
      [sticky]="stickyInput()"
      [stickyEnd]="stickyEndInput()"
      >
      <th
        class="ib-table__header-cell"
        mat-header-cell
        *matHeaderCellDef
        mat-sort-header
        [disabled]="!sortInput()"
        >
        {{ headerText() }}
      </th>
      <td mat-cell *matCellDef="let data" [style.text-align]="'end'">
        @if(umPosition() === 'left') {
          {{ um() }}&nbsp;
        }
         {{ dataAccessor()(data, name()) | number : digitsInfo() : locale() }}

        @if(umPosition() === 'right') {
          {{ um() }}
        }
      </td>
      <td mat-footer-cell *matFooterCellDef style="max-width: fit-content">
        @if (aggregateInput()) {
          <ib-aggregate
            [showTotal]="!_table.isRemote()"
            [result]="aggregatedData"
            [function]="aggregationFunction"
            (ibFunctionChange)="handleAggregationChange($event)"
            />
        }
      </td>
    </ng-container>
    `,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.Eager,
  providers: [
    {
      provide: IbColumn,
      useExisting: IbNumberColumn,
    },
    { provide: IB_COLUMN, useExisting: IbNumberColumn },
    { provide: IB_AGGREGATE_TYPE, useValue: "number" },
  ],
  viewProviders: [IB_COLUMN_MAT_SORT_PROVIDER],
  standalone: false
})
export class IbNumberColumn<T> extends IbColumn<T> {
  readonly digitsInfo = input("1.0-2");
  readonly locale = input("it");
  um = input<string>("");
  umPosition = input<'right' | 'left'>("right");

  mobileDataRenderer(data: T, name: string): string {
    const value = this.dataAccessor()(data, name);
    const formattedValue = DecimalPipe.prototype.transform(value, this.digitsInfo(), this.locale()) ?? "";
    if (this.um()) {
      return this.umPosition() === 'left' ? `${this.um()} ${formattedValue}` : `${formattedValue} ${this.um()}`;
    }
    return formattedValue;
  }
}
