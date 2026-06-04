import { describe, expect, it } from "vitest";
import { formatPhone, isValidPhone, phoneDigits } from "../phone";

describe("formatPhone", () => {
  it("groups digits as xxxx-xxxx-xxxx-xxxxx", () => {
    expect(formatPhone("081234567890123")).toBe("0812-3456-7890-123");
  });

  it("strips non-digits", () => {
    expect(formatPhone("0812 3456 abc")).toBe("0812-3456");
  });

  it("caps at 17 digits", () => {
    expect(formatPhone("0123456789012345678")).toBe("0123-4567-8901-23456");
  });

  it("returns empty string for no digits", () => {
    expect(formatPhone("abc")).toBe("");
  });
});

describe("phoneDigits", () => {
  it("returns only digits", () => {
    expect(phoneDigits("0812-3456-7890")).toBe("081234567890");
  });
});

describe("isValidPhone", () => {
  it("rejects fewer than 10 digits", () => {
    expect(isValidPhone("081234567")).toBe(false);
  });
  it("accepts 10 digits", () => {
    expect(isValidPhone("0812345678")).toBe(true);
  });
  it("accepts 17 digits", () => {
    expect(isValidPhone("01234567890123456")).toBe(true);
  });
  it("rejects more than 17 digits", () => {
    expect(isValidPhone("012345678901234567")).toBe(false);
  });
});
