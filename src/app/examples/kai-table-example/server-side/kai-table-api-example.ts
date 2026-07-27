import { Component } from "@angular/core";
import { GithubDataSource } from "./github-data-source";
import { IbDataExportModule, IbFilterModule, IbKaiTableModule, IbTableActionModule, IbViewModule } from "public_api";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule, MatIconButton } from "@angular/material/button";

@Component({
  selector: "ib-kai-table-api-example",
  template: `
    <ib-kai-table
      tableName="remoteExample"
      [displayedColumns]="['created', 'state', 'number', 'title']"
      [dataSource]="dataSource"
    >
      <ib-table-action-group>
        <button
          matMiniFab
          (click)="simulateError()"
          matTooltip="Simulate error"
        >
          <mat-icon color="warn">error</mat-icon>
        </button>
        <button matMiniFab (click)="refresh()" matTooltip="Refresh data">
          <mat-icon>refresh</mat-icon>
        </button>
        <ib-table-data-export-action />
      </ib-table-action-group>

      <ib-table-view-group />
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
    IbKaiTableModule, IbFilterModule, IbViewModule, IbDataExportModule, MatIconModule, IbTableActionModule, MatButtonModule
  ]
})
export class IbKaiTableApiExamplePage {
  dataSource = new GithubDataSource();

  createdAtAccessor = (data: any, name: string) => data.created_at;

  refresh() {
    this.dataSource.refresh();
  }

  simulateError() {
    this.dataSource.href = "oops";
    this.dataSource.refresh();
    setTimeout(
      () => {
        this.dataSource.href = "https://api.github.com/search/issues";
        this.dataSource.refresh();
      },
      1000
    );
  }
}
