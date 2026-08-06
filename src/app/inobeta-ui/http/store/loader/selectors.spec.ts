import { ibLoaderExtraSelectors } from "./selectors";

describe("ibLoaderExtraSelectors", () => {
  const selectors = ibLoaderExtraSelectors({
    selectShowLoading: (state: { showLoading: boolean | null }) => state.showLoading,
    selectPendingRequestList: (state: { pendingRequestList: { url: string; method: string }[] }) => state.pendingRequestList,
  });

  it("normalizes missing loading state and preserves an active state", () => {
    expect(selectors.ibSelectIsHttpLoading.projector(null)).toBeFalse();
    expect(selectors.ibSelectIsHttpLoading.projector(true)).toBeTrue();
  });

  it("matches pending requests by both URL and method", () => {
    const selector = selectors.ibSelectIsHttpUrlLoading({ url: "/users", method: "GET" });
    const pending = [
      { url: "/users", method: "POST" },
      { url: "/users", method: "GET" },
    ];

    expect(selector.projector(pending)).toBeTrue();
    expect(selector.projector([{ url: "/users", method: "POST" }])).toBeFalse();
  });
});
