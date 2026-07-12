import { describe, it, expect, vi, afterEach } from "vitest";
import { getRequiredEnv } from "./env";

describe("getRequiredEnv", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("should return the value if environment variable exists", () => {
    vi.stubEnv("EXISTING_VAR", "some-value");
    expect(getRequiredEnv("EXISTING_VAR")).toBe("some-value");
  });

  it("should throw an error if variable is missing", () => {
    vi.stubEnv("MISSING_VAR", "");
    expect(() => getRequiredEnv("MISSING_VAR")).toThrow(
      "Environment variable MISSING_VAR wajib diisi di production"
    );
  });

  it("should throw an error if variable is missing even when NODE_ENV is test (no fallback)", () => {
    vi.stubEnv("NODE_ENV", "test");
    vi.stubEnv("MISSING_VAR_TEST", "");
    expect(() => getRequiredEnv("MISSING_VAR_TEST")).toThrow(
      "Environment variable MISSING_VAR_TEST wajib diisi di production"
    );
  });
});
