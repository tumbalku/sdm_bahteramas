import { describe, expect, it } from "vitest";
import {
  canManageAllDocuments,
  canManageOwnDocuments,
  canManageUsers,
  canVerifyDocuments,
} from "./rbac";

describe("rbac capability helpers", () => {
  it("ADMIN mewarisi capability STAFF dan EMPLOYEE", () => {
    expect(canManageOwnDocuments("ADMIN")).toBe(true);
    expect(canVerifyDocuments("ADMIN")).toBe(true);
    expect(canManageAllDocuments("ADMIN")).toBe(true);
    expect(canManageUsers("ADMIN")).toBe(true);
  });

  it("STAFF mewarisi capability EMPLOYEE tanpa menjadi ADMIN", () => {
    expect(canManageOwnDocuments("STAFF")).toBe(true);
    expect(canVerifyDocuments("STAFF")).toBe(true);
    expect(canManageAllDocuments("STAFF")).toBe(false);
    expect(canManageUsers("STAFF")).toBe(false);
  });

  it("EMPLOYEE hanya memiliki capability personal", () => {
    expect(canManageOwnDocuments("EMPLOYEE")).toBe(true);
    expect(canVerifyDocuments("EMPLOYEE")).toBe(false);
    expect(canManageAllDocuments("EMPLOYEE")).toBe(false);
    expect(canManageUsers("EMPLOYEE")).toBe(false);
  });
});
