import { ibSessionExtraSelectors } from "./selectors";
import { IbAPITokens, IbSession } from "../../auth/session.model";

function token(payload: Record<string, unknown>): string {
  return `header.${btoa(JSON.stringify(payload))}.signature`;
}

describe("ibSessionExtraSelectors", () => {
  const selectors = ibSessionExtraSelectors({ selectActiveSession: (state: { activeSession: unknown }) => state.activeSession });

  it("returns safe token values when no active access token exists", () => {
    expect(selectors.ibSelectAccessTokenExp.projector(null)).toBe(0);
    expect(selectors.ibSelectDecodedData<IbAPITokens>().projector({ serverData: {} })).toBeNull();
    expect(selectors.ibSelectActiveSession().projector(null)).toBeNull();
  });

  it("decodes token data and clamps an expired token lifetime", () => {
    const activeSession = {
      user: { email: "admin@example.com", password: "", rememberMe: false },
      valid: true,
      serverData: { accessToken: token({ exp: 1, role: "admin" }), refreshToken: "refresh" },
    } as IbSession<IbAPITokens>;

    expect(selectors.ibSelectAccessTokenExp.projector(activeSession)).toBe(0);
    expect(selectors.ibSelectDecodedData<IbAPITokens & { role: string }>().projector(activeSession).role).toBe("admin");
    expect(selectors.ibSelectActiveSession().projector(activeSession)).toBe(activeSession);
  });

  it("reports remaining lifetime for a token outside the refresh window", () => {
    const now = Date.now() / 1000;
    const activeSession = { serverData: { accessToken: token({ exp: now + 600 }) } };

    expect(selectors.ibSelectAccessTokenExp.projector(activeSession)).toBeGreaterThan(299000);
  });
});
