/** Password hashing port. Implemented with scrypt (@noble/hashes). */
export interface PasswordHasher {
  /** Returns an encoded hash string (algorithm + params + salt + digest). */
  hash(password: string): Promise<string>;
  /** Constant-time verification against an encoded hash. */
  verify(password: string, encoded: string): Promise<boolean>;
}
