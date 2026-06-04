import type { PatrolDeps } from "./deps";
import { makeDeletePatrolReport } from "./deletePatrolReport";
import { makeFinalizeShift } from "./finalizeShift";
import { makeListPatrolReports } from "./listPatrolReports";
import { makeListShiftHistory } from "./listShiftHistory";
import { makeSavePatrolReport } from "./savePatrolReport";

export type { PatrolDeps } from "./deps";

export function createPatrolUseCases(deps: PatrolDeps) {
  return {
    save: makeSavePatrolReport(deps),
    list: makeListPatrolReports(deps),
    delete: makeDeletePatrolReport(deps),
    finalizeShift: makeFinalizeShift(deps),
    history: makeListShiftHistory(deps),
  };
}

export type PatrolUseCases = ReturnType<typeof createPatrolUseCases>;
