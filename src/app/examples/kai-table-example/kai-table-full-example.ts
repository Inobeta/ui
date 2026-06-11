import { Component, ViewChild } from "@angular/core";
import { MatIconModule } from "@angular/material/icon";
import {
  IbDataExportModule,
  IbFilterModule,
  IbKaiTableModule,
  IbKaiTableState,
  IbSelectionColumn,
  IbTableActionModule,
  IbTableViewGroup,
} from "public_api";
import { UserService } from "./users";

import { MatIconButton } from "@angular/material/button";

@Component({
  selector: "ib-kai-table-full-example",
  template: `
    <ib-kai-table
      tableName="fullExample"
      [displayedColumns]="columns"
      [data]="data"
      [state]="state"
      [stripedRows]="true"
      >
      <ib-table-action-group>
        @if (selectionColumn?.selection.selected.length > 0) {
          <ng-template ibTableAction>
            <button
              mat-icon-button
              (click)="getSelection()"
              >
              <mat-icon>delete</mat-icon>
            </button>
          </ng-template>
        }
        <ng-template ibTableAction>
          <button mat-icon-button (click)="getUserOrders()">
            <mat-icon>refresh</mat-icon>
          </button>
        </ng-template>
        <ng-template ibTableAction [kind]="'export'"></ng-template>
      </ib-table-action-group>

      <ib-filter>
        <ib-search-bar />

        <ib-text-filter name="name">Name</ib-text-filter>
        <ib-tag-filter name="fruit">Fruit</ib-tag-filter>
        <ib-number-filter name="amount">Amount</ib-number-filter>
        <ib-date-filter name="created_at">Purchased</ib-date-filter>
        <ib-boolean-filter name="subscribed">Subscribed</ib-boolean-filter>
      </ib-filter>

      <ib-view-group [groupName]="'fullExample'" />

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
    `,
  ],
  providers: [UserService],
  imports: [
    MatIconModule,
    IbKaiTableModule,
    IbFilterModule,
    IbTableActionModule,
    IbDataExportModule,
    IbTableViewGroup,
    MatIconButton
  ]
})
export class IbKaiTableFullExamplePage {
  @ViewChild(IbSelectionColumn, { static: true })
  selectionColumn: IbSelectionColumn;

  data: any[] = [];
  columns = ["name", "fruit", "amount", "created_at", "subscribed"];
  state: IbKaiTableState = "idle";

  constructor(private userService: UserService) { }

  ngOnInit() {
    this.getUserOrders();
  }

  getUserOrders() {
    this.state = "loading";
    this.userService.getUserOrders().subscribe((orders) => {
      this.data = orders;
      this.state = "idle";
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
