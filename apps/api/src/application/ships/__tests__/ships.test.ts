import { describe, expect, it, beforeEach } from "vitest";
import { ForbiddenError } from "../../../domain/errors";
import { MutableClock, SequentialIds } from "../../auth/__tests__/fakes";
import { createShipUseCases } from "../index";
import { InMemoryShipRepository } from "./fakes";
import type { Actor } from "../../../domain/authz";

const ADMIN: Actor = { id: "admin-1", role: "ADMIN", shipIds: [] };
const SHIP_ID = "11111111-1111-4111-8111-111111111111";
const PIC: Actor = { id: "pic-1", role: "PIC", shipIds: [SHIP_ID] };
const STRANGER: Actor = { id: "stranger-1", role: "PETUGAS", shipIds: [] };

function buildDeps() {
  const ships = new InMemoryShipRepository();
  const clock = new MutableClock(Date.now());
  const ids = new SequentialIds();
  return { ships, clock, ids };
}

describe("ships use-cases", () => {
  describe("createShip", () => {
    it("admin can create a ship", async () => {
      const deps = buildDeps();
      const uc = createShipUseCases(deps);
      const ship = await uc.create(ADMIN, { name: "MV Nusantara", customCheckpoints: [] });
      expect(ship.name).toBe("MV Nusantara");
      expect(ship.id).toBeDefined();
    });

    it("non-admin is forbidden", async () => {
      const uc = createShipUseCases(buildDeps());
      await expect(uc.create(PIC, { name: "X", customCheckpoints: [] })).rejects.toThrow(
        ForbiddenError,
      );
    });

    it("duplicate name is rejected with 409", async () => {
      const deps = buildDeps();
      const uc = createShipUseCases(deps);
      await uc.create(ADMIN, { name: "MV Nusantara", customCheckpoints: [] });
      await expect(
        uc.create(ADMIN, { name: "MV Nusantara", customCheckpoints: [] }),
      ).rejects.toMatchObject({
        status: 409,
      });
    });
  });

  describe("listShips", () => {
    let uc: ReturnType<typeof createShipUseCases>;

    beforeEach(async () => {
      const deps = buildDeps();
      uc = createShipUseCases(deps);
      // Seed with explicit IDs so we can control actor.shipIds
      await deps.ships.create({
        id: SHIP_ID,
        name: "Assigned",
        customCheckpoints: [],
        createdAt: 1,
        updatedAt: 1,
      });
      await deps.ships.create({
        id: "other-ship",
        name: "Other",
        customCheckpoints: [],
        createdAt: 1,
        updatedAt: 1,
      });
    });

    it("admin sees all ships", async () => {
      const list = await uc.list(ADMIN);
      expect(list.length).toBe(2);
    });

    it("PIC only sees assigned ships", async () => {
      const list = await uc.list(PIC);
      expect(list.length).toBe(1);
      expect(list[0].id).toBe(SHIP_ID);
    });

    it("PETUGAS with no assignments sees nothing", async () => {
      const list = await uc.list(STRANGER);
      expect(list.length).toBe(0);
    });
  });

  describe("getShip", () => {
    it("returns ship when actor has access", async () => {
      const deps = buildDeps();
      const uc = createShipUseCases(deps);
      await deps.ships.create({
        id: SHIP_ID,
        name: "Test",
        customCheckpoints: [],
        createdAt: 1,
        updatedAt: 1,
      });
      const ship = await uc.get(PIC, SHIP_ID);
      expect(ship.id).toBe(SHIP_ID);
    });

    it("throws Forbidden when actor lacks access", async () => {
      const deps = buildDeps();
      const uc = createShipUseCases(deps);
      await deps.ships.create({
        id: SHIP_ID,
        name: "Test",
        customCheckpoints: [],
        createdAt: 1,
        updatedAt: 1,
      });
      await expect(uc.get(STRANGER, SHIP_ID)).rejects.toThrow(ForbiddenError);
    });
  });

  describe("updateShip", () => {
    it("admin can rename a ship", async () => {
      const deps = buildDeps();
      const uc = createShipUseCases(deps);
      await deps.ships.create({
        id: SHIP_ID,
        name: "Old",
        customCheckpoints: [],
        createdAt: 1,
        updatedAt: 1,
      });
      const updated = await uc.update(ADMIN, SHIP_ID, { name: "New" });
      expect(updated.name).toBe("New");
    });

    it("non-admin is forbidden", async () => {
      const deps = buildDeps();
      const uc = createShipUseCases(deps);
      await deps.ships.create({
        id: SHIP_ID,
        name: "Old",
        customCheckpoints: [],
        createdAt: 1,
        updatedAt: 1,
      });
      await expect(uc.update(PIC, SHIP_ID, { name: "New" })).rejects.toThrow(ForbiddenError);
    });
  });

  describe("deleteShip", () => {
    it("admin can delete a ship", async () => {
      const deps = buildDeps();
      const uc = createShipUseCases(deps);
      await deps.ships.create({
        id: SHIP_ID,
        name: "ToDelete",
        customCheckpoints: [],
        createdAt: 1,
        updatedAt: 1,
      });
      await expect(uc.delete(ADMIN, SHIP_ID)).resolves.toBeUndefined();
    });

    it("non-admin is forbidden", async () => {
      const deps = buildDeps();
      const uc = createShipUseCases(deps);
      await deps.ships.create({
        id: SHIP_ID,
        name: "ToDelete",
        customCheckpoints: [],
        createdAt: 1,
        updatedAt: 1,
      });
      await expect(uc.delete(PIC, SHIP_ID)).rejects.toThrow(ForbiddenError);
    });
  });
});
