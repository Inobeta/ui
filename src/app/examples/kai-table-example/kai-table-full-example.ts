import { Component, signal, ViewChild } from "@angular/core";
import { MatIconModule } from "@angular/material/icon";
import { IbDataExportModule, IbFilterModule, IbKaiTableModule, IbTableActionModule, IbTableDef, IbViewModule } from "public_api";
import { IbSelectionColumn } from "public_api";
import { UserService } from "./users";

import { MatButtonModule, MatIconButton } from "@angular/material/button";

@Component({
  selector: "ib-kai-table-full-example",
  template: `
  <div class="table-wrapper">
    <ib-kai-table
      tableName="fullExample"
      tableHeight="parent"
      [state]="tableLoader() ? 'loading' : 'idle'"
      [displayedColumns]="columns"
      [data]="data"
      [tableDef]="tableDef"
      [stripedRows]="true"
      >
      <ib-table-action-group>
        @if (selectionColumn?.selection.selected.length > 0) {
          <ng-template ibTableAction>
            <button
              matMiniFab
              (click)="getSelection()"
              >
              <mat-icon>delete</mat-icon>
            </button>
          </ng-template>
        }
        <ng-template ibTableAction>
          <button matMiniFab (click)="getUserOrders()">
            <mat-icon>refresh</mat-icon>
          </button>
        </ng-template>
        <ng-template ibTableAction [kind]="'export'"></ng-template>
      </ib-table-action-group>

      <ib-table-view-group />
      <ib-filter>
        <ib-search-bar />

        <ib-text-filter name="name">Name</ib-text-filter>
        <ib-tag-filter name="fruit">Fruit</ib-tag-filter>
        <ib-number-filter name="amount">Amount</ib-number-filter>
        <ib-date-filter name="created_at">Purchased</ib-date-filter>
        <ib-boolean-filter name="subscribed">Subscribed</ib-boolean-filter>
      </ib-filter>

      <ib-selection-column (ibRowSelectionChange)="selectionChange($event)" />
      <ib-text-column headerText="Name" name="name" sort />
      <ib-text-column headerText="Fruit" name="fruit" sort />
      <ib-number-column headerText="Amount" name="amount" aggregate sort />
      <ib-date-column headerText="Purchased" name="created_at" sort />
      <ib-column name="subscribed" sort>
        <ng-container *ibCellDef="let element">
          <mat-icon [color]="element.subscribed ? 'accent' : ''">{{
            element.subscribed ? "done" : "close"
          }}</mat-icon>
        </ng-container>
      </ib-column>
      <ib-column ib-action-column>
        <section *ibCellDef="let element">
          <button matMiniFab (click)="handleView(element)">
            <mat-icon>chevron_right</mat-icon>
          </button>
        </section>
      </ib-column>
    </ib-kai-table>
  </div>
  `,
  styles: [
    `
      :host {
        --ib-table-min-content-height: 0px;

        display: flex;
        flex: 1 1 auto;
        flex-direction: column;
        min-height: 0;
        overflow: hidden;
        padding: 30px;
      }
      .table-wrapper {
        display: flex;
        flex: 1 1 auto;
        flex-direction: column;
        min-height: 0;
        overflow: hidden;
      }

      ib-kai-table {
        flex: 1 1 auto;
        min-height: 0;
      }
    `,
  ],
  providers: [UserService],
  imports: [
    MatIconModule,
    IbKaiTableModule,
    IbFilterModule,
    IbViewModule,
    IbTableActionModule,
    IbDataExportModule,
    MatButtonModule
  ]
})
export class IbKaiTableFullExamplePage {
  @ViewChild(IbSelectionColumn, { static: true })
  selectionColumn: IbSelectionColumn;

  data: any[] = [];
  columns = ["name", "fruit", "amount", "created_at", "subscribed"];

  tableDef: Partial<IbTableDef> = {
    initialSort: { active: 'name', direction: 'desc' },
  }

  tableLoader = signal<boolean>(true);
  constructor(private userService: UserService) { }

  ngOnInit() {
    this.getUserOrders();
  }

  getUserOrders() {
    this.tableLoader.set(true)
    this.userService.getUserOrders().subscribe((orders) => {
      this.data = orders;
      this.tableLoader.set(false)
    });
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
