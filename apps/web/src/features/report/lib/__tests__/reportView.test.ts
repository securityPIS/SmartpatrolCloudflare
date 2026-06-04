import { describe, expect, it } from "vitest";
import { completionTone, formatDateKey, todayDateKey } from "../reportView";

describe("todayDateKey", () => {
  it("formats a local date as YYYY-MM-DD with zero padding", () => {
    expect(todayDateKey(new Date(2026, 5, 4))).toBe("2026-06-04");
    expect(todayDateKey(new Date(2026, 0, 9))).toBe("2026-01-09");
  });
});

describe("formatDateKey", () => {
  it("formats a valid key in Indonesian short month", () => {
    expect(formatDateKey("2026-06-04")).toBe("4 Jun 2026");
    expect(formatDateKey("2026-12-25")).toBe("25 Des 2026");
  });

  it("passes through an unparseable key", () => {
    expect(formatDateKey("nope")).toBe("nope");
  });
});

describe("completionTone", () => {
  it("greens at or above 80, ambers from 50, reds below", () => {
    expect(completionTone(80)).toContain("emerald");
    expect(completionTone(50)).toContain("amber");
    expect(completionTone(49)).toContain("rose");
  });
});
