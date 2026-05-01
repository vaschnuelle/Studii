import type { SupabaseClient, User } from "@supabase/supabase-js";

export interface ProfileRecord {
  id: string;
  full_name: string;
  username: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface EnsureProfileInput {
  userId: string;
  email: string | null;
  fullName: string | null;
}

export interface SaveProfileInput {
  fullName: string;
  username: string | null;
  avatarUrl?: string | null;
}

export interface AvatarValidationResult {
  isValid: boolean;
  errorMessage: string | null;
}

const PROFILE_PICTURES_BUCKET = "profile-pictures";
const ALLOWED_PROFILE_IMAGE_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const MAX_PROFILE_IMAGE_SIZE_BYTES = 3 * 1024 * 1024;

/**
 * Builds a username candidate from full name and email local-part.
 */
export function buildUsernameCandidate(fullName: string | null, email: string | null): string | null {
  const normalizedFromName = (fullName ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

  if (normalizedFromName.length >= 3) {
    return normalizedFromName.slice(0, 32);
  }

  const emailLocalPart = (email ?? "").split("@")[0]?.toLowerCase() ?? "";
  const normalizedFromEmail = emailLocalPart
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

  if (normalizedFromEmail.length >= 3) {
    return normalizedFromEmail.slice(0, 32);
  }

  return null;
}

/**
 * Extracts a full name from auth metadata with robust fallback behavior.
 */
export function deriveFullName(authUser: User): string {
  const metadataName = typeof authUser.user_metadata?.full_name === "string"
    ? authUser.user_metadata.full_name
    : null;
  return (metadataName?.trim() || authUser.email?.split("@")[0]?.trim() || "Studii User").slice(0, 120);
}

/**
 * Normalizes a username according to the database constraint rules.
 */
export function normalizeUsername(username: string | null): string | null {
  if (!username) {
    return null;
  }
  const normalizedUsername = username
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, "_")
    .replace(/^_+|_+$/g, "");
  return normalizedUsername.length > 0 ? normalizedUsername.slice(0, 32) : null;
}

/**
 * Validates profile values against current database-level constraints.
 */
export function validateProfileInput(input: SaveProfileInput): { isValid: boolean; errorMessage: string | null } {
  const normalizedFullName = input.fullName.trim();
  if (normalizedFullName.length < 1 || normalizedFullName.length > 120) {
    return { isValid: false, errorMessage: "Full name must be between 1 and 120 characters." };
  }

  const normalizedUsername = normalizeUsername(input.username);
  if (normalizedUsername && !/^[a-z0-9_]{3,32}$/.test(normalizedUsername)) {
    return {
      isValid: false,
      errorMessage: "Username must be 3-32 chars using lowercase letters, numbers, or underscores.",
    };
  }

  return { isValid: true, errorMessage: null };
}

/**
 * Validates a profile avatar file against type and size restrictions.
 */
export function validateAvatarFile(file: File): AvatarValidationResult {
  if (!ALLOWED_PROFILE_IMAGE_MIME_TYPES.has(file.type)) {
    return {
      isValid: false,
      errorMessage: "Profile picture must be a JPG, PNG, WEBP, or GIF file.",
    };
  }

  if (file.size > MAX_PROFILE_IMAGE_SIZE_BYTES) {
    return {
      isValid: false,
      errorMessage: "Profile picture must be 3MB or smaller.",
    };
  }

  return { isValid: true, errorMessage: null };
}

/**
 * Uploads a profile avatar image and returns the public URL.
 */
export async function uploadProfileAvatar(
  supabase: SupabaseClient,
  userId: string,
  file: File
): Promise<string> {
  const validationResult = validateAvatarFile(file);
  if (!validationResult.isValid) {
    throw new Error(validationResult.errorMessage ?? "Invalid profile picture");
  }

  const fileExtension = file.name.includes(".") ? file.name.split(".").pop()?.toLowerCase() ?? "jpg" : "jpg";
  const avatarPath = `${userId}/${Date.now()}-avatar.${fileExtension}`;
  const uploadResult = await supabase.storage.from(PROFILE_PICTURES_BUCKET).upload(avatarPath, file, {
    upsert: true,
    contentType: file.type,
  });
  if (uploadResult.error) {
    throw new Error(uploadResult.error.message);
  }

  const publicUrlResult = supabase.storage.from(PROFILE_PICTURES_BUCKET).getPublicUrl(avatarPath);
  const publicUrl = publicUrlResult.data.publicUrl;
  if (!publicUrl) {
    throw new Error("Failed to resolve uploaded profile picture URL.");
  }
  return publicUrl;
}

/**
 * Persists profile create/update values for the authenticated user.
 */
export async function saveOwnProfile(
  supabase: SupabaseClient,
  userId: string,
  input: SaveProfileInput
): Promise<ProfileRecord> {
  const validationResult = validateProfileInput(input);
  if (!validationResult.isValid) {
    throw new Error(validationResult.errorMessage ?? "Invalid profile values");
  }

  const { data, error } = await supabase
    .from("profiles")
    .upsert(
      {
        id: userId,
        full_name: input.fullName.trim(),
        username: normalizeUsername(input.username),
        avatar_url: input.avatarUrl ?? null,
      },
      {
        onConflict: "id",
        ignoreDuplicates: false,
      }
    )
    .select("id,full_name,username,avatar_url,created_at,updated_at")
    .single<ProfileRecord>();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

/**
 * Ensures the authenticated user's profile row exists and is up to date.
 * This flow is conflict-safe for username uniqueness and avoids auth-state regressions.
 */
export async function ensureProfileForUser(
  supabase: SupabaseClient,
  input: EnsureProfileInput
): Promise<void> {
  const fallbackFullName = (input.fullName?.trim() || input.email?.split("@")[0] || "Studii User").slice(0, 120);
  const profileResult = await supabase
    .from("profiles")
    .select("id,full_name,username,avatar_url,created_at,updated_at")
    .eq("id", input.userId)
    .maybeSingle<ProfileRecord>();
  if (profileResult.error) {
    throw profileResult.error;
  }

  const existingProfile = profileResult.data;
  if (existingProfile) {
    if (!existingProfile.full_name?.trim()) {
      await saveOwnProfile(supabase, input.userId, {
        fullName: fallbackFullName,
        username: existingProfile.username,
      });
    }
    return;
  }

  const usernameCandidate = buildUsernameCandidate(input.fullName, input.email);
  try {
    await saveOwnProfile(supabase, input.userId, {
      fullName: fallbackFullName,
      username: usernameCandidate,
    });
  } catch (bootstrapError) {
    // Retry without username if the candidate collides globally.
    const maybeMessage =
      bootstrapError instanceof Error
        ? bootstrapError.message.toLowerCase()
        : String(bootstrapError).toLowerCase();
    if (maybeMessage.includes("profiles_username_key")) {
      await saveOwnProfile(supabase, input.userId, {
        fullName: fallbackFullName,
        username: null,
      });
      return;
    }
    throw bootstrapError;
  }
}

/**
 * Reads the authenticated user's profile record.
 */
export async function getOwnProfile(supabase: SupabaseClient, userId: string): Promise<ProfileRecord | null> {
  const result = await supabase
    .from("profiles")
    .select("id,full_name,username,avatar_url,created_at,updated_at")
    .eq("id", userId)
    .maybeSingle<ProfileRecord>();

  if (result.error) {
    throw result.error;
  }

  return result.data ?? null;
}
