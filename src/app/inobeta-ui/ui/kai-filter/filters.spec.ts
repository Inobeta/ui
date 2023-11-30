import {
  and,
  applyFilter,
  contains,
  endsWith,
  eq,
  gt,
  gte,
  lt,
  lte,
  ncontains,
  or,
  startsWith,
} from "./filters";

describe("filters", () => {
  it("should return true if empty", () => {
    expect(applyFilter({ operator: 0, value: null }, "")).toBeTruthy();
    expect(applyFilter(null, "")).toBeTruthy();
  });

  it("and/or operator", () => {
    const data = "alice";
    const orFilter = or([contains("li"), contains("op")]);
    const andFilter = and([contains("li"), contains("op")]);
    expect(applyFilter(orFilter, data)).toBeTruthy();
    expect(applyFilter(andFilter, data)).toBeFalsy();
  });

  it("string: contains operator", () => {
    const data = "alice";
    const filterValue = "li";
    const filter = contains(filterValue);
    expect(applyFilter(filter, data)).toBeTruthy();
  });

  it("string: ncontains operator", () => {
    const data = "alice";
    const filterValue = "op";
    const filter = ncontains(filterValue);
    expect(applyFilter(filter, data)).toBeTruthy();
  });

  it("string: startsWith operator", () => {
    const data = "alice";
    const filterValue = "al";
    const filter = startsWith(filterValue);
    expect(applyFilter(filter, data)).toBeTruthy();
  });

  it("string: endsWith operator", () => {
    const data = "alice";
    const filterValue = "ce";
    const filter = endsWith(filterValue);
    expect(applyFilter(filter, data)).toBeTruthy();
  });

  it("number: eq operator", () => {
    const data = 621;
    const filterValue = 621;
    const filter = eq(filterValue);
    expect(applyFilter(filter, data)).toBeTruthy();
  });

  it("number: gt/gte operator", () => {
    const data = 621;
    const filterValue = 111;
    const gtFilter = gt(filterValue);
    const gteFilter = gte(filterValue);
    expect(applyFilter(gtFilter, data)).toBeTruthy();
    expect(applyFilter(gteFilter, data)).toBeTruthy();
  });

  it("number: lt/lte operator", () => {
    const data = 621;
    const filterValue = 888;
    const ltFilter = lt(filterValue);
    const lteFilter = lte(filterValue);
    expect(applyFilter(ltFilter, data)).toBeTruthy();
    expect(applyFilter(lteFilter, data)).toBeTruthy();
  });
});
