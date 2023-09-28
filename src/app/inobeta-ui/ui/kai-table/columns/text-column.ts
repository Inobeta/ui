import {
  ChangeDetectionStrategy,
  Component,
  Input,
  ViewEncapsulation,
} from "@angular/core";
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
    <ng-container matColumnDef matSort [sticky]="sticky" [stickyEnd]="stickyEnd">
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
    </ng-container>
  `,
  encapsulation: ViewEncapsulation.None,
  // Change detection is intentionally not set to OnPush. This component's template will be provided
  // to the table to be inserted into its view. This is problematic when change detection runs since
  // the bindings in this template will be evaluated _after_ the table's view is evaluated, which
  // mean's the template in the table's view will not have the updated value (and in fact will cause
  // an ExpressionChangedAfterItHasBeenCheckedError).
  // tslint:disable-next-line:validate-decorators
  changeDetection: ChangeDetectionStrategy.Default,
  providers: [{ provide: IbColumn, useExisting: IbTextColumn }]
})
export class IbTextColumn<T> extends IbColumn<T> {
  /** Alignment of the cell values. */
  @Input() justify: "start" | "end" | "center" = "start";
}
