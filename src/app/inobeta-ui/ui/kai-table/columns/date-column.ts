import { formatDate } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  ViewEncapsulation,
} from "@angular/core";
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
    <ng-container matColumnDef matSort>
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
        {{ transform(dataAccessor(data, name)) }}
      </td>
    </ng-container>
  `,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.Default,
  providers: [{ provide: IbColumn, useExisting: IbDateColumn }]
})
export class IbDateColumn<T> extends IbColumn<T> {
  @Input() format = "dd/MM/yyyy HH:mm z";
  @Input() locale = "it";

  transform = (data) => formatDate(data, this.format, this.locale);
}
