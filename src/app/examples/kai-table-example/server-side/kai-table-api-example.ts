import { Component, inject, ViewChild } from "@angular/core";
import { GithubFetchService } from "./github-data-source";
import { IbDataExportModule, IbFilterModule, IbKaiTableModule, IbTableActionModule } from "public_api";
import { MatIconModule } from "@angular/material/icon";
import { MatIconButton } from "@angular/material/button";

@Component({
  selector: "ib-kai-table-api-example",
  template: `
    <ib-kai-table #table
      [displayedColumns]="['created', 'state', 'number', 'title']"
      [remoteSource]="githubFetchService"
    >
      <ib-table-action-group>
        <button
          mat-icon-button
          (click)="simulateError()"
          matTooltip="Simulate error"
        >
          <mat-icon color="warn">error</mat-icon>
        </button>
        <button mat-icon-button (click)="refresh()" matTooltip="Refresh data">
          <mat-icon>refresh</mat-icon>
        </button>
        <ib-table-data-export-action />
      </ib-table-action-group>

      <ib-filter>
        <ib-search-bar async />
        <ib-date-filter name="created">Created</ib-date-filter>
        <ib-tag-filter
          name="state"
          [multiple]="false"
          [options]="['open', 'closed']"
          >State</ib-tag-filter
        >
        <ib-text-filter name="title">Title</ib-text-filter>
      </ib-filter>

      <ib-date-column
        headerText="Created"
        name="created"
        [dataAccessor]="createdAtAccessor"
        format="d MMM yyyy"
        sort
      />
      <ib-text-column name="state" />
      <ib-number-column headerText="#" name="number" aggregate />
      <ib-text-column name="title" />
    </ib-kai-table>
  `,
  styles: [
    `
      :host {
        display: flex;
        flex-direction: column;
        padding: 30px;
      }
    `,
  ],
  imports: [
    IbKaiTableModule, IbFilterModule, IbDataExportModule, MatIconModule, IbTableActionModule, MatIconButton
  ]
})
export class IbKaiTableApiExamplePage {
  githubFetchService = inject(GithubFetchService);
  @ViewChild('table') table: any;

  createdAtAccessor = (data: any, name: string) => data.created_at;

  setState(state: string) {
    // table state is managed by the table component; if examples needs to simulate
    // a state change it should call methods that affect the remote service or
    // trigger a refresh on the table. No-op here.
  }

  refresh() {
    this.table?.refresh();
  }

  simulateError() {
    // mutate the service href to an invalid value to simulate an error, then
    // restore it after a short delay and trigger a table refresh by dispatching
    // the table-level refresh button (user can click it). The table's refresh
    // button calls IbTable.refresh(); programmatic refresh would require a
    // ViewChild reference to the component which we avoid here.
    this.githubFetchService.href = "oops";
    this.table?.refresh();
    setTimeout(() => {
      this.githubFetchService.href = "https://api.github.com/search/issues";
      this.table?.refresh();
    }, 1000);
  }
}
