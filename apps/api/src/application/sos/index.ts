import type { SosDeps } from "./deps";
import { makeRaiseSos } from "./raiseSos";
import { makeAcknowledgeSos } from "./acknowledgeSos";
import { makeResolveSos } from "./resolveSos";
import { makeListSosAlerts } from "./listSosAlerts";

export type { SosDeps } from "./deps";

export function createSosUseCases(deps: SosDeps) {
  return {
    raise: makeRaiseSos(deps),
    acknowledge: makeAcknowledgeSos(deps),
    resolve: makeResolveSos(deps),
    list: makeListSosAlerts(deps),
  };
}

export type SosUseCases = ReturnType<typeof createSosUseCases>;
