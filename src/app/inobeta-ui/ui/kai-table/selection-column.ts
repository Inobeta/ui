import { SelectionModel } from "@angular/cdk/collections";
import {
  Component,
  EventEmitter,
  OnInit,
  Output,
  ViewChild,
} from "@angular/core";
import { IbTable } from "./table.component";
import { MatColumnDef } from "@angular/material/table";
import { IbTableRowSelectionChange, IbKaiTableState } from "./table.types";

@Component({
  selector: "ib-selection-column",
  template: `
    <ng-container matColumnDef="ibSelectColumn">
      <th style="width: 40px" class="ib-table__header-cell" mat-header-cell *matHeaderCellDef>
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
    </ng-container>
  `,
})
export class IbSelectionColumn implements OnInit {
  @ViewChild(MatColumnDef, { static: true }) columnDef: MatColumnDef;
  selection = new SelectionModel<any>(true, []);

  @Output() ibRowSelectionChange = new EventEmitter<
    IbTableRowSelectionChange[]
  >();

  constructor(public table: IbTable) {}

  ngOnInit() {
    this.table.table.addColumnDef(this.columnDef);
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
    return !this.table.isState(IbKaiTableState.IDLE);
  }
}
