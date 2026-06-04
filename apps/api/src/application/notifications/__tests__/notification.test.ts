import { describe, expect, it } from "vitest";
import type { Actor } from "../../../domain/authz";
import { NotFoundError } from "../../../domain/errors";
import type { NotificationRecord } from "../../ports/NotificationRepository";
import type { ProfileRecord } from "../../ports/ProfileRepository";
import { InMemoryProfileRepository, MutableClock, SequentialIds } from "../../auth/__tests__/fakes";
import { createSosUseCases } from "../../sos";
import { InMemorySosRepository } from "../../sos/__tests__/fakes";
import { createIncidentUseCases } from "../../incidents";
import { InMemoryIncidentRepository } from "../../incidents/__tests__/fakes";
import { createNotificationUseCases, makeNotifier } from "../index";
import { InMemoryNotificationRepository, RecordingNotifier } from "./fakes";

const USER = "11111111-1111-4111-8111-111111111111";
const OTHER = "22222222-2222-4222-8222-222222222222";
const SHIP = "aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa";

function actor(overrides?: Partial<Actor>): Actor {
  return { id: USER, role: "PETUGAS", shipIds: [SHIP], ...overrides };
}

function notif(overrides: Partial<NotificationRecord> & { id: string }): NotificationRecord {
  return {
    userId: USER,
    kind: "SYSTEM",
    title: "Hello",
    body: null,
    data: {},
    readAt: null,
    createdAt: 1_000,
    updatedAt: 1_000,
    ...overrides,
  };
}

function profile(overrides: Partial<ProfileRecord> & { id: string }): ProfileRecord {
  return {
    email: `${overrides.id}@example.com`,
    passwordHash: "x",
    fullName: null,
    role: "PETUGAS",
    enabled: true,
    shipIds: [],
    createdAt: 0,
    updatedAt: 0,
    ...overrides,
  };
}

function buildDeps() {
  const notifications = new InMemoryNotificationRepository();
  const clock = new MutableClock(5_000);
  return { notifications, clock };
}

describe("notification use-cases", () => {
  it("list — returns only the actor's notifications, newest first", async () => {
    const deps = buildDeps();
    await deps.notifications.createMany([
      notif({ id: "a", userId: USER, createdAt: 100 }),
      notif({ id: "b", userId: USER, createdAt: 300 }),
      notif({ id: "c", userId: OTHER, createdAt: 200 }),
    ]);
    const uc = createNotificationUseCases(deps);
    const list = await uc.list(actor());
    expect(list.map((n) => n.id)).toEqual(["b", "a"]);
  });

  it("unreadCount — counts only the actor's unread notifications", async () => {
    const deps = buildDeps();
    await deps.notifications.createMany([
      notif({ id: "a", userId: USER, readAt: null }),
      notif({ id: "b", userId: USER, readAt: 9_000 }),
      notif({ id: "c", userId: OTHER, readAt: null }),
    ]);
    const uc = createNotificationUseCases(deps);
    expect(await uc.unreadCount(actor())).toBe(1);
  });

  it("markRead — marks the actor's own notification read", async () => {
    const deps = buildDeps();
    await deps.notifications.create(notif({ id: "a", userId: USER, readAt: null }));
    const uc = createNotificationUseCases(deps);
    await uc.markRead(actor(), "a");
    expect(deps.notifications.rows.get("a")?.readAt).toBe(5_000);
    expect(await uc.unreadCount(actor())).toBe(0);
  });

  it("markRead — throws NotFound for a foreign notification (no leak)", async () => {
    const deps = buildDeps();
    await deps.notifications.create(notif({ id: "a", userId: OTHER, readAt: null }));
    const uc = createNotificationUseCases(deps);
    await expect(uc.markRead(actor(), "a")).rejects.toThrow(NotFoundError);
    expect(deps.notifications.rows.get("a")?.readAt).toBeNull();
  });

  it("markRead — throws NotFound for an unknown id", async () => {
    const uc = createNotificationUseCases(buildDeps());
    await expect(uc.markRead(actor(), "ghost")).rejects.toThrow(NotFoundError);
  });

  it("markAllRead — clears the actor's unread, leaving others untouched", async () => {
    const deps = buildDeps();
    await deps.notifications.createMany([
      notif({ id: "a", userId: USER, readAt: null }),
      notif({ id: "b", userId: USER, readAt: null }),
      notif({ id: "c", userId: OTHER, readAt: null }),
    ]);
    const uc = createNotificationUseCases(deps);
    await uc.markAllRead(actor());
    expect(await uc.unreadCount(actor())).toBe(0);
    expect(deps.notifications.rows.get("c")?.readAt).toBeNull();
  });
});

