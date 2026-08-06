import { ibLoaderActions } from "./actions";
import { IbLoaderState } from "./interfaces";
import { ibLoaderReducerMain } from "./reducers";

describe("ibLoaderReducerMain", () => {
  const initialState: IbLoaderState = {
    showLoading: false,
    skipShow: false,
    pendingRequestList: [],
  };

  it("tracks matching requests independently and hides after the last completion", () => {
    const withGet = ibLoaderReducerMain(initialState, ibLoaderActions.incLoading({ url: "/users", method: "GET" }));
    const withBoth = ibLoaderReducerMain(withGet, ibLoaderActions.incLoading({ url: "/users", method: "POST" }));

    expect(withBoth.showLoading).toBeTrue();
    expect(withBoth.pendingRequestList).toEqual([
      { url: "/users", method: "GET" },
      { url: "/users", method: "POST" },
    ]);

    const withPost = ibLoaderReducerMain(withBoth, ibLoaderActions.decLoading({ url: "/users", method: "GET" }));
    expect(withPost.showLoading).toBeTrue();
    expect(withPost.pendingRequestList).toEqual([{ url: "/users", method: "POST" }]);

    const complete = ibLoaderReducerMain(withPost, ibLoaderActions.decLoading({ url: "/users", method: "POST" }));
    expect(complete.showLoading).toBeFalse();
    expect(complete.pendingRequestList).toEqual([]);
  });

  it("suppresses one increment and resets suppression on completion", () => {
    const skipped = ibLoaderReducerMain(initialState, ibLoaderActions.skipShow());
    const pending = ibLoaderReducerMain(skipped, ibLoaderActions.incLoading({ url: "/quiet", method: "GET" }));

    expect(pending.showLoading).toBeFalse();
    expect(pending.skipShow).toBeTrue();

    const complete = ibLoaderReducerMain(pending, ibLoaderActions.decLoading({ url: "/quiet", method: "GET" }));
    expect(complete.skipShow).toBeFalse();
    expect(complete.showLoading).toBeFalse();
  });
});
