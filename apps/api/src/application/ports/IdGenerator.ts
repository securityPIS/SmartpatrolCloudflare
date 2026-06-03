/** Injectable id generator (UUID v4) for deterministic tests. */
export interface IdGenerator {
  uuid(): string;
}
