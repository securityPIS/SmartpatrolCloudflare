export interface IncidentRecord {
  id: string;
  shipId: string;
  title: string;
  description: string | null;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  status: "OPEN" | "ACKNOWLEDGED" | "RESOLVED";
  payload: Record<string, unknown>;
  reportedBy: string;
  createdAt: number;
  updatedAt: number;
}

export interface IncidentUpdate {
  title?: string;
  description?: string | null;
  severity?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  status?: "OPEN" | "ACKNOWLEDGED" | "RESOLVED";
  payload?: Record<string, unknown>;
  updatedAt: number;
}

export interface IncidentFilters {
  status?: "OPEN" | "ACKNOWLEDGED" | "RESOLVED";
}

export interface IncidentRepository {
  findById(id: string): Promise<IncidentRecord | null>;
  listByShip(shipId: string, filters?: IncidentFilters): Promise<IncidentRecord[]>;
  create(incident: IncidentRecord): Promise<void>;
  update(id: string, patch: IncidentUpdate): Promise<void>;
  delete(id: string): Promise<void>;
  /** Count OPEN incidents, optionally restricted to a set of ships. */
  countOpen(shipIds?: string[]): Promise<number>;
}
