import { formatNumber } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  ViewEncapsulation,
} from "@angular/core";
import { IbColumn } from "./column";

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
        {{ transform(dataAccessor(data, name)) }}
      </td>
    </ng-container>
  `,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.Default,
  providers: [{ provide: IbColumn, useExisting: IbNumberColumn }],
})
export class IbNumberColumn<T> extends IbColumn<T> {
  @Input() digitsInfo = "1.0-2";
  @Input() locale = "it";

  transform = (data) => formatNumber(data, this.locale, this.digitsInfo);
}
