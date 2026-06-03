import { and, desc, eq } from "drizzle-orm";
import { sosAlerts, sosAcknowledgements, type Database } from "@smartpatrol/db";
import type {
  SosAcknowledgementRecord,
  SosAlertRecord,
  SosRepository,
} from "../../application/ports/SosRepository";

export class DrizzleSosRepository implements SosRepository {
  constructor(private readonly db: Database) {}

  async findById(id: string): Promise<SosAlertRecord | null> {
    const rows = await this.db
      .select()
      .from(sosAlerts)
      .where(eq(sosAlerts.id, id))
      .limit(1);
    const row = rows[0];
    if (!row) return null;
    return this.toAlertRecord(row);
  }

  async listByShip(shipId: string): Promise<SosAlertRecord[]> {
    const rows = await this.db
      .select()
      .from(sosAlerts)
      .where(eq(sosAlerts.shipId, shipId))
      .orderBy(desc(sosAlerts.createdAt));
    return rows.map((r) => this.toAlertRecord(r));
  }

  async listActive(): Promise<SosAlertRecord[]> {
    const rows = await this.db
      .select()
      .from(sosAlerts)
      .where(eq(sosAlerts.status, "ACTIVE"))
      .orderBy(desc(sosAlerts.createdAt));
    return rows.map((r) => this.toAlertRecord(r));
  }

  async create(alert: SosAlertRecord): Promise<void> {
    await this.db.insert(sosAlerts).values({
      id: alert.id,
      shipId: alert.shipId,
      raisedBy: alert.raisedBy,
      status: alert.status,
      lat: alert.lat,
      lng: alert.lng,
      message: alert.message,
      resolvedAt: alert.resolvedAt,
      createdAt: alert.createdAt,
      updatedAt: alert.updatedAt,
    });
  }

  async update(id: string, patch: Partial<SosAlertRecord> & { updatedAt: number }): Promise<void> {
    const set: Record<string, unknown> = { updatedAt: patch.updatedAt };
    if (patch.status !== undefined) set.status = patch.status;
    if (patch.lat !== undefined) set.lat = patch.lat;
    if (patch.lng !== undefined) set.lng = patch.lng;
    if (patch.message !== undefined) set.message = patch.message;
    if (patch.resolvedAt !== undefined) set.resolvedAt = patch.resolvedAt;
    await this.db.update(sosAlerts).set(set).where(eq(sosAlerts.id, id));
  }

  async createAcknowledgement(ack: SosAcknowledgementRecord): Promise<void> {
    await this.db.insert(sosAcknowledgements).values({
      id: ack.id,
      sosId: ack.sosId,
      acknowledgedBy: ack.acknowledgedBy,
      createdAt: ack.createdAt,
      updatedAt: ack.updatedAt,
    });
  }

  async findAcknowledgement(sosId: string, userId: string): Promise<SosAcknowledgementRecord | null> {
    const rows = await this.db
      .select()
      .from(sosAcknowledgements)
      .where(and(eq(sosAcknowledgements.sosId, sosId), eq(sosAcknowledgements.acknowledgedBy, userId)))
      .limit(1);
    const row = rows[0];
    if (!row) return null;
    return {
      id: row.id,
      sosId: row.sosId,
      acknowledgedBy: row.acknowledgedBy,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  private toAlertRecord(row: typeof sosAlerts.$inferSelect): SosAlertRecord {
    return {
      id: row.id,
      shipId: row.shipId,
      raisedBy: row.raisedBy,
      status: row.status,
      lat: row.lat ?? null,
      lng: row.lng ?? null,
      message: row.message ?? null,
      resolvedAt: row.resolvedAt ?? null,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
