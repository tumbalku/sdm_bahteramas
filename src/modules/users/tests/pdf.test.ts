import { describe, expect, it } from "vitest";
import { getLocalBrowserExecutablePath, isServerlessRuntime } from "../pdf";

describe("user profile PDF runtime detection", () => {
  it("mendeteksi Vercel runtime lewat VERCEL_ENV", () => {
    expect(isServerlessRuntime({ VERCEL_ENV: "production" })).toBe(true);
  });

  it("mendeteksi Vercel runtime lewat VERCEL", () => {
    expect(isServerlessRuntime({ VERCEL: "1" })).toBe(true);
  });

  it("mendeteksi runtime serverless/lambda umum", () => {
    expect(isServerlessRuntime({ AWS_EXECUTION_ENV: "AWS_Lambda_nodejs22.x" })).toBe(true);
    expect(isServerlessRuntime({ LAMBDA_TASK_ROOT: "/var/task" })).toBe(true);
  });

  it("false untuk env lokal kosong", () => {
    expect(isServerlessRuntime({})).toBe(false);
  });

  it("false untuk development meskipun Next mengisi NEXT_RUNTIME", () => {
    expect(isServerlessRuntime({ NODE_ENV: "development", NEXT_RUNTIME: "nodejs" })).toBe(false);
  });

  it("menghormati PUPPETEER_EXECUTABLE_PATH untuk browser lokal", () => {
    expect(getLocalBrowserExecutablePath({ PUPPETEER_EXECUTABLE_PATH: "C:/Chrome/chrome.exe" })).toBe(
      "C:/Chrome/chrome.exe"
    );
  });
});
