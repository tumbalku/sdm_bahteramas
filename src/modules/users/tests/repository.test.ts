import { beforeEach, describe, expect, it, vi } from "vitest";
import { prisma } from "@/lib/prisma";
import { findManyUsers } from "../repository";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findMany: vi.fn(),
      count: vi.fn(),
    },
  },
}));

describe("users repository findManyUsers pagination", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return paginated user records when page and pageSize are supplied", async () => {
    const mockUsers = [
      {
        id: "user-1",
        employeeId: "123",
        email: "u1@test.com",
        name: "User 1",
        role: "EMPLOYEE",
        hasTmt: false,
        hasOldEmployeeId: false,
      },
    ];

    vi.mocked(prisma.user.findMany).mockResolvedValue(mockUsers as any);
    vi.mocked(prisma.user.count).mockResolvedValue(1);

    const result = await findManyUsers({ page: 1, pageSize: 5 });

    expect(prisma.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 0,
        take: 5,
      })
    );
    expect(prisma.user.count).toHaveBeenCalled();

    expect(result).toEqual({
      items: [
        expect.objectContaining({
          id: "user-1",
          employeeId: "123",
          name: "User 1",
        }),
      ],
      total: 1,
      page: 1,
      pageSize: 5,
    });
  });

  it("should return un-paginated array when page/pageSize are not supplied", async () => {
    const mockUsers = [
      {
        id: "user-1",
        employeeId: "123",
        email: "u1@test.com",
        name: "User 1",
        role: "EMPLOYEE",
        hasTmt: false,
        hasOldEmployeeId: false,
      },
    ];

    vi.mocked(prisma.user.findMany).mockResolvedValue(mockUsers as any);

    const result = await findManyUsers({});

    expect(prisma.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {},
      })
    );
    expect(prisma.user.count).not.toHaveBeenCalled();
    expect(Array.isArray(result)).toBe(true);
    expect(Array.isArray(result) ? result.length : 0).toBe(1);
  });
});
