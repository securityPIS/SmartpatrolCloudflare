import { beforeEach, describe, expect, it } from "vitest";
import type { SavePatrolReportRequest } from "@smartpatrol/contracts";
import type { Actor } from "../../../domain/authz";
import { ForbiddenError, StalePatrolReportError } from "../../../domain/errors";
import { InMemoryShipRepository } from "../../ships/__tests__/fakes";
import { MutableClock, SequentialIds } from "../../auth/__tests__/fakes";
import { createPatrolUseCases } from "../index";
import { InMemoryPatrolReportRepository } from "./fakes";

const SHIP_ID = "11111111-1111-4111-8111-111111111111";
const SHIP_ID_2 = "55555555-5555-4555-8555-555555555555";
const CP_ID = "22222222-2222-4222-8222-222222222222";
const CP_ID_2 = "33333333-3333-4333-8333-333333333333";

const PETUGAS: Actor = { id: "petugas-1", role: "PETUGAS", shipIds: [SHIP_ID] };
const STRANGER: Actor = { id: "stranger-1", role: "PETUGAS", shipIds: [] };
const ADMIN: Actor = { id: "admin-1", role: "ADMIN", shipIds: [] };

function baseInput(over: Partial<SavePatrolReportRequest> = {}): SavePatrolReportRequest {
  return {
    shiftKey: "2026-06-03-DAY",
    shipId: SHIP_ID,
    checkpointId: CP_ID,
    checkpointName: "Bridge",
    status: "DONE",
    media: [],
    ...over,
  };
}

function buildDeps() {
  const patrols = new InMemoryPatrolReportRepository();
  const ships = new InMemoryShipRepository();
  const clock = new MutableClock(1_000);
  const ids = new SequentialIds();
  return { patrols, ships, clock, ids };
}

