import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";
import { resolveSignupResolution, type SignupResolution } from "@/lib/auth/signup-outcome";
import { buildProfileBootstrapErrorMessage } from "@/lib/auth/auth-error";
import { deriveFullName, ensureProfileForUser, getOwnProfile, type ProfileRecord } from "@/lib/profile/profile-service";

export interface SignupRequest {
  email: string;
  password: string;
  fullName: string;
}

export interface AuthContextValue {
  currentUser: User | null;
  currentSession: Session | null;
  currentProfile: ProfileRecord | null;
  loading: boolean;
  authError: string | null;
  signupWithEmail: (request: SignupRequest) => Promise<SignupResolution>;
  signinWithEmail: (email: string, password: string) => Promise<boolean>;
  signout: () => Promise<void>;
  refreshCurrentProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Provides Supabase-native auth state and auth actions to the UI tree.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [currentProfile, setCurrentProfile] = useState<ProfileRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  /**
   * Loads and stores the authenticated user's profile for global UI usage.
   */
  async function loadCurrentProfileForUser(userId: string): Promise<void> {
    if (!isSupabaseConfigured()) {
      setCurrentProfile(null);
      return;
    }
    const supabase = getSupabaseClient();
    const profileRecord = await getOwnProfile(supabase, userId);
    setCurrentProfile(profileRecord);
  }

  /**
   * Refreshes the active user's profile snapshot in auth context.
   */
  async function refreshCurrentProfile(): Promise<void> {
    if (!currentUser) {
      setCurrentProfile(null);
      return;
    }
    await loadCurrentProfileForUser(currentUser.id);
  }

  /**
   * Ensures profile bootstrap for an authenticated user.
   */
  async function bootstrapProfileForUser(user: User): Promise<void> {
    const supabase = getSupabaseClient();
    await ensureProfileForUser(supabase, {
      userId: user.id,
      email: user.email ?? null,
      fullName: deriveFullName(user),
    });
  }

  /**
   * Logs profile bootstrap details and sets an actionable auth error message.
   */
  function handleProfileBootstrapError(error: unknown): void {
    console.error("Profile bootstrap failed", error);
    setAuthError(buildProfileBootstrapErrorMessage(error));
  }

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    const supabase = getSupabaseClient();
    void supabase.auth.getSession().then(({ data, error }) => {
      if (error) {
        setAuthError(error.message);
      } else {
        setCurrentSession(data.session ?? null);
        setCurrentUser(data.session?.user ?? null);
        if (data.session?.user) {
          void loadCurrentProfileForUser(data.session.user.id).catch((profileError: unknown) => {
            handleProfileBootstrapError(profileError);
          });
        } else {
          setCurrentProfile(null);
        }
      }
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setCurrentSession(session ?? null);
      setCurrentUser(session?.user ?? null);
      if (event === "SIGNED_IN" && session?.user) {
        void bootstrapProfileForUser(session.user).catch((error: unknown) => {
          handleProfileBootstrapError(error);
        });
        void loadCurrentProfileForUser(session.user.id).catch((profileError: unknown) => {
          handleProfileBootstrapError(profileError);
        });
      } else if (!session?.user) {
        setCurrentProfile(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  /**
   * Creates a new Supabase account with email/password and profile metadata.
   */
  async function signupWithEmail(request: SignupRequest): Promise<SignupResolution> {
    if (!isSupabaseConfigured()) {
      setAuthError("Supabase is not configured. Configure env vars to enable signup.");
      return {
        isSuccess: false,
        isAuthenticated: false,
        requiresEmailConfirmation: false,
      };
    }

    const supabase = getSupabaseClient();
    const signupResult = await supabase.auth.signUp({
      email: request.email,
      password: request.password,
      options: {
        data: {
          full_name: request.fullName,
        },
      },
    });

    if (signupResult.error) {
      setAuthError(signupResult.error.message);
      return {
        isSuccess: false,
        isAuthenticated: false,
        requiresEmailConfirmation: false,
      };
    }

    const initialResolution = resolveSignupResolution(signupResult);
    if (initialResolution.isAuthenticated && signupResult.data.user) {
      try {
        await bootstrapProfileForUser(signupResult.data.user);
      } catch (error) {
        handleProfileBootstrapError(error);
        return {
          isSuccess: false,
          isAuthenticated: false,
          requiresEmailConfirmation: false,
        };
      }
      setAuthError(null);
      return initialResolution;
    }

    if (initialResolution.requiresEmailConfirmation) {
      const autoSigninResult = await supabase.auth.signInWithPassword({
        email: request.email,
        password: request.password,
      });

      if (!autoSigninResult.error && autoSigninResult.data.user) {
        try {
          await bootstrapProfileForUser(autoSigninResult.data.user);
        } catch (error) {
          handleProfileBootstrapError(error);
          return {
            isSuccess: false,
            isAuthenticated: false,
            requiresEmailConfirmation: false,
          };
        }
        setAuthError(null);
        return {
          isSuccess: true,
          isAuthenticated: true,
          requiresEmailConfirmation: false,
        };
      }

      const normalizedSigninError = autoSigninResult.error?.message.toLowerCase() ?? "";
      if (
        normalizedSigninError.includes("email not confirmed") ||
        normalizedSigninError.includes("email not confirmed yet")
      ) {
        setAuthError(null);
        return initialResolution;
      }

      if (autoSigninResult.error) {
        setAuthError(autoSigninResult.error.message);
      }
      return {
        isSuccess: false,
        isAuthenticated: false,
        requiresEmailConfirmation: false,
      };
    }

    setAuthError(null);
    return initialResolution;
  }

  /**
   * Signs in an existing user with email/password credentials.
   */
  async function signinWithEmail(email: string, password: string): Promise<boolean> {
    if (!isSupabaseConfigured()) {
      setAuthError("Supabase is not configured. Configure env vars to enable sign in.");
      return false;
    }

    const supabase = getSupabaseClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setAuthError(error.message);
      return false;
    }

    if (data.user) {
      try {
        await bootstrapProfileForUser(data.user);
      } catch (error) {
        handleProfileBootstrapError(error);
        return false;
      }
    }
    setAuthError(null);
    return true;
  }

  /**
   * Signs the current user out of the active Supabase session.
   */
  async function signout(): Promise<void> {
    if (!isSupabaseConfigured()) {
      return;
    }
    const supabase = getSupabaseClient();
    const { error } = await supabase.auth.signOut();
    if (error) {
      setAuthError(error.message);
      return;
    }
    setAuthError(null);
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      currentUser,
      currentSession,
      currentProfile,
      loading,
      authError,
      signupWithEmail,
      signinWithEmail,
      signout,
      refreshCurrentProfile,
    }),
    [currentUser, currentSession, currentProfile, loading, authError]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Returns app auth state and actions for Supabase-native authentication flows.
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
