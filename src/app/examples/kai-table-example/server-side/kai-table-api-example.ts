import { Component } from "@angular/core";
import { GithubDataSource } from "./github-data-source";

@Component({
  selector: "ib-kai-table-api-example",
  template: `
    <ib-kai-table
      [displayedColumns]="['created', 'state', 'number', 'title']"
      [dataSource]="dataSource"
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
      <ib-text-column headerText="#" name="number" />
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
})
export class IbKaiTableApiExamplePage {
  dataSource = new GithubDataSource();

  createdAtAccessor = (data: any, name: string) => data.created_at;

  setState(state: string) {
    if (state === "loading") {
      return (this.dataSource.state = "loading");
    }

    this.dataSource.state = "idle";
  }

  refresh() {
    this.dataSource.refresh();
  }

  simulateError() {
    this.dataSource.href = "oops";
    this.dataSource.refresh();
    setTimeout(
      () => (this.dataSource.href = "https://api.github.com/search/issues"),
      1
    );
  }
}
