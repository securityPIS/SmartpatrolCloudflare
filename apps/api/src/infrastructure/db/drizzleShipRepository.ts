import { eq } from "drizzle-orm";
import { ships, type Database } from "@smartpatrol/db";
import type {
  NewShip,
  ShipPatch,
  ShipRecord,
  ShipRepository,
} from "../../application/ports/ShipRepository";

export class DrizzleShipRepository implements ShipRepository {
  constructor(private readonly db: Database) {}

  async findAll(): Promise<ShipRecord[]> {
    return this.db.select().from(ships);
  }

  async findById(id: string): Promise<ShipRecord | null> {
    const rows = await this.db.select().from(ships).where(eq(ships.id, id)).limit(1);
    return rows[0] ?? null;
  }

  async findByName(name: string): Promise<ShipRecord | null> {
    const rows = await this.db.select().from(ships).where(eq(ships.name, name)).limit(1);
    return rows[0] ?? null;
  }

  async create(ship: NewShip): Promise<void> {
    await this.db.insert(ships).values(ship);
  }

  async update(id: string, patch: ShipPatch): Promise<void> {
    await this.db.update(ships).set(patch).where(eq(ships.id, id));
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(ships).where(eq(ships.id, id));
  }
}
