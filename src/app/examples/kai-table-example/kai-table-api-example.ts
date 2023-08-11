import { formatDate } from "@angular/common";
import { HttpClient } from "@angular/common/http";
import { Component, Injectable, ViewChild } from "@angular/core";
import { SortDirection } from "@angular/material/sort";
import { Observable } from "rxjs";
import {
  IbDateFilterCategory,
  IbDateFilterCriteria,
  IbTagFilterCriteria,
  IbTextFilterCritera,
} from "src/app/inobeta-ui/ui/kai-filter/filter.types";
import {
  IbColumnDef,
  IbKaiTableState,
  IbTableDef,
} from "src/app/inobeta-ui/ui/kai-table";
import { useColumn } from "src/app/inobeta-ui/ui/kai-table/cells";
import { IbSelectionColumn } from "src/app/inobeta-ui/ui/kai-table/selection-column";
import { IbDataSource } from "src/app/inobeta-ui/ui/kai-table/table-data-source";
import { IbTable } from "src/app/inobeta-ui/ui/kai-table/table.component";

type GithubPRState = "open" | "closed";

interface GithubApiQueryFilter {
  created: IbDateFilterCriteria;
  title: IbTextFilterCritera;
  state: IbTagFilterCriteria<GithubPRState>;
}

@Injectable({ providedIn: "root" })
class GithubService {
  href = "https://api.github.com/search/issues";

  constructor(private _httpClient: HttpClient) {}

  getQuery(filter: GithubApiQueryFilter) {
    let q = "";
    if (filter?.title?.value) {
      q = `${filter?.title?.value} in:title`;
    }

    if (filter?.state?.length) {
      q = `${q} is:${filter?.state[0]}`;
    }
    
    return q;
  }

  getRepoIssues(
    sort: string,
    order: SortDirection,
    page: number,
    filter: GithubApiQueryFilter
  ): Observable<GithubApi> {
    const query = this.getQuery(filter);
    const requestUrl = `${
      this.href
    }?q=repo:angular/components ${query}&sort=${sort}&order=${order}&page=${
      page + 1
    }`;

    console.log(
      "getRepoIssues",
      "sort:",
      sort,
      "order:",
      order,
      "page:",
      page,
      "filter",
      filter
    );
    return this._httpClient.get<GithubApi>(requestUrl);
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
      [dataSource]="dataSource"
      [columns]="columns"
      [tableDef]="tableDef"
    >
      <ib-filter>
        <ib-date-filter name="created">Created</ib-date-filter>
        <ib-tag-filter
          name="state"
          multiple="false"
          [options]="['open', 'closed']"
          >State</ib-tag-filter
        >
        <ib-text-filter name="title">Title</ib-text-filter>
      </ib-filter>
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

      ib-kai-table ::ng-deep .ib-table-scrollable {
        max-height: 500px;
      }

      ib-kai-table .ib-table {
        --ib-table-header-cell-color: lightgrey;
        --ib-table-header-cell-background-color: #309933;
      }
    `,
  ],
})
export class IbKaiTableApiExamplePage {
  @ViewChild("table", { static: true }) kaiTable: IbTable;
  @ViewChild(IbSelectionColumn, { static: true })
  selectionColumn: IbSelectionColumn;

  dataSource = new IbDataSource<GithubIssue>();
  columns: IbColumnDef[] = [
    {
      columnDef: "created",
      header: "Created",
      cell: (e) => `${formatDate(e.created_at, "d MMM yyyy", "it-IT")}`,
      sort: true,
    },
    useColumn("state"),
    useColumn("#", "number", false),
    useColumn("title"),
  ];
  tableDef: IbTableDef = {
    paginator: {
      pageSize: 30,
      pageSizeOptions: [30],
    },
  };

  isRateLimitReached = false;
  resultsLength = 0;

  constructor(private github: GithubService) {}

  ngOnInit() {
    this.dataSource.fetchData = this.fetchIssues;
    this.dataSource.mapData = this.mapData;
    this.dataSource.updatePaginator = (result: GithubApi) => result.total_count;
  }

  fetchIssues = (sort: string, order: SortDirection, page: number, filter) =>
    this.github!.getRepoIssues(sort, order, page, filter);

  mapData = (result: GithubApi) => result.items;

  setState(state: string) {
    if (state === "loading") {
      return (this.kaiTable.state = IbKaiTableState.LOADING);
    }

    this.kaiTable.state = IbKaiTableState.IDLE;
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

interface GithubApi {
  items: GithubIssue[];
  total_count: number;
}

interface GithubIssue {
  created_at: string;
  number: string;
  state: string;
  title: string;
}
