import type { AuthResponse } from "@supabase/supabase-js";

export interface SignupResolution {
  isSuccess: boolean;
  isAuthenticated: boolean;
  requiresEmailConfirmation: boolean;
}

/**
 * Resolves a Supabase signup response into explicit UI-safe auth states.
 */
export function resolveSignupResolution(signupResponse: AuthResponse): SignupResolution {
  const hasSession = Boolean(signupResponse.data.session);
  const hasUser = Boolean(signupResponse.data.user);

  if (hasSession) {
    return {
      isSuccess: true,
      isAuthenticated: true,
      requiresEmailConfirmation: false,
    };
  }

  if (hasUser) {
    return {
      isSuccess: true,
      isAuthenticated: false,
      requiresEmailConfirmation: true,
    };
  }

  return {
    isSuccess: false,
    isAuthenticated: false,
    requiresEmailConfirmation: false,
  };
}
