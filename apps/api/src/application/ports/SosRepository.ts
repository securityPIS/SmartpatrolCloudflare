export interface SosAlertRecord {
  id: string;
  shipId: string;
  raisedBy: string;
  status: "ACTIVE" | "ACKNOWLEDGED" | "RESOLVED";
  lat: number | null;
  lng: number | null;
  message: string | null;
  resolvedAt: number | null;
  createdAt: number;
  updatedAt: number;
}

export interface SosAcknowledgementRecord {
  id: string;
  sosId: string;
  acknowledgedBy: string;
  createdAt: number;
  updatedAt: number;
}

export interface SosRepository {
  findById(id: string): Promise<SosAlertRecord | null>;
  listByShip(shipId: string): Promise<SosAlertRecord[]>;
  listActive(): Promise<SosAlertRecord[]>;
  create(alert: SosAlertRecord): Promise<void>;
  update(id: string, patch: Partial<SosAlertRecord> & { updatedAt: number }): Promise<void>;
  createAcknowledgement(ack: SosAcknowledgementRecord): Promise<void>;
  findAcknowledgement(sosId: string, userId: string): Promise<SosAcknowledgementRecord | null>;
}