describe("patrol use-cases", () => {
  describe("savePatrolReport — upsert on natural key", () => {
    let deps: ReturnType<typeof buildDeps>;
    let uc: ReturnType<typeof createPatrolUseCases>;

    beforeEach(() => {
      deps = buildDeps();
      uc = createPatrolUseCases(deps);
    });

    it("creates a report on first save", async () => {
      const r = await uc.save(PETUGAS, baseInput({ completedAt: 1_500 }));
      expect(r.checkpointName).toBe("Bridge");
      expect(r.status).toBe("DONE");
      expect(r.completedAt).toBe(1_500);
      expect(r.reportedBy).toBe(PETUGAS.id);
    });

    it("upserts (not duplicates) on the same natural key", async () => {
      await uc.save(PETUGAS, baseInput({ note: "first", completedAt: 1_500 }));
      await uc.save(PETUGAS, baseInput({ note: "second", completedAt: 1_600 }));
      const list = await uc.list(PETUGAS, SHIP_ID, "2026-06-03-DAY");
      expect(list.length).toBe(1);
      expect(list[0].note).toBe("second");
    });

    it("preserves createdAt across upserts", async () => {
      deps.clock.current = 1_000;
      const first = await uc.save(PETUGAS, baseInput({ completedAt: 1_000 }));
      deps.clock.current = 5_000;
      const second = await uc.save(PETUGAS, baseInput({ completedAt: 5_000 }));
      expect(second.createdAt).toBe(first.createdAt);
      expect(second.updatedAt).toBe(5_000);
    });

    it("defaults DONE completion to now when omitted", async () => {
      deps.clock.current = 4_242;
      const r = await uc.save(PETUGAS, baseInput({ status: "DONE" }));
      expect(r.completedAt).toBe(4_242);
    });

    it("leaves completedAt null for SKIPPED with no explicit time", async () => {
      const r = await uc.save(PETUGAS, baseInput({ status: "SKIPPED" }));
      expect(r.completedAt).toBeNull();
    });

    it("forbids actors without ship access", async () => {
      await expect(uc.save(STRANGER, baseInput())).rejects.toThrow(ForbiddenError);
    });

    it("admin may save for any ship", async () => {
      const r = await uc.save(ADMIN, baseInput({ completedAt: 2_000 }));
      expect(r.shipId).toBe(SHIP_ID);
    });
  });

  describe("tombstone anti-resurrection (Phase 4.2)", () => {
    let deps: ReturnType<typeof buildDeps>;
    let uc: ReturnType<typeof createPatrolUseCases>;

    beforeEach(async () => {
      deps = buildDeps();
      uc = createPatrolUseCases(deps);
      // Save then soft-delete at t=1000 → tombstone deletedAt=1000.
      await uc.save(PETUGAS, baseInput({ completedAt: 800 }));
      const [saved] = await uc.list(PETUGAS, SHIP_ID, "2026-06-03-DAY");
      deps.clock.current = 1_000;
      await uc.delete(PETUGAS, saved.id);
    });

    it("BLOCKS a stale re-upsert captured before the deletion", async () => {
      await expect(uc.save(PETUGAS, baseInput({ completedAt: 500 }))).rejects.toThrow(
        StalePatrolReportError,
      );
    });

    it("BLOCKS a re-upsert captured exactly at the deletion (<=)", async () => {
      await expect(uc.save(PETUGAS, baseInput({ completedAt: 1_000 }))).rejects.toThrow(
        StalePatrolReportError,
      );
    });

    it("ALLOWS a genuine re-visit captured after the deletion (clears tombstone)", async () => {
      const r = await uc.save(PETUGAS, baseInput({ completedAt: 1_500 }));
      expect(r.deletedAt).toBeNull();
      const list = await uc.list(PETUGAS, SHIP_ID, "2026-06-03-DAY");
      expect(list.length).toBe(1);
      expect(list[0].completedAt).toBe(1_500);
    });

    it("delete is idempotent-safe: deleting a tombstoned report 404s", async () => {
      const all = await deps.patrols.findByNaturalKey("2026-06-03-DAY", SHIP_ID, CP_ID);
      await expect(uc.delete(PETUGAS, all!.id)).rejects.toThrow(/not found/i);
    });
  });

  describe("listPatrolReports", () => {
    it("excludes tombstoned reports", async () => {
      const deps = buildDeps();
      const uc = createPatrolUseCases(deps);
      await uc.save(PETUGAS, baseInput({ checkpointId: CP_ID, completedAt: 1_000 }));
      await uc.save(
        PETUGAS,
        baseInput({ checkpointId: CP_ID_2, checkpointName: "Deck", completedAt: 1_000 }),
      );
      const [first] = await uc.list(PETUGAS, SHIP_ID, "2026-06-03-DAY");
      await uc.delete(PETUGAS, first.id);
      const list = await uc.list(PETUGAS, SHIP_ID, "2026-06-03-DAY");
      expect(list.length).toBe(1);
    });

    it("forbids actors without ship access", async () => {
      const uc = createPatrolUseCases(buildDeps());
      await expect(uc.list(STRANGER, SHIP_ID, "x")).rejects.toThrow(ForbiddenError);
    });
  });

  describe("finalizeShift — reconstruct from custom_checkpoints", () => {
    let deps: ReturnType<typeof buildDeps>;
    let uc: ReturnType<typeof createPatrolUseCases>;

    beforeEach(async () => {
      deps = buildDeps();
      uc = createPatrolUseCases(deps);
      await deps.ships.create({
        id: SHIP_ID,
        name: "MV Test",
        customCheckpoints: [
          { id: CP_ID, name: "Bridge" },
          { id: CP_ID_2, name: "Engine Room" },
        ],
        createdAt: 1,
        updatedAt: 1,
      });
    });

    it("creates PENDING placeholders for un-visited checkpoints", async () => {
      const snapshot = await uc.finalizeShift(PETUGAS, SHIP_ID, "2026-06-03-DAY");
      expect(snapshot.length).toBe(2);
      expect(snapshot.every((r) => r.status === "PENDING")).toBe(true);
    });

    it("does not overwrite an already-visited checkpoint", async () => {
      await uc.save(
        PETUGAS,
        baseInput({ checkpointId: CP_ID, status: "DONE", completedAt: 1_000 }),
      );
      const snapshot = await uc.finalizeShift(PETUGAS, SHIP_ID, "2026-06-03-DAY");
      expect(snapshot.length).toBe(2);
      const bridge = snapshot.find((r) => r.checkpointId === CP_ID);
      expect(bridge?.status).toBe("DONE");
    });

    it("matches by normalized name when the checkpoint id changed at runtime", async () => {
      // A report was saved under a different id but the same (differently-cased) name.
      await uc.save(
        PETUGAS,
        baseInput({
          checkpointId: "old-runtime-id",
          checkpointName: "  BRIDGE  ",
          status: "DONE",
          completedAt: 1_000,
        }),
      );
      const snapshot = await uc.finalizeShift(PETUGAS, SHIP_ID, "2026-06-03-DAY");
      // Bridge matched by name (no duplicate) → Engine Room added → 2 total.
      expect(snapshot.length).toBe(2);
    });

    it("preserves orphan reports for checkpoints removed from the config", async () => {
      await uc.save(
        PETUGAS,
        baseInput({
          checkpointId: "ghost",
          checkpointName: "Old Deck",
          status: "DONE",
          completedAt: 1_000,
        }),
      );
      const snapshot = await uc.finalizeShift(PETUGAS, SHIP_ID, "2026-06-03-DAY");
      // 2 configured + 1 orphan preserved = 3.
      expect(snapshot.length).toBe(3);
      expect(snapshot.some((r) => r.checkpointId === "ghost")).toBe(true);
    });

    it("forbids actors without ship access", async () => {
      await expect(uc.finalizeShift(STRANGER, SHIP_ID, "x")).rejects.toThrow(ForbiddenError);
    });
  });

  describe("listShiftHistory — per-shift roll-up", () => {
    it("aggregates a shift's checkpoint tallies for the ship", async () => {
      const deps = buildDeps();
      const uc = createPatrolUseCases(deps);
      await uc.save(
        PETUGAS,
        baseInput({ checkpointId: CP_ID, status: "DONE", completedAt: 1_000 }),
      );
      await uc.save(
        PETUGAS,
        baseInput({ checkpointId: CP_ID_2, checkpointName: "Deck", status: "SKIPPED" }),
      );
      const hist = await uc.history(PETUGAS);
      expect(hist.length).toBe(1);
      expect(hist[0]).toMatchObject({
        shipId: SHIP_ID,
        shiftKey: "2026-06-03-DAY",
        total: 2,
        done: 1,
        skipped: 1,
        pending: 0,
      });
    });

    it("scopes a petugas to their own ships", async () => {
      const deps = buildDeps();
      const uc = createPatrolUseCases(deps);
      await uc.save(
        ADMIN,
        baseInput({ shipId: SHIP_ID_2, checkpointId: CP_ID, completedAt: 1_000 }),
      );
      await uc.save(
        PETUGAS,
        baseInput({ shipId: SHIP_ID, checkpointId: CP_ID, completedAt: 1_000 }),
      );
      const hist = await uc.history(PETUGAS);
      expect(hist.length).toBe(1);
      expect(hist[0].shipId).toBe(SHIP_ID);
    });

    it("spans every ship for an admin", async () => {
      const deps = buildDeps();
      const uc = createPatrolUseCases(deps);
      await uc.save(ADMIN, baseInput({ shipId: SHIP_ID, completedAt: 1_000 }));
      await uc.save(ADMIN, baseInput({ shipId: SHIP_ID_2, completedAt: 1_000 }));
      const hist = await uc.history(ADMIN);
      const shipIds = hist.map((s) => s.shipId);
      expect(shipIds).toContain(SHIP_ID);
      expect(shipIds).toContain(SHIP_ID_2);
    });

    it("forbids a non-member when an explicit shipId is requested", async () => {
      const uc = createPatrolUseCases(buildDeps());
      await expect(uc.history(STRANGER, SHIP_ID)).rejects.toThrow(ForbiddenError);
    });

    it("excludes tombstoned reports from the tally", async () => {
      const deps = buildDeps();
      const uc = createPatrolUseCases(deps);
      await uc.save(PETUGAS, baseInput({ checkpointId: CP_ID, completedAt: 1_000 }));
      await uc.save(
        PETUGAS,
        baseInput({ checkpointId: CP_ID_2, checkpointName: "Deck", completedAt: 1_000 }),
      );
      const [first] = await uc.list(PETUGAS, SHIP_ID, "2026-06-03-DAY");
      await uc.delete(PETUGAS, first.id);
      const hist = await uc.history(PETUGAS);
      expect(hist[0].total).toBe(1);
    });
  });
});
