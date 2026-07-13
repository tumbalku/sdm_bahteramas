import { describe, it, expect, vi, beforeEach } from "vitest";
import { generateDatabaseSqlDump } from "../service";
import { prisma } from "@/lib/prisma";
import { readFileSync } from "fs";
import { join } from "path";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    $queryRaw: vi.fn(),
    documentRecord: {
      count: vi.fn(),
    },
  },
}));

vi.mock("@/lib/security-log", () => ({
  logActivity: vi.fn(),
}));

describe("Backup Service", () => {
  const actor = { id: "admin-1", name: "Admin SMDP", role: "ADMIN" };

  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(prisma.documentRecord.count).mockResolvedValue(0);
  });

  it("should dump database tables and paginate query rows", async () => {
    let callCount = 0;
    vi.mocked(prisma.$queryRaw).mockImplementation((async () => {
      callCount++;
      if (callCount === 1) {
        return Array.from({ length: 500 }, (_, i) => ({ id: `id-${i}`, name: `name-${i}` }));
      } else if (callCount === 2) {
        return Array.from({ length: 10 }, (_, i) => ({ id: `id-extra-${i}`, name: `name-extra-${i}` }));
      }
      return [];
    }) as any);

    const dump = await generateDatabaseSqlDump(actor, "127.0.0.1");
    expect(dump).toBeDefined();

    const lines = dump.split("\n");
    const inserts = lines.filter(l => l.startsWith("INSERT INTO"));
    expect(inserts.length).toBe(510);
    expect(dump).toContain("SMDP PORTAL - DATABASE SQL BACKUP DUMP");
    expect(dump).toContain("END OF BACKUP DUMP");
  });

  it("should handle table query errors gracefully and output an SQL comment", async () => {
    vi.mocked(prisma.$queryRaw).mockRejectedValue(new Error("Table relation 'User' does not exist"));

    const dump = await generateDatabaseSqlDump(actor, "127.0.0.1");
    expect(dump).toBeDefined();
    expect(dump).toContain("-- Error dumping table");
    expect(dump).toContain("Table relation 'User' does not exist");
  });

  it("should contain explicit sensitive data warning in SettingsFormView UI components", () => {
    const settingsUiPath = join(__dirname, "../../settings/components/SettingsFormView.tsx");
    const content = readFileSync(settingsUiPath, "utf-8");
    expect(content).toContain("PENTING & SENSITIF: Berkas backup (.sql) ini mengandung informasi sensitif termasuk data hash kata sandi pengguna");
  });
});
