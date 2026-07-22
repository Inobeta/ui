import { signal } from "@angular/core";
import { Sort } from "@angular/material/sort";
import { IbAggregate } from "./cells";
import { IbColumn } from "./columns";
import { IbDataSourceCapability } from "./data-source.types";
import { IbTableLocalDataSource } from "./local-data-source";
import { IbTableDataSource } from "./table-data-source";

interface Row {
  name: string;
  amount: number;
}

class SumAggregate extends IbAggregate {
  id = "sum";
  name = "sum";
  label = "sum";
  type = "number";

  aggregateData(data: number[]): number {
    return data.reduce((total, value) => total + value, 0);
  }
}

function column(name: keyof Row): IbColumn<unknown> {
  return {
    name: signal(name),
    sortingDataAccessor: signal((row: unknown) => (row as Row)[name]),
    filterDataAccessor: signal((row: unknown) => (row as Row)[name]),
  } as unknown as IbColumn<unknown>;
}

describe("IbTableLocalDataSource", () => {
  const columns = [column("name"), column("amount")];
  const rows: Row[] = [
    { name: "alice", amount: 10 },
    { name: "bob", amount: 20 },
    { name: "carol", amount: 30 },
  ];

  function createSource(data = rows): IbTableLocalDataSource<Row> {
    const source = new IbTableLocalDataSource(data, [new SumAggregate()]);
    source.setColumns(columns);
    return source;
  }

  it("processes updates, filtering, sorting, paging and aggregation", () => {
    const source = createSource();

    source.setInput({
      rawFilter: { amount: "2" },
      sort: { active: "amount", direction: "desc" },
      pageIndex: 0,
      pageSize: 1,
      aggregatedColumns: { amount: "sum" },
    });

    expect(source.getFilteredData()).toEqual([rows[1]]);
    expect(source.getOrderedData()).toEqual([rows[1]]);
    expect(source.getCurrentPageData()).toEqual([rows[1]]);
    expect(source.aggregatedData.amount).toEqual({ total: 20, currentPage: 20 });

    source.data = [...rows, { name: "dave", amount: 40 }];
    expect(source.getFilteredData()).toEqual([rows[1]]);
    source.setInput({ rawFilter: null, pageSize: 20 });
    expect(source.getFilteredData()).toEqual([...rows, { name: "dave", amount: 40 }]);
  });

  it("clamps an out-of-range page to the available page data", () => {
    const source = createSource();
    source.setInput({ pageIndex: 99, pageSize: 2 });

    expect(source.getCurrentPageData()).toEqual([]);
    expect(source.totalCount$).toBeTruthy();
  });

  it("supports custom sorting and filtering extension points", () => {
    const source = createSource();
    const sort: Sort = { active: "name", direction: "asc" };
    source.sortData = (data) => data.sort((left, right) => right.amount - left.amount);
    source.filterPredicate = (row, filter) => row.amount >= Number(filter.amount);

    source.setInput({ rawFilter: { amount: 15 }, sort });

    expect(source.getFilteredData()).toEqual([rows[1], rows[2]]);
    expect(source.getOrderedData()).toEqual([rows[2], rows[1]]);
  });

  it("ignores an unknown sort column without throwing", () => {
    const source = createSource();

    expect(() => source.setInput({ sort: { active: "missing", direction: "asc" } })).not.toThrow();
    expect(source.getOrderedData()).toEqual(rows);
  });

  it("keeps concurrent connections independent when one disconnects", () => {
    const source = createSource();
    const first: Row[][] = [];
    const second: Row[][] = [];
    const firstSubscription = source.connect().subscribe((value) => first.push(value));
    const secondSubscription = source.connect().subscribe((value) => second.push(value));

    source.data = [{ name: "eve", amount: 50 }];
    firstSubscription.unsubscribe();
    source.disconnect();
    source.data = [{ name: "frank", amount: 60 }];

    expect(first.at(-1)).toEqual([{ name: "eve", amount: 50 }]);
    expect(second.at(-1)).toEqual([{ name: "frank", amount: 60 }]);
    secondSubscription.unsubscribe();
  });

  it("exposes local capabilities", () => {
    const source = createSource();

    expect(source.capabilities).toEqual(
      new Set([
        IbDataSourceCapability.RowSelection,
        IbDataSourceCapability.CurrentPageExport,
        IbDataSourceCapability.FullExport,
        IbDataSourceCapability.GlobalAggregation,
      ]),
    );
  });
});

describe("IbTableDataSource compatibility wrapper", () => {
  it("preserves essential local data processing", () => {
    const source = new IbTableDataSource<Row>([
      { name: "alice", amount: 10 },
      { name: "bob", amount: 20 },
    ]);
    source.columns = [column("name"), column("amount")];

    expect(source._filterData(source.data)).toEqual(source.data);
    expect(source._orderData(source.data)).toEqual(source.data);
    expect(source._pageData(source.data)).toEqual(source.data);

    const rendered: Row[][] = [];
    const subscription = source.connect().subscribe((value) => rendered.push(value));
    source.data = [{ name: "carol", amount: 30 }];

    expect(rendered.at(-1)).toEqual([{ name: "carol", amount: 30 }]);
    source.disconnect();
    subscription.unsubscribe();
  });
});
