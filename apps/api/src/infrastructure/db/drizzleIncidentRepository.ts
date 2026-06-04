import { and, count, desc, eq, inArray } from "drizzle-orm";
import { incidents, type Database } from "@smartpatrol/db";
import type {
  IncidentFilters,
  IncidentRecord,
  IncidentRepository,
  IncidentUpdate,
} from "../../application/ports/IncidentRepository";

export class DrizzleIncidentRepository implements IncidentRepository {
  constructor(private readonly db: Database) {}

  async findById(id: string): Promise<IncidentRecord | null> {
    const rows = await this.db.select().from(incidents).where(eq(incidents.id, id)).limit(1);
    const row = rows[0];
    if (!row) return null;
    return this.toRecord(row);
  }

  async listByShip(shipId: string, filters?: IncidentFilters): Promise<IncidentRecord[]> {
    const conditions = [eq(incidents.shipId, shipId)];
    if (filters?.status) {
      conditions.push(eq(incidents.status, filters.status));
    }
    const rows = await this.db
      .select()
      .from(incidents)
      .where(and(...conditions))
      .orderBy(desc(incidents.createdAt));
    return rows.map((r) => this.toRecord(r));
  }

  async create(incident: IncidentRecord): Promise<void> {
    await this.db.insert(incidents).values({
      id: incident.id,
      shipId: incident.shipId,
      title: incident.title,
      description: incident.description,
      severity: incident.severity,
      status: incident.status,
      payload: incident.payload,
      reportedBy: incident.reportedBy,
      createdAt: incident.createdAt,
      updatedAt: incident.updatedAt,
    });
  }

  async update(id: string, patch: IncidentUpdate): Promise<void> {
    const set: Record<string, unknown> = { updatedAt: patch.updatedAt };
    if (patch.title !== undefined) set.title = patch.title;
    if (patch.description !== undefined) set.description = patch.description;
    if (patch.severity !== undefined) set.severity = patch.severity;
    if (patch.status !== undefined) set.status = patch.status;
    if (patch.payload !== undefined) set.payload = patch.payload;
    await this.db.update(incidents).set(set).where(eq(incidents.id, id));
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(incidents).where(eq(incidents.id, id));
  }

  async countOpen(shipIds?: string[]): Promise<number> {
    const conditions = [eq(incidents.status, "OPEN")];
    if (shipIds) {
      if (shipIds.length === 0) return 0;
      conditions.push(inArray(incidents.shipId, shipIds));
    }
    const rows = await this.db
      .select({ value: count() })
      .from(incidents)
      .where(and(...conditions));
    return rows[0]?.value ?? 0;
  }

  private toRecord(row: typeof incidents.$inferSelect): IncidentRecord {
    return {
      id: row.id,
      shipId: row.shipId,
      title: row.title,
      description: row.description ?? null,
      severity: row.severity,
      status: row.status,
      payload: row.payload as Record<string, unknown>,
      reportedBy: row.reportedBy,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
