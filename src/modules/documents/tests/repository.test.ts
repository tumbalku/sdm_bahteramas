import { beforeEach, describe, expect, it, vi } from "vitest";
import { prisma } from "@/lib/prisma";
import { findDocuments } from "../repository";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    documentRecord: {
      findMany: vi.fn(),
      count: vi.fn(),
    },
  },
}));

describe("documents repository findDocuments pagination", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return paginated document records when page and pageSize are supplied", async () => {
    const mockDocs = [
      {
        id: "doc-1",
        ownerId: "user-1",
        documentTypeId: "type-1",
        fileName: "file.pdf",
        filePath: "KK/file.pdf",
        status: "PENDING",
        uploadedAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    vi.mocked(prisma.documentRecord.findMany).mockResolvedValue(mockDocs as any);
    vi.mocked(prisma.documentRecord.count).mockResolvedValue(1);

    const result = await findDocuments({ page: 2, pageSize: 10 });

    expect(prisma.documentRecord.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 10,
        take: 10,
      })
    );
    expect(prisma.documentRecord.count).toHaveBeenCalled();

    expect(result).toEqual({
      items: mockDocs,
      total: 1,
      page: 2,
      pageSize: 10,
    });
  });

  it("should return un-paginated array when page/pageSize are not supplied", async () => {
    const mockDocs = [
      {
        id: "doc-1",
        ownerId: "user-1",
        documentTypeId: "type-1",
        fileName: "file.pdf",
        filePath: "KK/file.pdf",
        status: "PENDING",
        uploadedAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    vi.mocked(prisma.documentRecord.findMany).mockResolvedValue(mockDocs as any);

    const result = await findDocuments({});

    expect(prisma.documentRecord.findMany).toHaveBeenCalled();
    expect(prisma.documentRecord.count).not.toHaveBeenCalled();
    expect(Array.isArray(result)).toBe(true);
    expect((result as any[]).length).toBe(1);
  });
});
