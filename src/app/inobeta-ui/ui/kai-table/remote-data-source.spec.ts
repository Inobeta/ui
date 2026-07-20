import { fakeAsync, tick } from "@angular/core/testing";
import { Observable, Subject } from "rxjs";
import {
  IbFetchDataResponse,
  IbRemoteDataSourceRequest,
  IbTableRemoteDataSource,
} from "./remote-data-source";

interface Row {
  id: number;
}

class ControlledRemoteDataSource extends IbTableRemoteDataSource<Row, { term: string }> {
  readonly requests: IbRemoteDataSourceRequest<{ term: string }>[] = [];
  readonly responses: Subject<IbFetchDataResponse<Row>>[] = [];

  fetchData(request: IbRemoteDataSourceRequest<{ term: string }>): Observable<IbFetchDataResponse<Row>> {
    this.requests.push(request);
    const response = new Subject<IbFetchDataResponse<Row>>();
    this.responses.push(response);
    return response.asObservable();
  }
}

describe("IbTableRemoteDataSource", () => {
  function createSource(): ControlledRemoteDataSource {
    return new ControlledRemoteDataSource();
  }

  it("sends one readonly value-object request without Material controls", () => {
    const source = createSource();
    const subscription = source.connect().subscribe();

    expect(source.requests).toEqual([
      {
        sort: null,
        pageIndex: 0,
        pageSize: 20,
        filter: null,
      },
    ]);
    expect(Object.prototype.hasOwnProperty.call(source.requests[0], "paginator")).toBeFalse();
    expect(Object.prototype.hasOwnProperty.call(source.requests[0], "sortControl")).toBeFalse();

    source.setInput({
      sort: { active: "id", direction: "desc" },
      pageIndex: 2,
      pageSize: 10,
      filter: { term: "abc" },
    });

    expect(source.request).toEqual({
      sort: { active: "id", direction: "desc" },
      pageIndex: 2,
      pageSize: 10,
      filter: { term: "abc" },
    });
    subscription.unsubscribe();
  });

  it("debounces filter changes by 500 milliseconds", fakeAsync(() => {
    const source = createSource();
    const subscription = source.connect().subscribe();
    source.responses[0].next({ data: [{ id: 1 }], totalCount: 1 });

    source.setInput({ filter: { term: "new" } });
    expect(source.requests.length).toBe(1);
    tick(499);
    expect(source.requests.length).toBe(1);
    tick(1);
    expect(source.requests.length).toBe(2);
    expect(source.requests[1].filter).toEqual({ term: "new" });
    subscription.unsubscribe();
  }));

  it("starts sort, page and refresh requests immediately", () => {
    const source = createSource();
    const subscription = source.connect().subscribe();
    source.responses[0].next({ data: [{ id: 1 }], totalCount: 1 });

    source.setInput({ sort: { active: "id", direction: "asc" } });
    source.setInput({ pageIndex: 1 });
    source.refresh();

    expect(source.requests.length).toBe(4);
    expect(source.requests[1].sort).toEqual({ active: "id", direction: "asc" });
    expect(source.requests[2].pageIndex).toBe(1);
    expect(source.requests[3]).toEqual(source.request);
    subscription.unsubscribe();
  });

  it("does not allow an obsolete response to replace the latest response", () => {
    const source = createSource();
    const rendered: Row[][] = [];
    const subscription = source.connect().subscribe((rows) => rendered.push(rows));
    source.responses[0].next({ data: [{ id: 1 }], totalCount: 1 });

    source.setInput({ pageIndex: 1 });
    source.setInput({ pageIndex: 2 });
    source.responses[2].next({ data: [{ id: 3 }], totalCount: 3 });
    source.responses[1].next({ data: [{ id: 2 }], totalCount: 2 });

    expect(rendered.at(-1)).toEqual([{ id: 3 }]);
    expect(source.totalCount$).toBeTruthy();
    subscription.unsubscribe();
  });

  it("exposes loading, no_data, idle and http_error states", () => {
    const source = createSource();
    const errors: unknown[] = [];
    const errorSubscription = source.error$.subscribe((error) => errors.push(error));
    const subscription = source.connect().subscribe();

    expect(source.state).toBe("loading");
    source.responses[0].next({ data: [], totalCount: 0 });
    expect(source.state).toBe("no_data");
    source.setInput({ pageIndex: 1 });
    expect(source.state).toBe("loading");
    source.responses[1].next({ data: [{ id: 1 }], totalCount: 4 });
    expect(source.state).toBe("idle");
    source.setInput({ pageIndex: 2 });
    const originalError = new Error("request failed");
    source.responses[2].error(originalError);

    expect(source.state).toBe("http_error");
    expect(source.error$).toBeTruthy();
    expect(errors.at(-1)).toBe(originalError);
    errorSubscription.unsubscribe();
    subscription.unsubscribe();
  });

  it("publishes total count and rows for the current page", () => {
    const source = createSource();
    const rows: Row[][] = [];
    const totalCounts: number[] = [];
    const rowSubscription = source.connect().subscribe((value) => rows.push(value));
    const countSubscription = source.totalCount$.subscribe((value) => totalCounts.push(value));
    source.responses[0].next({ data: [{ id: 7 }, { id: 8 }], totalCount: 42 });

    expect(rows.at(-1)).toEqual([{ id: 7 }, { id: 8 }]);
    expect(totalCounts.at(-1)).toBe(42);
    expect(source.filteredData).toEqual([{ id: 7 }, { id: 8 }]);
    rowSubscription.unsubscribe();
    countSubscription.unsubscribe();
  });

  it("keeps concurrent connections independent when one disconnects", () => {
    const source = createSource();
    const first: Row[][] = [];
    const second: Row[][] = [];
    const firstSubscription = source.connect().subscribe((rows) => first.push(rows));
    source.responses[0].next({ data: [{ id: 1 }], totalCount: 1 });
    const secondSubscription = source.connect().subscribe((rows) => second.push(rows));

    firstSubscription.unsubscribe();
    source.disconnect();
    source.setInput({ pageIndex: 1 });
    source.responses[1].next({ data: [{ id: 2 }], totalCount: 2 });

    expect(first.at(-1)).toEqual([{ id: 1 }]);
    expect(second.at(-1)).toEqual([{ id: 2 }]);
    secondSubscription.unsubscribe();
  });

  it("declares remote capabilities explicitly", () => {
    const source = createSource();

    expect(source.capabilities.size).toBe(0);
  });
});
