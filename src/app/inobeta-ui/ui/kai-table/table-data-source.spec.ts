import { IbDataSource } from "./table-data-source";

fdescribe("IbDataSource", () => {
  it("should connect with empty data source", () => {
    const dataSource = new IbDataSource();
    dataSource.connect();
    expect(dataSource).toBeTruthy();
  });

  it("should update data", () => {
    const dataSource = new IbDataSource();
    dataSource.data = [1, 2, 3];
    expect(dataSource.data).toEqual([1, 2, 3]);
  });

  it("should disconnect", () => {
    const dataSource = new IbDataSource();
    dataSource.disconnect();
    expect(dataSource).toBeTruthy();
    expect(dataSource._renderChangesSubscription.closed).toBeTruthy();
  });
});
