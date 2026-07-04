import { describe, expect, it } from "vitest";
import {
  getTmtStartLabel,
  getTmtSummaryLabel,
  isContractTmt,
  shouldShowTmtEnd,
} from "./tmt";

describe("tmt helpers", () => {
  it("menampilkan Masa Kontrak ketika TMT mulai dan akhir diisi", () => {
    const input = {
      hasTmt: true,
      tmtStartDate: "2026-01-01",
      tmtEndDate: "2026-12-31",
    };

    expect(isContractTmt(input)).toBe(true);
    expect(getTmtSummaryLabel(input)).toBe("Masa Kontrak");
    expect(getTmtStartLabel(input)).toBe("Mulai Masa Kontrak");
    expect(shouldShowTmtEnd(input)).toBe(true);
  });

  it("menampilkan TMT Awal CPNS ketika tanggal akhir kosong", () => {
    const input = {
      hasTmt: true,
      tmtStartDate: "2026-01-01",
      tmtEndDate: null,
    };

    expect(isContractTmt(input)).toBe(false);
    expect(getTmtSummaryLabel(input)).toBe("TMT Awal CPNS");
    expect(getTmtStartLabel(input)).toBe("TMT Awal CPNS");
    expect(shouldShowTmtEnd(input)).toBe(false);
  });
});
