import { describe, expect, it } from "vitest";
import { validateSigninForm } from "./signin-validation";

describe("validateSigninForm", () => {
  it("passes for valid sign-in values", () => {
    const result = validateSigninForm({
      email: "alex@example.com",
      password: "password123",
    });

    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual({});
  });

  it("fails for missing/invalid values", () => {
    const result = validateSigninForm({
      email: "bad-email",
      password: "",
    });

    expect(result.isValid).toBe(false);
    expect(result.errors.email).toBeTruthy();
    expect(result.errors.password).toBeTruthy();
  });
});
