import { MapPipe } from "./index";

describe("MapPipe", () => {
  const pipe = new MapPipe();

  it("maps property values to strings", () => {
    expect(pipe.transform([{ id: 1 }, { id: null }], "id")).toEqual(["1", "null"]);
  });

  it("returns no values for invalid array or key inputs", () => {
    expect(pipe.transform(null, "id")).toEqual([]);
    expect(pipe.transform([{ id: 1 }], null)).toEqual([]);
  });
});
