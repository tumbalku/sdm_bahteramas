type TmtInput = {
  hasTmt?: boolean | null;
  tmtStartDate?: Date | string | null;
  tmtEndDate?: Date | string | null;
};

export function hasTmtData(input: TmtInput) {
  return Boolean(input.hasTmt);
}

export function isContractTmt(input: TmtInput) {
  return hasTmtData(input) && Boolean(input.tmtStartDate && input.tmtEndDate);
}

export function getTmtSummaryLabel(input: TmtInput) {
  return isContractTmt(input) ? "Masa Kontrak" : "TMT Awal CPNS";
}

export function getTmtStartLabel(input: TmtInput) {
  return isContractTmt(input) ? "Mulai Masa Kontrak" : "TMT Awal CPNS";
}

export function shouldShowTmtEnd(input: TmtInput) {
  return isContractTmt(input);
}
