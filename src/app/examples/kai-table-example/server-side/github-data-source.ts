import { HttpClient } from "@angular/common/http";
import { inject } from "@angular/core";
import { Observable, map } from "rxjs";
import {
  IbDateQuery,
  IbFetchDataResponse,
  IbRemoteDataSourceRequest,
  IbTableRemoteDataSource,
  IbTagQuery,
  IbTextQuery,
} from "public_api";

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
    request: IbRemoteDataSourceRequest<GithubApiQueryFilter>
  ): Observable<IbFetchDataResponse<GithubIssue>> {
    const query = this.getQuery(request.filter);
    return this.http
      .get<GithubApi>(this.href, {
        params: {
          q: `repo:angular/components ${query}`,
          sort: request.sort?.active ?? "",
          order: request.sort?.direction ?? "",
          page: request.pageIndex + 1,
          per_page: request.pageSize,
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
