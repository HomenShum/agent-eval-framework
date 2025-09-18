/** @jest-environment node */

import { DEFAULT_TEST_USER_ID, TEST_USER_HEADER, resolveTestUserId } from "./testUser";

describe("resolveTestUserId", () => {
  it("returns the header value when provided", () => {
    const req = { headers: new Headers([[TEST_USER_HEADER, "demo-user"]]) } as Request;
    expect(resolveTestUserId(req)).toBe("demo-user");
  });

  it("falls back to the default test user id when header missing", () => {
    const req = { headers: new Headers() } as Request;
    expect(resolveTestUserId(req)).toBe(DEFAULT_TEST_USER_ID);
  });
});
