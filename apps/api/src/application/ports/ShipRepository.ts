import type { Checkpoint } from "@smartpatrol/contracts";

export interface ShipRecord {
  id: string;
  name: string;
  customCheckpoints: Checkpoint[];
  createdAt: number;
  updatedAt: number;
}

export type NewShip = ShipRecord;

export interface ShipPatch {
  name?: string;
  customCheckpoints?: Checkpoint[];
  updatedAt: number;
}

export interface ShipRepository {
  findAll(): Promise<ShipRecord[]>;
  findById(id: string): Promise<ShipRecord | null>;
  findByName(name: string): Promise<ShipRecord | null>;
  create(ship: NewShip): Promise<void>;
  update(id: string, patch: ShipPatch): Promise<void>;
  delete(id: string): Promise<void>;
}
