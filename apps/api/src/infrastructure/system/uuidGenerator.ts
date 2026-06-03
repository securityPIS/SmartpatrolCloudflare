import type { IdGenerator } from "../../application/ports/IdGenerator";

export const uuidGenerator: IdGenerator = {
  uuid: () => crypto.randomUUID(),
};
