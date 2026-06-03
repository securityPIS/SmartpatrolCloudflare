export interface SessionRecord {
  id: string;
  userId: string;
  refreshTokenHash: string;
  userAgent: string | null;
  expiresAt: number;
  createdAt: number;
  revokedAt: number | null;
}

export interface NewSession {
  id: string;
  userId: string;
  refreshTokenHash: string;
  userAgent: string | null;
  expiresAt: number;
  createdAt: number;
}

export interface SessionRepository {
  create(session: NewSession): Promise<void>;
  findById(id: string): Promise<SessionRecord | null>;
  /** Rotate the refresh secret + expiry on a live session. */
  rotate(id: string, refreshTokenHash: string, expiresAt: number): Promise<void>;
  revoke(id: string, revokedAt: number): Promise<void>;
}
