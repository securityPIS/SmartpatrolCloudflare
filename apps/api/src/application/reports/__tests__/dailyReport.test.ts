import { describe, expect, it } from "vitest";
import type { Actor } from "../../../domain/authz";
import { ForbiddenError } from "../../../domain/errors";
import { MutableClock } from "../../auth/__tests__/fakes";
import { InMemoryShipRepository } from "../../ships/__tests__/fakes";
import { InMemoryPatrolReportRepository } from "../../patrol/__tests__/fakes";
import { InMemorySosRepository } from "../../sos/__tests__/fakes";
import { InMemoryIncidentRepository } from "../../incidents/__tests__/fakes";
import { createReportUseCases } from "../index";

const SHIP_A = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const SHIP_B = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const DATE = "2026-06-04";

const ADMIN: Actor = { id: "admin", role: "ADMIN", shipIds: [] };
const PIC_A: Actor = { id: "pic", role: "PIC", shipIds: [SHIP_A] };
const PETUGAS: Actor = { id: "petugas", role: "PETUGAS", shipIds: [SHIP_A] };

function seedReport(
  patrols: InMemoryPatrolReportRepository,
  opts: {
    shipId: string;
    shiftKey: string;
    checkpointId: string;
    status: "DONE" | "SKIPPED" | "PENDING";
  },
) {
  return patrols.upsert({
    id: `${opts.shipId}-${opts.shiftKey}-${opts.checkpointId}`,
    shiftKey: opts.shiftKey,
    shipId: opts.shipId,
    checkpointId: opts.checkpointId,
    checkpointName: opts.checkpointId,
    status: opts.status,
    note: null,
    media: [],
    lat: null,
    lng: null,
    reportedBy: "u",
    completedAt: opts.status === "DONE" ? 1_000 : null,
    deletedAt: null,
    createdAt: 1_000,
    updatedAt: 1_000,
  });
}

async function buildDeps() {
  const patrols = new InMemoryPatrolReportRepository();
  const sos = new InMemorySosRepository();
  const incidents = new InMemoryIncidentRepository();
  const ships = new InMemoryShipRepository();
  const clock = new MutableClock(1_700_000_000_000);

  await ships.create({
    id: SHIP_A,
    name: "Alpha",
    customCheckpoints: [],
    createdAt: 1,
    updatedAt: 1,
  });
  await ships.create({
    id: SHIP_B,
    name: "Bravo",
    customCheckpoints: [],
    createdAt: 1,
    updatedAt: 1,
  });

  // SHIP_A on DATE: 2 DONE + 1 PENDING; SHIP_B on DATE: 1 DONE.
  await seedReport(patrols, {
    shipId: SHIP_A,
    shiftKey: `${DATE}-DAY`,
    checkpointId: "c1",
    status: "DONE",
  });
  await seedReport(patrols, {
    shipId: SHIP_A,
    shiftKey: `${DATE}-DAY`,
    checkpointId: "c2",
    status: "DONE",
  });
  await seedReport(patrols, {
    shipId: SHIP_A,
    shiftKey: `${DATE}-DAY`,
    checkpointId: "c3",
    status: "PENDING",
  });
  await seedReport(patrols, {
    shipId: SHIP_B,
    shiftKey: `${DATE}-DAY`,
    checkpointId: "c1",
    status: "DONE",
  });
  // A different day — must be excluded from DATE's tally.
  await seedReport(patrols, {
    shipId: SHIP_A,
    shiftKey: "2026-06-03-DAY",
    checkpointId: "c1",
    status: "DONE",
  });

  await sos.create({
    id: "s1",
    shipId: SHIP_A,
    raisedBy: "u",
    status: "ACTIVE",
    lat: null,
    lng: null,
    message: null,
    resolvedAt: null,
    createdAt: 1,
    updatedAt: 1,
  });
  await sos.create({
    id: "s2",
    shipId: SHIP_B,
    raisedBy: "u",
    status: "RESOLVED",
    lat: null,
    lng: null,
    message: null,
    resolvedAt: 2,
    createdAt: 1,
    updatedAt: 2,
  });

  const inc = (id: string, shipId: string, status: "OPEN" | "RESOLVED") =>
    incidents.create({
      id,
      shipId,
      title: id,
      description: null,
      severity: "LOW",
      status,
      payload: {},
      reportedBy: "u",
      createdAt: 1,
      updatedAt: 1,
    });
  await inc("i1", SHIP_A, "OPEN");
  await inc("i2", SHIP_B, "OPEN");
  await inc("i3", SHIP_B, "RESOLVED");

  return { patrols, sos, incidents, ships, clock };
}

describe("makeDailyReport", () => {
  it("composes a fleet-wide report for an admin", async () => {
    const uc = createReportUseCases(await buildDeps());
    const report = await uc.daily(ADMIN, DATE);

    expect(report.date).toBe(DATE);
    expect(report.shipsTotal).toBe(2);
    expect(report.patrol).toMatchObject({
      total: 4,
      done: 3,
      skipped: 0,
      pending: 1,
      completionPct: 75,
    });
    expect(report.activeSos).toBe(1);
    expect(report.openIncidents).toBe(2);
    expect(report.perShip).toHaveLength(2);
    expect(report.perShip[0]).toMatchObject({ shipName: "Alpha", total: 3, done: 2, pending: 1 });
    expect(report.perShip[1]).toMatchObject({ shipName: "Bravo", total: 1, done: 1 });
  });

  it("scopes a PIC to their assigned ships", async () => {
    const uc = createReportUseCases(await buildDeps());
    const report = await uc.daily(PIC_A, DATE);

    expect(report.shipsTotal).toBe(1);
    expect(report.perShip).toHaveLength(1);
    expect(report.perShip[0].shipName).toBe("Alpha");
    expect(report.patrol).toMatchObject({ total: 3, done: 2, pending: 1, completionPct: 67 });
    expect(report.activeSos).toBe(1);
    expect(report.openIncidents).toBe(1);
  });

  it("excludes other days from the patrol tally", async () => {
    const uc = createReportUseCases(await buildDeps());
    const report = await uc.daily(ADMIN, "2026-06-03");
    expect(report.patrol).toMatchObject({ total: 1, done: 1 });
  });

  it("lists ships with zeros when there is no activity", async () => {
    const uc = createReportUseCases(await buildDeps());
    const report = await uc.daily(ADMIN, "2026-01-01");
    expect(report.patrol).toMatchObject({ total: 0, done: 0, completionPct: 0 });
    expect(report.perShip).toHaveLength(2);
    expect(report.perShip.every((s) => s.total === 0)).toBe(true);
  });

  it("forbids a PETUGAS", async () => {
    const uc = createReportUseCases(await buildDeps());
    await expect(uc.daily(PETUGAS, DATE)).rejects.toThrow(ForbiddenError);
  });
});
