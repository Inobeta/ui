import { HttpClient } from "@angular/common/http";
import { inject } from "@angular/core";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { Observable, map } from "rxjs";
import {
  IbDateQuery,
  IbTagQuery,
  IbTextQuery,
} from "../../../inobeta-ui/ui/kai-filter/filter.types";
import {
  IbFetchDataResponse,
  IbTableRemoteDataSource,
} from "../../../inobeta-ui/ui/kai-table/remote-data-source";

type GithubApi = {
  items: GithubIssue[];
  total_count: number;
};

type GithubPRState = "open" | "closed";

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

export class GithubDataSource extends IbTableRemoteDataSource<
  GithubIssue,
  GithubApiQueryFilter
> {
  private http = inject(HttpClient);
  href = "https://api.github.com/search/issues";

  getQuery(filter: GithubApiQueryFilter) {
    let q = "";
    if (filter?.title) {
      q = `${filter?.title.text} in:title`;
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
  ): Observable<IbFetchDataResponse<GithubIssue>> {
    console.log('filter', filter)
    const query = this.getQuery(filter);
    return this.http
      .get<GithubApi>(this.href, {
        params: {
          q: `repo:angular/components ${query}`,
          sort: sort?.active,
          order: sort?.direction,
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
