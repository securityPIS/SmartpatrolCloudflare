import type { Role } from "@smartpatrol/contracts";

export interface ProfileRecord {
  id: string;
  email: string;
  passwordHash: string;
  fullName: string | null;
  role: Role;
  enabled: boolean;
  shipIds: string[];
  createdAt: number;
  updatedAt: number;
}

export type NewProfile = ProfileRecord;

export interface ProfilePatch {
  fullName?: string | null;
  role?: Role;
  enabled?: boolean;
  shipIds?: string[];
  updatedAt: number;
}

export interface ProfileRepository {
  findAll(): Promise<ProfileRecord[]>;
  findByEmail(email: string): Promise<ProfileRecord | null>;
  findById(id: string): Promise<ProfileRecord | null>;
  create(profile: NewProfile): Promise<void>;
  update(id: string, patch: ProfilePatch): Promise<void>;
}
