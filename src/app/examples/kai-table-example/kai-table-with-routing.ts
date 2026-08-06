import { Component, inject, ChangeDetectionStrategy } from "@angular/core";
import { MatIconModule } from "@angular/material/icon";
import { IbDataExportModule, IbFilterModule, IbKaiTableModule, IbTableActionModule, IbViewModule } from "public_api";
import { IbUserExample, UserService } from "./users";

import { MatButtonModule } from "@angular/material/button";
import { ActivatedRoute, Router, RouterOutlet } from "@angular/router";

@Component({
  selector: "ib-kai-table-with-routing",
  template: `
  <div class="content">
    <ib-kai-table
      tableName="routingExample"
      [displayedColumns]="columns"
      [data]="data"
      [activeRowParams]="{ dataParamId: 'id', childRouteParamId: 'id'}"
      >
      <ib-table-action-group>
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
    <router-outlet></router-outlet>
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
        gap: 3em;
      }

      .content {
        display: flex;
        flex: 1 1 auto;
        flex-direction: row;
        gap: 2em;
        min-height: 0;
      }

      ib-kai-table {
        flex: 1 1 auto;
        min-width: 0;
        min-height: 0;
      }
    `,
  ],
  providers: [UserService],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    MatIconModule,
    IbKaiTableModule,
    IbFilterModule,
    IbViewModule,
    IbTableActionModule,
    IbDataExportModule,
    MatButtonModule,
    RouterOutlet
  ]
})
export class IbKaiTableWithRouting {

  data: IbUserExample[] = [];
  columns = ["name", "fruit", "amount", "created_at", "subscribed"];
  router = inject(Router);
  activatedRoute = inject(ActivatedRoute);
  constructor(private userService: UserService) { }

  ngOnInit() {
    this.getUserOrders();
  }

  getUserOrders() {
    this.userService.getUserOrders().subscribe((orders) => {
      this.data = orders;
    });
  }

  handleView(row: IbUserExample) {
    console.log("handleView", row);
    this.router.navigate([`details/${row.id}`], {
      relativeTo: this.activatedRoute,
      queryParamsHandling: "preserve",
    });
  }
}
