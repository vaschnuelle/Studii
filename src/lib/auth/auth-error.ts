/**
 * Builds a user-facing error for profile bootstrap failures while preserving detailed logs.
 */
export function buildProfileBootstrapErrorMessage(error: unknown): string {
  const rawMessage = error instanceof Error ? error.message : String(error);
  const normalizedMessage = rawMessage.toLowerCase();

  if (normalizedMessage.includes("profiles") && normalizedMessage.includes("does not exist")) {
    return "Profile setup is unavailable because the latest database migration has not been applied.";
  }

  if (normalizedMessage.includes("row-level security")) {
    return "Profile setup is blocked by database permissions. Please verify profile RLS policies.";
  }

  if (normalizedMessage.includes("profiles_username_key")) {
    return "Profile username is already taken. Open your profile to choose another username.";
  }

  return "Profile setup failed. Please open your profile and try saving it again.";
}

/**
 * Resolves unknown thrown values into a readable error message.
 */
export function getReadableErrorMessage(error: unknown, fallbackMessage: string): string {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  if (typeof error === "object" && error !== null && "message" in error) {
    const candidateMessage = (error as { message?: unknown }).message;
    if (typeof candidateMessage === "string" && candidateMessage.trim().length > 0) {
      return candidateMessage;
    }
  }

  return fallbackMessage;
}
