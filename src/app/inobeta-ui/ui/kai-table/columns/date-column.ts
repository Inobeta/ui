import { formatDate } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  input,
  ViewEncapsulation,
} from "@angular/core";
import { IB_COLUMN } from "../tokens";
import { IbColumn } from "./column";
import { IB_COLUMN_MAT_SORT_PROVIDER } from "./column-sort.provider";

/**
 * Column that shows a formatted date for the row cells.
 *
 * By default, the name of this column will be the header text and data property accessor.
 * The header text can be overridden with the `headerText` input. Cell values can be overridden with
 * the `dataAccessor` input. Change the date-time components using
 * the `format` input. Same as `DatePipe` or `formatDate` function.
 */
@Component({
  selector: "ib-date-column",
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
      <td mat-cell *matCellDef="let data">
         {{ dataAccessor()(data, name()) | date : format() : undefined : locale() }}
      </td>
      <td mat-footer-cell *matFooterCellDef>
      </td>
    </ng-container>
  `,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.Eager,
  providers: [
    { provide: IbColumn, useExisting: IbDateColumn },
    { provide: IB_COLUMN, useExisting: IbDateColumn },
  ],
  viewProviders: [IB_COLUMN_MAT_SORT_PROVIDER],
  standalone: false
})
export class IbDateColumn<T> extends IbColumn<T> {
  readonly format = input("dd/MM/yyyy HH:mm z");
  readonly locale = input("it");
  ngOnInit() {
    super.ngOnInit();
    this.filterDataAccessor.set((data: T, name: string) => new Date(this.dataAccessor()(data, name)).getTime());
  }

  /** @ignore */
  transform = { pdf: (data) => formatDate(data, this.format(), this.locale()) };

  mobileDataRenderer(data: T, name: string): string {
    const value = this.dataAccessor()(data, name);
    return formatDate(value, this.format(), this.locale());
  }
}
