import { describe, expect, it } from "vitest";
import { buildProfileBootstrapErrorMessage, getReadableErrorMessage } from "./auth-error";

describe("buildProfileBootstrapErrorMessage", () => {
  it("returns migration guidance when profiles table is missing", () => {
    const message = buildProfileBootstrapErrorMessage(
      new Error('relation "public.profiles" does not exist')
    );
    expect(message).toContain("migration");
  });

  it("returns username guidance when unique username conflicts", () => {
    const message = buildProfileBootstrapErrorMessage(new Error("duplicate key value profiles_username_key"));
    expect(message).toContain("username");
  });
});

describe("getReadableErrorMessage", () => {
  it("returns message from Error instances", () => {
    const message = getReadableErrorMessage(new Error("Detailed failure"), "Fallback");
    expect(message).toBe("Detailed failure");
  });

  it("returns message from non-Error objects with message property", () => {
    const message = getReadableErrorMessage({ message: "Supabase object error" }, "Fallback");
    expect(message).toBe("Supabase object error");
  });

  it("returns fallback when no readable message exists", () => {
    const message = getReadableErrorMessage({ code: "PGRST301" }, "Fallback");
    expect(message).toBe("Fallback");
  });
});
