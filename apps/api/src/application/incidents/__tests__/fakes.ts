import type {
  IncidentFilters,
  IncidentRecord,
  IncidentRepository,
  IncidentUpdate,
} from "../../ports/IncidentRepository";

export class InMemoryIncidentRepository implements IncidentRepository {
  readonly rows = new Map<string, IncidentRecord>();

  async findById(id: string): Promise<IncidentRecord | null> {
    return this.rows.get(id) ?? null;
  }

  async listByShip(shipId: string, filters?: IncidentFilters): Promise<IncidentRecord[]> {
    const results = Array.from(this.rows.values()).filter((r) => r.shipId === shipId);
    if (filters?.status) {
      return results.filter((r) => r.status === filters.status);
    }
    return results;
  }

  async create(incident: IncidentRecord): Promise<void> {
    this.rows.set(incident.id, incident);
  }

  async update(id: string, patch: IncidentUpdate): Promise<void> {
    const existing = this.rows.get(id);
    if (existing) {
      this.rows.set(id, { ...existing, ...patch });
    }
  }

  async delete(id: string): Promise<void> {
    this.rows.delete(id);
  }

  async countOpen(shipIds?: string[]): Promise<number> {
    const allow = shipIds ? new Set(shipIds) : null;
    return Array.from(this.rows.values()).filter(
      (r) => r.status === "OPEN" && (!allow || allow.has(r.shipId)),
    ).length;
  }
}
