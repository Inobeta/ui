import { SelectionModel } from "@angular/cdk/collections";
import {
  Component,
  EventEmitter,
  Inject,
  OnInit,
  Optional,
  Output,
  ViewChild,
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
})
export class IbSelectionColumn implements OnInit {
  /** @ignore */
  @ViewChild(MatCellDef, { static: true }) cell: MatCellDef;
  /** @ignore */
  @ViewChild(MatHeaderCellDef, { static: true }) headerCell: MatHeaderCellDef;
  /** @ignore */
  @ViewChild(MatFooterCellDef, { static: true }) footerCell: MatFooterCellDef;
  /** @ignore */
  @ViewChild(MatColumnDef, { static: true }) columnDef: MatColumnDef;
  selection = new SelectionModel<any>(true, []);

  @Output() ibRowSelectionChange = new EventEmitter<
    IbTableRowSelectionChange[]
  >();

  constructor(@Inject(IB_TABLE) @Optional() private table: any) {}

  ngOnInit() {
    if (this.table) {
      this.columnDef.cell = this.cell;
      this.columnDef.headerCell = this.headerCell;
      this.columnDef.footerCell = this.footerCell;
      this.table.matTable.addColumnDef(this.columnDef);
      this.table.displayedColumns.unshift("ib-selection");
    }
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.table.dataSource.filteredData.length;
    return numSelected == numRows;
  }

  toggleAllRows() {
    this.isAllSelected()
      ? this.selection.clear()
      : this.selection.select(...this.table.dataSource.filteredData);

    const selectionAfterToggle = this.isAllSelected();
    this.ibRowSelectionChange.emit(
      this.table.dataSource.filteredData.map((row) => ({
        tableName: this.table.tableName,
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
          tableName: this.table.tableName,
          row,
          selection: ev.checked,
        },
      ]);
    }
  }

  isDisabled() {
    return this.table.state !== "idle";
  }
}
