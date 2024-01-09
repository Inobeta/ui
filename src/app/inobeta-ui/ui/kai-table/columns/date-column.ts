import { formatDate } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  ViewEncapsulation,
} from "@angular/core";
import { IB_COLUMN } from "../tokens";
import { IbColumn } from "./column";

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
      matSort
      [sticky]="sticky"
      [stickyEnd]="stickyEnd"
    >
      <th
        class="ib-table__header-cell"
        mat-header-cell
        *matHeaderCellDef
        [ibSortHeaderFor]="matSort"
        mat-sort-header
        [disabled]="!sort"
      >
        {{ headerText }}
      </th>
      <td mat-cell *matCellDef="let data">
        {{ dataAccessor(data, name) | date : format : undefined : locale }}
      </td>
      <td mat-footer-cell *matFooterCellDef>
        <ib-aggregate *ngIf="aggregate"></ib-aggregate>
      </td>
    </ng-container>
  `,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.Default,
  providers: [
    { provide: IbColumn, useExisting: IbDateColumn },
    { provide: IB_COLUMN, useExisting: IbDateColumn },
  ],
})
export class IbDateColumn<T> extends IbColumn<T> {
  @Input() format = "dd/MM/yyyy HH:mm z";
  @Input() locale = "it";

  /** @ignore */
  pdftransform = (data) => formatDate(data, this.format, this.locale);
  dataAccessor = (data: T, name: string) => (data as any)[name];
}
