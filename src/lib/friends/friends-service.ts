import type { SupabaseClient } from "@supabase/supabase-js";

export interface FriendRelationRow {
  requester_user_id: string;
  addressee_user_id: string;
  status: "pending" | "accepted" | "blocked";
}

export interface FriendProfileRow {
  id: string;
  full_name: string;
  username: string | null;
  avatar_url: string | null;
}

export interface FriendPresenceRow {
  user_id: string;
  status: "studying" | "idle" | "offline";
  subject: string | null;
}

export interface FriendViewModel {
  id: string;
  name: string;
  username: string | null;
  status: "active" | "inactive" | "pending";
  activity: string;
  image: string;
}

export interface FriendSearchResult {
  id: string;
  fullName: string;
  username: string;
  image: string;
}

const FALLBACK_FRIEND_AVATARS = [
  "https://images.unsplash.com/photo-1758525861586-1c8c8e424dc8?w=200&h=200&fit=crop",
  "https://images.unsplash.com/photo-1770235622334-7b721261a230?w=200&h=200&fit=crop",
  "https://images.unsplash.com/photo-1758521540968-3af0cc2074a0?w=200&h=200&fit=crop",
  "https://images.unsplash.com/photo-1758270705518-b61b40527e76?w=200&h=200&fit=crop",
];

/**
 * Builds a deterministic avatar URL from a friend id.
 */
export function buildAvatarForFriend(friendId: string): string {
  const hashSeed = friendId
    .split("")
    .reduce((sum, character) => sum + character.charCodeAt(0), 0);
  return FALLBACK_FRIEND_AVATARS[hashSeed % FALLBACK_FRIEND_AVATARS.length];
}

/**
 * Normalizes a raw username query to the canonical lookup format.
 */
export function normalizeFriendUsernameQuery(rawQuery: string): string {
  return rawQuery
    .trim()
    .toLowerCase()
    .replace(/^@+/, "")
    .replace(/[^a-z0-9_]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 32);
}

/**
 * Maps relation/profile/presence rows into UI-ready friend cards.
 */
export function mapFriendRowsToCards(
  currentUserId: string,
  relations: FriendRelationRow[],
  profiles: FriendProfileRow[],
  presenceRows: FriendPresenceRow[]
): FriendViewModel[] {
  const profileMap = new Map(profiles.map((profileRow) => [profileRow.id, profileRow]));
  const presenceByUserId = new Map(presenceRows.map((presenceRow) => [presenceRow.user_id, presenceRow]));

  return relations
    .map((relationRow) => {
      const friendId =
        relationRow.requester_user_id === currentUserId
          ? relationRow.addressee_user_id
          : relationRow.requester_user_id;

      const profile = profileMap.get(friendId);
      const presence = presenceByUserId.get(friendId);
      const isAccepted = relationRow.status === "accepted";
      const isActive = isAccepted && presence?.status === "studying";

      return {
        id: friendId,
        name: profile?.full_name ?? "New friend",
        username: profile?.username ?? null,
        status: isAccepted ? (isActive ? "active" : "inactive") : "pending",
        activity: isAccepted
          ? isActive
            ? `Studying ${presence?.subject ?? "now"}`
            : "Offline"
          : "Pending friend request",
        image: profile?.avatar_url ?? buildAvatarForFriend(friendId),
      } satisfies FriendViewModel;
    })
    .sort((leftFriend, rightFriend) => {
      const rank = (status: FriendViewModel["status"]) =>
        status === "active" ? 0 : status === "pending" ? 1 : 2;
      const statusDelta = rank(leftFriend.status) - rank(rightFriend.status);
      if (statusDelta !== 0) {
        return statusDelta;
      }
      return leftFriend.name.localeCompare(rightFriend.name);
    });
}

/**
 * Loads authenticated user's friends and pending requests from Supabase.
 */
