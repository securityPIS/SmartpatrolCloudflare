import type { ShipRecord, ShipPatch, ShipRepository } from "../../ports/ShipRepository";

export class InMemoryShipRepository implements ShipRepository {
  readonly rows = new Map<string, ShipRecord>();

  async findAll(): Promise<ShipRecord[]> {
    return Array.from(this.rows.values());
  }
  async findById(id: string): Promise<ShipRecord | null> {
    return this.rows.get(id) ?? null;
  }
  async findByName(name: string): Promise<ShipRecord | null> {
    for (const s of this.rows.values()) if (s.name === name) return s;
    return null;
  }
  async create(ship: ShipRecord): Promise<void> {
    this.rows.set(ship.id, ship);
  }
  async update(id: string, patch: ShipPatch): Promise<void> {
    const s = this.rows.get(id);
    if (s) this.rows.set(id, { ...s, ...patch });
  }
  async delete(id: string): Promise<void> {
    this.rows.delete(id);
  }
}
