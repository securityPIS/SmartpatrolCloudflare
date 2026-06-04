import { describe, expect, it } from "vitest";
import { formatTimeAgo, kindMeta } from "../notificationView";

describe("kindMeta", () => {
  it("maps each known kind to a distinct label", () => {
    expect(kindMeta("SOS").label).toBe("SOS");
    expect(kindMeta("INCIDENT").label).toBe("Temuan");
    expect(kindMeta("CHECKPOINT_PENDING").label).toBe("Checkpoint");
    expect(kindMeta("SHIFT_WRAP_UP").label).toBe("Shift");
    expect(kindMeta("SYSTEM").label).toBe("Sistem");
  });

  it("returns icon + colour classes for a kind", () => {
    const sos = kindMeta("SOS");
    expect(sos.icon).toBe("siren");
    expect(sos.className).toContain("rose");
  });
});

describe("formatTimeAgo", () => {
  const now = 10_000_000;

  it("renders 'baru saja' under a minute", () => {
    expect(formatTimeAgo(now - 30_000, now)).toBe("baru saja");
  });

  it("renders minutes under an hour", () => {
    expect(formatTimeAgo(now - 5 * 60_000, now)).toBe("5m lalu");
  });

  it("renders hours under a day", () => {
    expect(formatTimeAgo(now - 3 * 3_600_000, now)).toBe("3j lalu");
  });

  it("renders days beyond 24 hours", () => {
    expect(formatTimeAgo(now - 2 * 86_400_000, now)).toBe("2h lalu");
  });
});
