import { describe, expect, it } from "vitest";
import { mapFriendRowsToCards, normalizeFriendUsernameQuery, searchProfilesByUsername } from "./friends-service";

describe("mapFriendRowsToCards", () => {
  it("maps accepted studying friend to active card", () => {
    const cards = mapFriendRowsToCards(
      "me",
      [
        {
          requester_user_id: "me",
          addressee_user_id: "friend-1",
          status: "accepted",
        },
      ],
      [{ id: "friend-1", full_name: "Sam Rivera", username: "sam", avatar_url: null }],
      [{ user_id: "friend-1", status: "studying", subject: "Math" }]
    );

    expect(cards).toHaveLength(1);
    expect(cards[0]?.status).toBe("active");
    expect(cards[0]?.activity).toContain("Studying");
  });

  it("maps pending relations as pending cards", () => {
    const cards = mapFriendRowsToCards(
      "me",
      [
        {
          requester_user_id: "friend-2",
          addressee_user_id: "me",
          status: "pending",
        },
      ],
      [{ id: "friend-2", full_name: "Taylor Quinn", username: "taylor", avatar_url: null }],
      []
    );

    expect(cards[0]?.status).toBe("pending");
  });
});

describe("normalizeFriendUsernameQuery", () => {
  it("normalizes @ prefixes and casing", () => {
    expect(normalizeFriendUsernameQuery("@Sam.Rivera")).toBe("sam_rivera");
  });
});

describe("searchProfilesByUsername", () => {
  it("returns empty results for short queries", async () => {
    const result = await searchProfilesByUsername({} as never, "me", "ab");
    expect(result).toEqual([]);
  });
});
