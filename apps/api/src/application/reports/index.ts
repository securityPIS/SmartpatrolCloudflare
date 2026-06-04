import type { ReportDeps } from "./deps";
import { makeDailyReport } from "./dailyReport";

export type { ReportDeps } from "./deps";

export function createReportUseCases(deps: ReportDeps) {
  return {
    daily: makeDailyReport(deps),
  };
}

export type ReportUseCases = ReturnType<typeof createReportUseCases>;
