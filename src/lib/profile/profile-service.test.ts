import { describe, expect, it } from "vitest";
import {
  buildUsernameCandidate,
  deriveFullName,
  ensureProfileForUser,
  normalizeUsername,
  saveOwnProfile,
  validateProfileInput,
} from "./profile-service";

describe("buildUsernameCandidate", () => {
  it("prefers normalized full name when available", () => {
    const username = buildUsernameCandidate("Veronica Wong", "vw@example.com");
    expect(username).toBe("veronica_wong");
  });

  it("falls back to email local part", () => {
    const username = buildUsernameCandidate("", "veronica.w@example.com");
    expect(username).toBe("veronica_w");
  });
});

describe("deriveFullName", () => {
  it("uses metadata full_name when present", () => {
    const fullName = deriveFullName({
      user_metadata: { full_name: "Sam Rivera" },
      email: "sam@example.com",
    } as never);
    expect(fullName).toBe("Sam Rivera");
  });
});

describe("validateProfileInput", () => {
  it("passes for valid full name and username", () => {
    const result = validateProfileInput({
      fullName: "Sam Rivera",
      username: "sam_rivera",
    });
    expect(result.isValid).toBe(true);
  });

  it("fails for too-short username", () => {
    const result = validateProfileInput({
      fullName: "Sam Rivera",
      username: "ab",
    });
    expect(result.isValid).toBe(false);
  });
});

describe("normalizeUsername", () => {
  it("normalizes casing and separators", () => {
    expect(normalizeUsername(" Sam Rivera ")).toBe("sam_rivera");
  });
});

describe("saveOwnProfile", () => {
  it("throws on invalid profile input", async () => {
    await expect(
      saveOwnProfile({} as never, "user-1", {
        fullName: "",
        username: "name",
      })
    ).rejects.toThrow("Full name must be between 1 and 120 characters.");
  });
});

describe("ensureProfileForUser", () => {
  it("retries without username when username conflict occurs", async () => {
    const saveCalls: Array<{ username: string | null }> = [];
    const mockSupabase = {
      from: () => ({
        select: () => ({
          eq: () => ({
            maybeSingle: async () => ({ data: null, error: null }),
          }),
        }),
        upsert: (payload: { username: string | null }) => {
          saveCalls.push({ username: payload.username });
          return {
            select: () => ({
              single: async () =>
                payload.username
                  ? { data: null, error: new Error("duplicate key value profiles_username_key") }
                  : {
                      data: {
                        id: "user-1",
                        full_name: "Sam Rivera",
                        username: null,
                        avatar_url: null,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                      },
                      error: null,
                    },
            }),
          };
        },
      }),
    };

    await ensureProfileForUser(mockSupabase as never, {
      userId: "user-1",
      fullName: "Sam Rivera",
      email: "sam@example.com",
    });

    expect(saveCalls).toHaveLength(2);
    expect(saveCalls[0]?.username).toBe("sam_rivera");
    expect(saveCalls[1]?.username).toBeNull();
  });
});
