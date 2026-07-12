import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { GET } from "@/app/api/v1/documents/[id]/download/route";
import { getServerSession } from "next-auth/next";
import { getDocumentByIdService } from "@/modules/documents/service";
import { getStorageProvider } from "@/lib/storage";

vi.mock("next-auth/next", () => ({
  getServerSession: vi.fn(),
}));

vi.mock("@/modules/documents/service", () => ({
  getDocumentByIdService: vi.fn(),
}));

vi.mock("@/lib/storage", () => ({
  getStorageProvider: vi.fn(),
  getContentTypeFromPath: vi.fn(() => "application/pdf"),
}));

const mockStorage = {
  getFile: vi.fn(),
};

describe("Document Download Route Handler", () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.resetAllMocks();
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    vi.mocked(getStorageProvider).mockReturnValue(mockStorage as any);
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  const createRequest = () => {
    return new Request("http://localhost/api/v1/documents/doc-123/download");
  };

  const params = Promise.resolve({ id: "doc-123" });

  it("should return 401 if there is no active session", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);

    const response = await GET(createRequest(), { params });
    expect(response.status).toBe(401);
    
    const body = await response.json();
    expect(body.success).toBe(false);
    expect(body.error).toContain("Unauthorized");
  });

  it("should return 404 if document is not found", async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: "user-1", role: "EMPLOYEE" },
    });
    vi.mocked(getDocumentByIdService).mockRejectedValue(new Error("Dokumen tidak ditemukan"));

    const response = await GET(createRequest(), { params });
    expect(response.status).toBe(404);

    const body = await response.json();
    expect(body.success).toBe(false);
    expect(body.error).toContain("Dokumen tidak ditemukan");
  });

  it("should return 403 if access is denied", async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: "user-1", role: "EMPLOYEE" },
    });
    vi.mocked(getDocumentByIdService).mockRejectedValue(new Error("Akses ditolak"));

    const response = await GET(createRequest(), { params });
    expect(response.status).toBe(403);

    const body = await response.json();
    expect(body.success).toBe(false);
    expect(body.error).toContain("Akses ditolak");
  });

  it("should return 404 if physical file in storage is not found", async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: "user-1", role: "EMPLOYEE" },
    });
    vi.mocked(getDocumentByIdService).mockResolvedValue({
      id: "doc-123",
      fileName: "test.pdf",
      filePath: "test/path/test.pdf",
    } as any);
    mockStorage.getFile.mockRejectedValue(new Error("File tidak ditemukan"));

    const response = await GET(createRequest(), { params });
    expect(response.status).toBe(404);

    const body = await response.json();
    expect(body.success).toBe(false);
    expect(body.error).toContain("File fisik tidak ditemukan");
  });

  it("should return 200 with headers and correct file content if successful", async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: "user-1", role: "EMPLOYEE" },
    });
    vi.mocked(getDocumentByIdService).mockResolvedValue({
      id: "doc-123",
      fileName: "test.pdf",
      filePath: "test/path/test.pdf",
    } as any);
    
    const fileBuffer = new Uint8Array([1, 2, 3, 4]);
    mockStorage.getFile.mockResolvedValue({
      buffer: fileBuffer.buffer,
      contentType: "application/pdf",
    });

    const response = await GET(createRequest(), { params });
    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("application/pdf");
    expect(response.headers.get("Content-Disposition")).toContain("inline; filename=\"test.pdf\"");

    const responseBuffer = await response.arrayBuffer();
    expect(new Uint8Array(responseBuffer)).toEqual(fileBuffer);
  });
});
