import { describe, expect, it } from "vitest";
import { type RegisterForm, validateRegister } from "../registerValidation";

const valid: RegisterForm = {
  photoUrl: "data:image/jpeg;base64,AAAA",
  name: "Budi Santoso",
  type: "BUJP",
  workerNumber: "PKJ-001245",
  email: "budi@example.com",
  password: "supersecret",
  confirmPassword: "supersecret",
  phone: "0812-3456-7890",
};

describe("validateRegister", () => {
  it("passes a fully valid form", () => {
    const { errors, message } = validateRegister(valid);
    expect(message).toBeNull();
    expect(Object.keys(errors)).toHaveLength(0);
  });

  it("requires a photo first", () => {
    const { errors, message } = validateRegister({ ...valid, photoUrl: null });
    expect(errors.photo).toBe(true);
    expect(message).toMatch(/Foto profil/i);
  });

  it("flags an invalid email", () => {
    const { errors, message } = validateRegister({ ...valid, email: "not-an-email" });
    expect(errors.email).toBe(true);
    expect(message).toMatch(/email/i);
  });

  it("flags a short password", () => {
    const { errors } = validateRegister({ ...valid, password: "short", confirmPassword: "short" });
    expect(errors.password).toBe(true);
  });

  it("flags mismatched password confirmation", () => {
    const { errors, message } = validateRegister({ ...valid, confirmPassword: "different" });
    expect(errors.confirmPassword).toBe(true);
    expect(message).toMatch(/Konfirmasi password/i);
  });

  it("flags an invalid phone number", () => {
    const { errors } = validateRegister({ ...valid, phone: "0812" });
    expect(errors.phone).toBe(true);
  });

  it("reports the photo message before other errors", () => {
    const { message } = validateRegister({ ...valid, photoUrl: null, name: "" });
    expect(message).toMatch(/Foto profil/i);
  });
});
