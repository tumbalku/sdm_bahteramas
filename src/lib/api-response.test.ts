import { describe, it, expect } from "vitest";
import { ok, created, fail } from "./api-response";

describe("API Response Helpers", () => {
  it("should return ok status 200 and correct body shape", async () => {
    const data = { message: "success", items: [1, 2, 3] };
    const response = ok(data);

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toEqual({
      success: true,
      data,
    });
  });

  it("should return created status 201 and correct body shape", async () => {
    const data = { id: "new-item-id" };
    const response = created(data);

    expect(response.status).toBe(201);
    const body = await response.json();
    expect(body).toEqual({
      success: true,
      data,
    });
  });

  it("should return fail status and correct body shape with custom status", async () => {
    const errorMessage = "Bad Request Error";
    const response = fail(errorMessage, 400);

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body).toEqual({
      success: false,
      error: errorMessage,
    });
  });

  it("should return fail status 500 as default when no status is provided", async () => {
    const errorMessage = "Internal Server Error";
    const response = fail(errorMessage);

    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body).toEqual({
      success: false,
      error: errorMessage,
    });
  });
});
