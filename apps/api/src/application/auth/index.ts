import type { AuthDeps } from "./deps";
import { makeRegister } from "./register";
import { makeVerifyEmail } from "./verifyEmail";
import { makeLogin } from "./login";
import { makeRefresh } from "./refresh";
import { makeLogout } from "./logout";
import { makeMe } from "./me";

export type { AuthDeps, AuthConfig } from "./deps";

/** Wire all auth use-cases from a single dependency bundle. */
export function createAuthUseCases(deps: AuthDeps) {
  return {
    register: makeRegister(deps),
    verifyEmail: makeVerifyEmail(deps),
    login: makeLogin(deps),
    refresh: makeRefresh(deps),
    logout: makeLogout(deps),
    me: makeMe(deps),
  };
}

export type AuthUseCases = ReturnType<typeof createAuthUseCases>;
