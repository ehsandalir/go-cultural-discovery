import { describe, expect, it } from "vitest";
import { authReturnPath } from "@/lib/auth-return-path";

describe("safe OAuth return paths", () => {
  it("preserves valid internal destinations", () => {
    expect(authReturnPath("/library?tab=watch#saved")).toBe("/library?tab=watch#saved");
    expect(authReturnPath("/profile")).toBe("/profile");
  });
  it("rejects external, ambiguous, and looping destinations", () => {
    for (const value of [
      "https://evil.example",
      "//evil.example",
      "/\\evil.example",
      "/auth",
      "javascript:alert(1)",
      "",
      null,
    ]) {
      expect(authReturnPath(value)).toBe("/profile");
    }
  });
});
