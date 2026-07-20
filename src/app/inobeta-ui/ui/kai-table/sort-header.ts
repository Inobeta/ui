import { Directive, effect, input } from "@angular/core";
import { MatSort, MatSortHeader } from "@angular/material/sort";

/**
 * Directive to use in combination with `mat-sort-header`
 *
 * Since `mat-sort-header` only looks up the `MatSort` instance coming directly
 * from its parent (usually `mat-table`), it is necessary to substitute it with
 * the correct `MatSort` attached to the `dataSource`, as well reinitialize
 * the state changes to properly render the current state of the header.
 *
 * This solution is far from optimal and has a high risk of breaking with
 * a different release of Angular Material
 */
@Directive({
  selector: "[ib-sort-header-for], [ibSortHeaderFor]",
  standalone: true,
})
export class IbSortHeader {
  readonly matSort = input.required<MatSort>({ alias: "ibSortHeaderFor" });

  constructor(public matSortHeader: MatSortHeader) {
    effect(() => this.matSortHeader._sort = this.matSort());
  }
}
