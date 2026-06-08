import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable, map } from "rxjs";
import {
  IbDateQuery,
  IbTagQuery,
  IbTextQuery,
  IbFetchDataResponse,
  IbRemoteFetchStrategy,
  IbSortState,
  IbPageState,
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

@Injectable({ providedIn: "root" })
export class GithubFetchService
  implements IbRemoteFetchStrategy<GithubIssue, GithubApiQueryFilter>
{
  private http = inject(HttpClient);
  href = "https://api.github.com/search/issues";

  private getQuery(filter: GithubApiQueryFilter) {
    let q = "";
    if (filter?.title) {
      q = `${filter?.title.text} in:title`;
    }

    if (filter?.state?.items?.length) {
      q = `${q} is:${filter?.state.items[0]}`;
    }

    if (filter?.created) {
      q = `${q} created:${filter.created.start}..${filter.created.end}`;
    }

    return q;
  }

  fetchData(
    sort: IbSortState,
    page: IbPageState,
    filter?: GithubApiQueryFilter
  ): Observable<IbFetchDataResponse<GithubIssue>> {
    const query = this.getQuery(filter ?? ({} as any));
    // GitHub API expects page numbers starting at 1
    const pageIndex = (page?.pageIndex ?? 0) + 1;
    const pageSize = page?.pageSize ?? 20;

    return this.http
      .get<GithubApi>(this.href, {
        params: {
          q: `repo:angular/components ${query}`,
          sort: sort?.active ?? "",
          order: sort?.direction ?? "",
          page: String(pageIndex),
          per_page: String(pageSize),
        },
      })
      .pipe(
        map((result) => ({ items: result.items, totalCount: result.total_count }))
      );
  }
}
