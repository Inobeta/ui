import { Component, ViewChild } from "@angular/core";
import { IbSelectionColumn } from "../../inobeta-ui/ui/kai-table/columns/selection-column";
import { UserService } from "./users";

@Component({
  selector: "ib-kai-table-full-example",
  template: `
    <ib-kai-table
      tableName="fullExample"
      [displayedColumns]="columns"
      [data]="data"
    >
      <ib-table-action-group>
        <button
          mat-icon-button
          (click)="getSelection()"
          *ngIf="selectionColumn?.selection.selected.length > 0"
        >
          <mat-icon>delete</mat-icon>
        </button>
        <button mat-icon-button (click)="getUserOrders()">
          <mat-icon>refresh</mat-icon>
        </button>
        <ib-table-data-export-action />
      </ib-table-action-group>

      <ib-table-view-group />
      <ib-filter>
        <ib-search-bar />

        <ib-text-filter name="name">Name</ib-text-filter>
        <ib-tag-filter name="fruit">Fruit</ib-tag-filter>
        <ib-number-filter name="number">Amount</ib-number-filter>
        <ib-date-filter name="aDate">Purchased</ib-date-filter>
      </ib-filter>

      <ib-selection-column (ibRowSelectionChange)="selectionChange($event)" />
      <ib-text-column headerText="Name" name="name" sort />
      <ib-text-column headerText="Fruit" name="fruit" sort />
      <ib-number-column headerText="Amount" name="number" aggregate sort />
      <ib-date-column headerText="Purchased" name="aDate" sort />
      <ib-column name="subscribed" sort>
        <ng-container *ibCellDef="let element">
          <mat-icon [color]="element.subscribed ? 'accent' : ''">{{
            element.subscribed ? "done" : "close"
          }}</mat-icon>
        </ng-container>
      </ib-column>
      <ib-column ib-action-column>
        <section *ibCellDef="let element">
          <button mat-icon-button (click)="handleView(element)">
            <mat-icon>chevron_right</mat-icon>
          </button>
        </section>
      </ib-column>
    </ib-kai-table>
  `,
  styles: [
    `
      :host {
        display: flex;
        flex-direction: column;
        padding: 30px;
        gap: 3em;
      }

      ib-kai-table .ib-table {
        --ib-table-header-cell-color: lightgrey;
        --ib-table-header-cell-background-color: #309933;
      }
    `,
  ],
  providers: [UserService],
})
export class IbKaiTableFullExamplePage {
  @ViewChild(IbSelectionColumn, { static: true })
  selectionColumn: IbSelectionColumn;

  data: any[] = [];
  columns = ["name", "fruit", "number", "aDate", "subscribed"];

  constructor(private userService: UserService) {}

  ngOnInit() {
    this.getUserOrders();
  }

  getUserOrders() {
    this.userService
      .getUserOrders()
      .subscribe((orders) => (this.data = orders));
  }

  selectionChange(data) {
    console.log("selection change", data);
  }

  getSelection() {
    console.log("selection", this.selectionColumn?.selection.selected);
  }

  handleView(row) {
    console.log("handleView", row);
  }
}
