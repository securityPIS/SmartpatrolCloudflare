import { describe, expect, it } from "vitest";
import type { Actor } from "../../../domain/authz";
import { ForbiddenError, NotFoundError } from "../../../domain/errors";
import { MutableClock, SequentialIds } from "../../auth/__tests__/fakes";
import { createSosUseCases } from "../index";
import { InMemorySosRepository } from "./fakes";

const SHIP_ID = "aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa";
const OTHER_SHIP = "bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb";

function actor(overrides?: Partial<Actor>): Actor {
  return { id: "u1", role: "ADMIN", shipIds: [], ...overrides };
}

function buildDeps() {
  const sos = new InMemorySosRepository();
  const clock = new MutableClock(1_000);
  const ids = new SequentialIds();
  return { sos, clock, ids };
}

describe("raiseSos", () => {
  it("happy path — creates an active SOS alert", async () => {
    const deps = buildDeps();
    const uc = createSosUseCases(deps);
    const result = await uc.raise(actor(), { shipId: SHIP_ID });
    expect(result.status).toBe("ACTIVE");
    expect(result.shipId).toBe(SHIP_ID);
    expect(result.raisedBy).toBe("u1");
    expect(result.lat).toBeNull();
    expect(result.resolvedAt).toBeNull();
    expect(deps.sos.alerts.size).toBe(1);
  });

  it("happy path — includes location and message when provided", async () => {
    const deps = buildDeps();
    const uc = createSosUseCases(deps);
    const result = await uc.raise(actor(), {
      shipId: SHIP_ID,
      lat: 1.23,
      lng: 4.56,
      message: "Man overboard",
    });
    expect(result.lat).toBe(1.23);
    expect(result.lng).toBe(4.56);
    expect(result.message).toBe("Man overboard");
  });

  it("forbidden — non-member cannot raise SOS for another ship", async () => {
    const deps = buildDeps();
    const uc = createSosUseCases(deps);
    const stranger = actor({ role: "PETUGAS", shipIds: [OTHER_SHIP] });
    await expect(uc.raise(stranger, { shipId: SHIP_ID })).rejects.toThrow(ForbiddenError);
  });
});

describe("acknowledgeSos", () => {
  it("happy path — acknowledges an active alert", async () => {
    const deps = buildDeps();
    const uc = createSosUseCases(deps);
    const raised = await uc.raise(actor(), { shipId: SHIP_ID });
    const result = await uc.acknowledge(actor(), raised.id);
    expect(result.status).toBe("ACKNOWLEDGED");
    expect(deps.sos.acks.size).toBe(1);
  });

  it("idempotent — second acknowledgement by same user does not create a duplicate ack", async () => {
    const deps = buildDeps();
    const uc = createSosUseCases(deps);
    const raised = await uc.raise(actor(), { shipId: SHIP_ID });
    await uc.acknowledge(actor(), raised.id);
    await uc.acknowledge(actor(), raised.id);
    expect(deps.sos.acks.size).toBe(1);
  });

  it("not found — throws NotFoundError for unknown SOS id", async () => {
    const deps = buildDeps();
    const uc = createSosUseCases(deps);
    await expect(uc.acknowledge(actor(), "ghost-id")).rejects.toThrow(NotFoundError);
  });

  it("forbidden — non-member cannot acknowledge SOS for another ship", async () => {
    const deps = buildDeps();
    const uc = createSosUseCases(deps);
    const raised = await uc.raise(actor(), { shipId: SHIP_ID });
    const stranger = actor({ role: "PETUGAS", shipIds: [OTHER_SHIP] });
    await expect(uc.acknowledge(stranger, raised.id)).rejects.toThrow(ForbiddenError);
  });
});

describe("resolveSos", () => {
  it("happy path — resolves an alert and sets resolvedAt", async () => {
    const deps = buildDeps();
    const uc = createSosUseCases(deps);
    deps.clock.current = 5_000;
    const raised = await uc.raise(actor(), { shipId: SHIP_ID });
    deps.clock.current = 10_000;
    const result = await uc.resolve(actor(), raised.id);
    expect(result.status).toBe("RESOLVED");
    expect(result.resolvedAt).toBe(10_000);
  });

  it("not found — throws NotFoundError for unknown SOS id", async () => {
    const deps = buildDeps();
    const uc = createSosUseCases(deps);
    await expect(uc.resolve(actor(), "ghost-id")).rejects.toThrow(NotFoundError);
  });

  it("forbidden — non-member cannot resolve SOS for another ship", async () => {
    const deps = buildDeps();
    const uc = createSosUseCases(deps);
    const raised = await uc.raise(actor(), { shipId: SHIP_ID });
    const stranger = actor({ role: "PETUGAS", shipIds: [OTHER_SHIP] });
    await expect(uc.resolve(stranger, raised.id)).rejects.toThrow(ForbiddenError);
  });
});

describe("listSosAlerts", () => {
  it("by ship — ship member can list their ship's alerts", async () => {
    const deps = buildDeps();
    const uc = createSosUseCases(deps);
    await uc.raise(actor(), { shipId: SHIP_ID });
    await uc.raise(actor(), { shipId: SHIP_ID });
    const member = actor({ role: "PETUGAS", shipIds: [SHIP_ID] });
    const list = await uc.list(member, SHIP_ID);
    expect(list.length).toBe(2);
  });

  it("admin list active — admin can list all active alerts without shipId", async () => {
    const deps = buildDeps();
    const uc = createSosUseCases(deps);
    await uc.raise(actor(), { shipId: SHIP_ID });
    const list = await uc.list(actor({ role: "ADMIN" }));
    expect(list.length).toBe(1);
    expect(list[0].status).toBe("ACTIVE");
  });

  it("ship forbidden — non-member cannot list another ship's SOS alerts", async () => {
    const deps = buildDeps();
    const uc = createSosUseCases(deps);
    const stranger = actor({ role: "PETUGAS", shipIds: [OTHER_SHIP] });
    await expect(uc.list(stranger, SHIP_ID)).rejects.toThrow(ForbiddenError);
  });

  it("non-admin without shipId gets forbidden", async () => {
    const deps = buildDeps();
    const uc = createSosUseCases(deps);
    const nonAdmin = actor({ role: "PETUGAS", shipIds: [SHIP_ID] });
    await expect(uc.list(nonAdmin)).rejects.toThrow(ForbiddenError);
  });
});
