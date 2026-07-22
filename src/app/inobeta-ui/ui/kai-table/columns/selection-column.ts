import { SelectionModel } from "@angular/cdk/collections";
import {
  Component,
  Inject,
  OnInit,
  Optional,
  output,
  viewChild,
} from "@angular/core";
import {
  MatCellDef,
  MatColumnDef,
  MatFooterCellDef,
  MatHeaderCellDef,
} from "@angular/material/table";
import { IbTableRowSelectionChange } from "../table.types";
import { IB_TABLE } from "../tokens";

@Component({
    selector: "ib-selection-column",
    template: `
    <ng-container matColumnDef="ib-selection">
      <th
        style="width: 40px"
        class="ib-table__header-cell"
        mat-header-cell
        *matHeaderCellDef
      >
        <mat-checkbox
          (change)="$event ? toggleAllRows() : null"
          [checked]="selection.hasValue() && isAllSelected()"
          [indeterminate]="selection.hasValue() && !isAllSelected()"
          [disabled]="isDisabled()"
        >
        </mat-checkbox>
      </th>
      <td mat-cell *matCellDef="let row">
        <mat-checkbox
          (click)="$event.stopPropagation()"
          (change)="toggleRowSelection($event, row)"
          [checked]="selection.isSelected(row)"
          [disabled]="isDisabled()"
        >
        </mat-checkbox>
      </td>
      <td mat-footer-cell *matFooterCellDef></td>
    </ng-container>
  `,
    standalone: false
})
export class IbSelectionColumn implements OnInit {
  /** @ignore */
  readonly cell = viewChild.required(MatCellDef);
  /** @ignore */
  readonly headerCell = viewChild.required(MatHeaderCellDef);
  /** @ignore */
  readonly footerCell = viewChild.required(MatFooterCellDef);
  /** @ignore */
  readonly columnDef = viewChild.required(MatColumnDef);
  selection = new SelectionModel<any>(true, []);

  readonly ibRowSelectionChange = output<IbTableRowSelectionChange[]>();

  constructor(@Inject(IB_TABLE) @Optional() private table: any) {}

  ngOnInit() {
    if (this.table) {
      if (typeof this.table.canSelectRows === 'function' && !this.table.canSelectRows()) return;
      if (this.table.isRemote()) {
        console.warn("Selection column is currently not supported with IbTableRemoteDataSource");
      }
      this.columnDef().cell = this.cell();
      this.columnDef().headerCell = this.headerCell();
      this.columnDef().footerCell = this.footerCell();
      this.table.matTable().addColumnDef(this.columnDef());
      if (Array.isArray(this.table.displayedColumns()) && !this.table.displayedColumns().includes("ib-selection")) {
        this.table.displayedColumns().unshift("ib-selection");
      }
    }
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.table.activeDataSource().filteredData.length;
    return numSelected == numRows;
  }

  toggleAllRows() {
    this.isAllSelected()
      ? this.selection.clear()
      : this.selection.select(...this.table.activeDataSource().filteredData);

    const selectionAfterToggle = this.isAllSelected();
    this.ibRowSelectionChange.emit(
      this.table.activeDataSource().filteredData.map((row) => ({
        tableName: this.table.tableName(),
        row,
        selection: selectionAfterToggle,
      }))
    );
  }

  toggleRowSelection(ev, row) {
    if (ev) {
      this.selection.toggle(row);

      this.ibRowSelectionChange.emit([
        {
          tableName: this.table.tableName(),
          row,
          selection: ev.checked,
        },
      ]);
    }
  }

  isDisabled() {
    return this.table.state() !== "idle";
  }
}
