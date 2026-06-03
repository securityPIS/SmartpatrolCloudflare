import type {
  SosAcknowledgementRecord,
  SosAlertRecord,
  SosRepository,
} from "../../ports/SosRepository";

export class InMemorySosRepository implements SosRepository {
  readonly alerts = new Map<string, SosAlertRecord>();
  readonly acks = new Map<string, SosAcknowledgementRecord>();

  async findById(id: string): Promise<SosAlertRecord | null> {
    return this.alerts.get(id) ?? null;
  }

  async listByShip(shipId: string): Promise<SosAlertRecord[]> {
    return Array.from(this.alerts.values()).filter((a) => a.shipId === shipId);
  }

  async listActive(): Promise<SosAlertRecord[]> {
    return Array.from(this.alerts.values()).filter((a) => a.status === "ACTIVE");
  }

  async create(alert: SosAlertRecord): Promise<void> {
    this.alerts.set(alert.id, alert);
  }

  async update(
    id: string,
    patch: Partial<SosAlertRecord> & { updatedAt: number },
  ): Promise<void> {
    const existing = this.alerts.get(id);
    if (existing) {
      this.alerts.set(id, { ...existing, ...patch });
    }
  }

  async createAcknowledgement(ack: SosAcknowledgementRecord): Promise<void> {
    this.acks.set(`${ack.sosId}::${ack.acknowledgedBy}`, ack);
  }

  async findAcknowledgement(
    sosId: string,
    userId: string,
  ): Promise<SosAcknowledgementRecord | null> {
    return this.acks.get(`${sosId}::${userId}`) ?? null;
  }
}