export async function fetchFriendsForUser(
  supabase: SupabaseClient,
  userId: string
): Promise<FriendViewModel[]> {
  const relationResult = await supabase
    .from("friend_relations")
    .select("requester_user_id,addressee_user_id,status")
    .or(`requester_user_id.eq.${userId},addressee_user_id.eq.${userId}`)
    .returns<FriendRelationRow[]>();

  if (relationResult.error) {
    throw relationResult.error;
  }

  const relationRows = relationResult.data ?? [];
  if (relationRows.length === 0) {
    return [];
  }

  const friendIds = [
    ...new Set(
      relationRows.map((relationRow) =>
        relationRow.requester_user_id === userId
          ? relationRow.addressee_user_id
          : relationRow.requester_user_id
      )
    ),
  ];

  const profileResult = await supabase
    .from("profiles")
    .select("id,full_name,username,avatar_url")
    .in("id", friendIds)
    .returns<FriendProfileRow[]>();
  if (profileResult.error) {
    throw profileResult.error;
  }

  const acceptedFriendIds = relationRows
    .filter((relationRow) => relationRow.status === "accepted")
    .map((relationRow) =>
      relationRow.requester_user_id === userId
        ? relationRow.addressee_user_id
        : relationRow.requester_user_id
    );

  let presenceRows: FriendPresenceRow[] = [];
  if (acceptedFriendIds.length > 0) {
    const presenceResult = await supabase
      .from("user_presence")
      .select("user_id,status,subject")
      .in("user_id", acceptedFriendIds)
      .returns<FriendPresenceRow[]>();
    if (presenceResult.error) {
      throw presenceResult.error;
    }
    presenceRows = presenceResult.data ?? [];
  }

  return mapFriendRowsToCards(userId, relationRows, profileResult.data ?? [], presenceRows);
}

/**
 * Searches discoverable profiles by exact username, excluding the current user.
 */
export async function searchProfilesByUsername(
  supabase: SupabaseClient,
  currentUserId: string,
  usernameQuery: string
): Promise<FriendSearchResult[]> {
  const normalizedUsername = normalizeFriendUsernameQuery(usernameQuery);
  if (normalizedUsername.length < 3) {
    return [];
  }

  const profileResult = await supabase
    .from("profiles")
    .select("id,full_name,username,avatar_url")
    .eq("username", normalizedUsername)
    .neq("id", currentUserId)
    .returns<FriendProfileRow[]>();

  if (profileResult.error) {
    throw profileResult.error;
  }

  return (profileResult.data ?? [])
    .filter((profileRow): profileRow is FriendProfileRow & { username: string } => Boolean(profileRow.username))
    .map((profileRow) => ({
      id: profileRow.id,
      fullName: profileRow.full_name,
      username: profileRow.username,
      image: profileRow.avatar_url ?? buildAvatarForFriend(profileRow.id),
    }));
}

/**
 * Creates a pending friend request if no relationship exists between users.
 */
export async function createFriendRequest(
  supabase: SupabaseClient,
  requesterUserId: string,
  addresseeUserId: string
): Promise<void> {
  if (requesterUserId === addresseeUserId) {
    throw new Error("You cannot add yourself as a friend.");
  }

  const existingRelationResult = await supabase
    .from("friend_relations")
    .select("requester_user_id,addressee_user_id,status")
    .or(
      `and(requester_user_id.eq.${requesterUserId},addressee_user_id.eq.${addresseeUserId}),and(requester_user_id.eq.${addresseeUserId},addressee_user_id.eq.${requesterUserId})`
    )
    .maybeSingle<FriendRelationRow>();

  if (existingRelationResult.error) {
    throw existingRelationResult.error;
  }

  if (existingRelationResult.data) {
    if (existingRelationResult.data.status === "accepted") {
      throw new Error("You are already friends.");
    }
    if (existingRelationResult.data.status === "pending") {
      throw new Error("A friend request is already pending.");
    }
    throw new Error("This user cannot be added right now.");
  }

  const insertResult = await supabase.from("friend_relations").insert({
    requester_user_id: requesterUserId,
    addressee_user_id: addresseeUserId,
    status: "pending",
  });

  if (insertResult.error) {
    throw insertResult.error;
  }
}
