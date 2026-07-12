import { describe, it, expect } from "vitest";
import { existsSync, readFileSync } from "fs";
import { join } from "path";

describe("NextAuth Canonical Endpoint Verification", () => {
  it("should not have the non-canonical /api/v1/auth/[...nextauth]/route.ts route", () => {
    const v1Path = join(__dirname, "../../../app/api/v1/auth/[...nextauth]/route.ts");
    expect(existsSync(v1Path)).toBe(false);
  });

  it("should have the canonical /api/auth/[...nextauth]/route.ts route", () => {
    const canonicalPath = join(__dirname, "../../../app/api/auth/[...nextauth]/route.ts");
    expect(existsSync(canonicalPath)).toBe(true);
  });

  it("should not configure custom basePath on SessionProvider in providers.tsx", () => {
    const providersPath = join(__dirname, "../../../app/providers.tsx");
    const content = readFileSync(providersPath, "utf-8");
    
    // SessionProvider should be used as <SessionProvider> without a custom basePath
    expect(content).toContain("<SessionProvider>");
    expect(content).not.toContain("basePath=");
  });
});
