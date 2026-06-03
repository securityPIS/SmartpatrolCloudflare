import { beforeEach, describe, expect, it } from "vitest";
import type { Actor } from "../../../domain/authz";
import { ForbiddenError, NotFoundError } from "../../../domain/errors";
import { MutableClock, SequentialIds } from "../../auth/__tests__/fakes";
import { createIncidentUseCases } from "../index";
import { InMemoryIncidentRepository } from "./fakes";

const SHIP_ID = "aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa";
const OTHER_SHIP = "bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb";

function actor(overrides?: Partial<Actor>): Actor {
  return { id: "u1", role: "ADMIN", shipIds: [], ...overrides };
}

function buildDeps() {
  const incidents = new InMemoryIncidentRepository();
  const clock = new MutableClock(1_000);
  const ids = new SequentialIds();
  return { incidents, clock, ids };
}

describe("createIncident", () => {
  it("happy path — creates and returns an incident", async () => {
    const deps = buildDeps();
    const uc = createIncidentUseCases(deps);
    const result = await uc.create(actor(), {
      shipId: SHIP_ID,
      title: "Fire in engine room",
      severity: "HIGH",
      payload: {},
    });
    expect(result.title).toBe("Fire in engine room");
    expect(result.severity).toBe("HIGH");
    expect(result.status).toBe("OPEN");
    expect(result.shipId).toBe(SHIP_ID);
    expect(result.reportedBy).toBe("u1");
    expect(deps.incidents.rows.size).toBe(1);
  });

  it("forbidden — non-member cannot create for another ship", async () => {
    const deps = buildDeps();
    const uc = createIncidentUseCases(deps);
    const stranger = actor({ role: "PETUGAS", shipIds: [OTHER_SHIP] });
    await expect(
      uc.create(stranger, { shipId: SHIP_ID, title: "Test", severity: "LOW", payload: {} }),
    ).rejects.toThrow(ForbiddenError);
  });
});

describe("updateIncident", () => {
  let deps: ReturnType<typeof buildDeps>;
  let uc: ReturnType<typeof createIncidentUseCases>;
  let incidentId: string;

  beforeEach(async () => {
    deps = buildDeps();
    uc = createIncidentUseCases(deps);
    const result = await uc.create(actor(), {
      shipId: SHIP_ID,
      title: "Initial",
      severity: "LOW",
      payload: {},
    });
    incidentId = result.id;
  });

  it("happy path — updates and returns updated incident", async () => {
    deps.clock.current = 2_000;
    const result = await uc.update(actor(), incidentId, {
      title: "Updated",
      status: "ACKNOWLEDGED",
    });
    expect(result.title).toBe("Updated");
    expect(result.status).toBe("ACKNOWLEDGED");
    expect(result.updatedAt).toBe(2_000);
  });

  it("not found — throws NotFoundError for unknown id", async () => {
    await expect(uc.update(actor(), "nonexistent-id", { title: "X" })).rejects.toThrow(
      NotFoundError,
    );
  });

  it("forbidden — non-member cannot update incident on another ship", async () => {
    const stranger = actor({ role: "PETUGAS", shipIds: [OTHER_SHIP] });
    await expect(uc.update(stranger, incidentId, { title: "Hack" })).rejects.toThrow(
      ForbiddenError,
    );
  });
});

describe("deleteIncident", () => {
  let deps: ReturnType<typeof buildDeps>;
  let uc: ReturnType<typeof createIncidentUseCases>;
  let incidentId: string;

  beforeEach(async () => {
    deps = buildDeps();
    uc = createIncidentUseCases(deps);
    const result = await uc.create(actor(), {
      shipId: SHIP_ID,
      title: "To delete",
      severity: "MEDIUM",
      payload: {},
    });
    incidentId = result.id;
  });

  it("happy path — admin can hard-delete", async () => {
    await uc.delete(actor({ role: "ADMIN" }), incidentId);
    expect(deps.incidents.rows.size).toBe(0);
  });

  it("forbidden — non-admin cannot delete", async () => {
    const nonAdmin = actor({ role: "PETUGAS", shipIds: [SHIP_ID] });
    await expect(uc.delete(nonAdmin, incidentId)).rejects.toThrow(ForbiddenError);
  });
});

describe("listIncidents", () => {
  it("returns all incidents for a ship", async () => {
    const deps = buildDeps();
    const uc = createIncidentUseCases(deps);
    await uc.create(actor(), { shipId: SHIP_ID, title: "A", severity: "LOW", payload: {} });
    await uc.create(actor(), { shipId: SHIP_ID, title: "B", severity: "HIGH", payload: {} });
    const list = await uc.list(actor(), SHIP_ID);
    expect(list.length).toBe(2);
  });

  it("forbidden — non-member cannot list incidents for another ship", async () => {
    const deps = buildDeps();
    const uc = createIncidentUseCases(deps);
    const stranger = actor({ role: "PETUGAS", shipIds: [OTHER_SHIP] });
    await expect(uc.list(stranger, SHIP_ID)).rejects.toThrow(ForbiddenError);
  });
});

describe("getIncident", () => {
  it("found — returns incident for authorized actor", async () => {
    const deps = buildDeps();
    const uc = createIncidentUseCases(deps);
    const created = await uc.create(actor(), {
      shipId: SHIP_ID,
      title: "Specific",
      severity: "CRITICAL",
      payload: {},
    });
    const found = await uc.get(actor(), created.id);
    expect(found.id).toBe(created.id);
    expect(found.title).toBe("Specific");
  });

  it("not found — throws NotFoundError for unknown id", async () => {
    const deps = buildDeps();
    const uc = createIncidentUseCases(deps);
    await expect(uc.get(actor(), "ghost-id")).rejects.toThrow(NotFoundError);
  });

  it("forbidden — non-member cannot view incident on another ship", async () => {
    const deps = buildDeps();
    const uc = createIncidentUseCases(deps);
    const created = await uc.create(actor(), {
      shipId: SHIP_ID,
      title: "Secret",
      severity: "LOW",
      payload: {},
    });
    const stranger = actor({ role: "PETUGAS", shipIds: [OTHER_SHIP] });
    await expect(uc.get(stranger, created.id)).rejects.toThrow(ForbiddenError);
  });
});
