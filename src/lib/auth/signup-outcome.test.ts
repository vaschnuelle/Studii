import { describe, expect, it } from "vitest";
import { resolveSignupResolution } from "./signup-outcome";

describe("resolveSignupResolution", () => {
  it("marks signup authenticated when Supabase returns a session", () => {
    const outcome = resolveSignupResolution({
      data: {
        session: { access_token: "token" } as never,
        user: { id: "user-1" } as never,
      },
      error: null,
    });

    expect(outcome.isSuccess).toBe(true);
    expect(outcome.isAuthenticated).toBe(true);
    expect(outcome.requiresEmailConfirmation).toBe(false);
  });

  it("marks signup as confirmation-required when user exists without session", () => {
    const outcome = resolveSignupResolution({
      data: {
        session: null,
        user: { id: "user-1" } as never,
      },
      error: null,
    });

    expect(outcome.isSuccess).toBe(true);
    expect(outcome.isAuthenticated).toBe(false);
    expect(outcome.requiresEmailConfirmation).toBe(true);
  });

  it("marks signup as failed when no user and no session are returned", () => {
    const outcome = resolveSignupResolution({
      data: {
        session: null,
        user: null,
      },
      error: null,
    });

    expect(outcome.isSuccess).toBe(false);
    expect(outcome.isAuthenticated).toBe(false);
    expect(outcome.requiresEmailConfirmation).toBe(false);
  });
});
