import { describe, expect, it } from "vitest";
import { formatTimeAgo, parseShiftKey } from "../shiftLabel";

describe("parseShiftKey", () => {
  it("parses a day shift", () => {
    expect(parseShiftKey("2026-06-03-DAY")).toEqual({
      dateLabel: "3 Jun 2026",
      slot: "DAY",
      slotLabel: "Siang",
    });
  });

  it("parses a night shift", () => {
    expect(parseShiftKey("2026-12-25-NIGHT")).toEqual({
      dateLabel: "25 Des 2026",
      slot: "NIGHT",
      slotLabel: "Malam",
    });
  });

  it("falls back to the raw key when unparseable", () => {
    expect(parseShiftKey("weird-key")).toEqual({
      dateLabel: "weird-key",
      slot: null,
      slotLabel: "weird-key",
    });
  });
});

describe("formatTimeAgo", () => {
  const now = 10_000_000;

  it("renders an em dash for null", () => {
    expect(formatTimeAgo(null, now)).toBe("—");
  });

  it("renders 'baru saja' under a minute", () => {
    expect(formatTimeAgo(now - 30_000, now)).toBe("baru saja");
  });

  it("renders minutes, hours, and days", () => {
    expect(formatTimeAgo(now - 5 * 60_000, now)).toBe("5m lalu");
    expect(formatTimeAgo(now - 3 * 3_600_000, now)).toBe("3j lalu");
    expect(formatTimeAgo(now - 2 * 86_400_000, now)).toBe("2h lalu");
  });
});
