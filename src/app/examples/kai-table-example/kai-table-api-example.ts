import { HttpClient } from "@angular/common/http";
import { Component, Injectable, ViewChild, inject } from "@angular/core";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { Observable, map } from "rxjs";
import {
  IbTableData,
  IbTableDataProvider,
} from "src/app/inobeta-ui/ui/kai-table/remote-data-provider";
import {
  IbDateQuery,
  IbTagQuery,
  IbTextQuery,
} from "../../inobeta-ui/ui/kai-filter/filter.types";
import { IbTableRemoteDataSource } from "../../inobeta-ui/ui/kai-table/remote-data-source";
import { IbTable } from "../../inobeta-ui/ui/kai-table/table.component";

type GithubPRState = "open" | "closed";

type GithubApi = {
  items: GithubIssue[];
  total_count: number;
};

type GithubIssue = {
  created_at: string;
  number: string;
  state: string;
  title: string;
};

type GithubApiQueryFilter = {
  created: IbDateQuery;
  title: IbTextQuery;
  state: IbTagQuery<GithubPRState>;
};

@Injectable({ providedIn: "root" })
class GithubService
  implements IbTableDataProvider<GithubIssue, GithubApiQueryFilter>
{
  private http: HttpClient = inject(HttpClient);
  href = "https://api.github.com/search/issues";

  getQuery(filter: GithubApiQueryFilter) {
    let q = "";
    if (filter?.title) {
      q = `${filter?.title.like} in:title`;
    }

    if (filter?.state?.items.length) {
      q = `${q} is:${filter?.state.items[0]}`;
    }

    if (filter?.created) {
      q = `${q} created:${filter.created.start}..${filter.created.end}`;
    }

    return q;
  }

  fetchData(
    sort: MatSort,
    page: MatPaginator,
    filter: GithubApiQueryFilter
  ): Observable<IbTableData<GithubIssue>> {
    const query = this.getQuery(filter);
    return this.http
      .get<GithubApi>(this.href, {
        params: {
          q: `repo:angular/components ${query}`,
          sort: sort.active,
          order: sort.direction,
          page: page.pageIndex + 1,
          per_page: page.pageSize,
        },
      })
      .pipe(
        map((result) => ({
          data: result.items,
          totalCount: result.total_count,
        }))
      );
  }
}

@Component({
  selector: "ib-kai-table-api-example",
  template: `
    <div style="display: flex; gap: 12px">
      <button mat-raised-button (click)="refresh()">refresh</button>
      <button mat-raised-button color="warn" (click)="simulateError()">
        simulate error
      </button>
      <button mat-raised-button (click)="setState('loading')">
        set to loading
      </button>
      <button mat-raised-button (click)="setState('idle')">set to idle</button>
    </div>
    <ib-kai-table
      #table
      [displayedColumns]="['created', 'state', 'number', 'title']"
      [dataSource]="dataSource"
    >
      <ib-filter>
        <ib-date-filter name="created">Created</ib-date-filter>
        <ib-tag-filter
          name="state"
          [multiple]="false"
          [options]="['open', 'closed']"
          >State</ib-tag-filter
        >
        <ib-text-filter name="title">Title</ib-text-filter>
      </ib-filter>

      <ib-selection-column />
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
        gap: 3em;
      }
    `,
  ],
})
export class IbKaiTableApiExamplePage {
  @ViewChild("table", { static: true }) kaiTable: IbTable;
  private github = inject(GithubService);
  dataSource = new IbTableRemoteDataSource(this.github);

  createdAtAccessor = (data: GithubIssue, name: string) => data.created_at;

  setState(state: string) {
    if (state === "loading") {
      return (this.kaiTable.state = "loading");
    }

    this.kaiTable.state = "idle";
  }

  refresh() {
    this.dataSource.refresh();
  }

  simulateError() {
    this.github.href = "oops";
    this.dataSource.refresh();
    setTimeout(
      () => (this.github.href = "https://api.github.com/search/issues"),
      1
    );
  }
}
