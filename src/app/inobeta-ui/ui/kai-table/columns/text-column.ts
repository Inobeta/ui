import {
  ChangeDetectionStrategy,
  Component,
  Input,
  ViewEncapsulation,
} from "@angular/core";
import { IB_AGGREGATE_TYPE, IB_COLUMN } from "../tokens";
import { IbColumn } from "./column";

/**
 * Column that simply shows text content for the header and row cells.
 *
 * By default, the name of this column will be the header text and data property accessor.
 * The header text can be overridden with the `headerText` input. Cell values can be overridden with
 * the `dataAccessor` input. Change the text justification to the start or end using the `justify`
 * input.
 */
@Component({
  selector: "ib-text-column",
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
        [style.text-align]="justify"
        [ibSortHeaderFor]="matSort"
        mat-sort-header
        [disabled]="!sort"
      >
        {{ headerText }}
      </th>
      <td mat-cell *matCellDef="let data" [style.text-align]="justify">
        {{ dataAccessor(data, name) }}
      </td>
      <td mat-footer-cell *matFooterCellDef style="max-width: fit-content">
      </td>
    </ng-container>
  `,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.Default,
  providers: [
    { provide: IbColumn, useExisting: IbTextColumn },
    { provide: IB_COLUMN, useExisting: IbTextColumn },
    { provide: IB_AGGREGATE_TYPE, useValue: "string" },
  ],
})
export class IbTextColumn<T> extends IbColumn<T> {
  /** Alignment of the cell values. */
  @Input() justify: "start" | "end" | "center" = "start";
}