describe("makeNotifier.notifyShip", () => {
  function buildNotifierDeps() {
    return {
      profiles: new InMemoryProfileRepository(),
      notifications: new InMemoryNotificationRepository(),
      clock: new MutableClock(7_000),
      ids: new SequentialIds(),
    };
  }

  it("notifies admins + ship members, excluding the raiser and disabled accounts", async () => {
    const deps = buildNotifierDeps();
    await deps.profiles.create(profile({ id: "admin", role: "ADMIN" }));
    await deps.profiles.create(profile({ id: "mate", role: "PETUGAS", shipIds: [SHIP] }));
    await deps.profiles.create(profile({ id: "raiser", role: "PETUGAS", shipIds: [SHIP] }));
    await deps.profiles.create(profile({ id: "other-ship", role: "PETUGAS", shipIds: ["zzz"] }));
    await deps.profiles.create(profile({ id: "disabled", role: "ADMIN", enabled: false }));

    await makeNotifier(deps).notifyShip({
      shipId: SHIP,
      kind: "SOS",
      title: "SOS Darurat",
      excludeUserId: "raiser",
    });

    const recipients = Array.from(deps.notifications.rows.values())
      .map((n) => n.userId)
      .sort();
    expect(recipients).toEqual(["admin", "mate"]);
    const sample = Array.from(deps.notifications.rows.values())[0];
    expect(sample.kind).toBe("SOS");
    expect(sample.readAt).toBeNull();
    expect(sample.createdAt).toBe(7_000);
  });

  it("is a no-op when nobody qualifies", async () => {
    const deps = buildNotifierDeps();
    await deps.profiles.create(profile({ id: "raiser", role: "PETUGAS", shipIds: [SHIP] }));
    await makeNotifier(deps).notifyShip({
      shipId: SHIP,
      kind: "SOS",
      title: "X",
      excludeUserId: "raiser",
    });
    expect(deps.notifications.rows.size).toBe(0);
  });
});

describe("event sources fan out via the notifier", () => {
  it("raiseSos notifies, excluding the raiser", async () => {
    const notifier = new RecordingNotifier();
    const sos = createSosUseCases({
      sos: new InMemorySosRepository(),
      notifier,
      clock: new MutableClock(1_000),
      ids: new SequentialIds(),
    });
    await sos.raise(actor(), { shipId: SHIP });
    expect(notifier.calls).toHaveLength(1);
    expect(notifier.calls[0]).toMatchObject({ shipId: SHIP, kind: "SOS", excludeUserId: USER });
  });

  it("createIncident notifies", async () => {
    const notifier = new RecordingNotifier();
    const incidents = createIncidentUseCases({
      incidents: new InMemoryIncidentRepository(),
      notifier,
      clock: new MutableClock(1_000),
      ids: new SequentialIds(),
    });
    await incidents.create(actor(), {
      shipId: SHIP,
      title: "Pintu rusak",
      severity: "LOW",
      payload: {},
    });
    expect(notifier.calls).toHaveLength(1);
    expect(notifier.calls[0]).toMatchObject({ shipId: SHIP, kind: "INCIDENT" });
  });
});
