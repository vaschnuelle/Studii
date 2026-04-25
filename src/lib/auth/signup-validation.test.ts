import { describe, expect, it } from "vitest";
import { validateSignupForm } from "./signup-validation";

describe("validateSignupForm", () => {
  it("passes for valid signup input", () => {
    const result = validateSignupForm({
      fullName: "Veronica Wong",
      email: "veronica@example.com",
      password: "securepass123",
      confirmPassword: "securepass123",
    });

    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual({});
  });

  it("fails for invalid signup fields", () => {
    const result = validateSignupForm({
      fullName: "",
      email: "not-an-email",
      password: "short",
      confirmPassword: "different",
    });

    expect(result.isValid).toBe(false);
    expect(result.errors.fullName).toBeTruthy();
    expect(result.errors.email).toBeTruthy();
    expect(result.errors.password).toBeTruthy();
    expect(result.errors.confirmPassword).toBeTruthy();
  });
});
