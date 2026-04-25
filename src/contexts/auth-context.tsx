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

export interface SignupRequest {
  email: string;
  password: string;
  fullName: string;
}

export interface AuthContextValue {
  currentUser: User | null;
  currentSession: Session | null;
  loading: boolean;
  authError: string | null;
  signupWithEmail: (request: SignupRequest) => Promise<boolean>;
  signinWithEmail: (email: string, password: string) => Promise<boolean>;
  signout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Provides Supabase-native auth state and auth actions to the UI tree.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

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
      }
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentSession(session ?? null);
      setCurrentUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  /**
   * Creates a new Supabase account with email/password and profile metadata.
   */
  async function signupWithEmail(request: SignupRequest): Promise<boolean> {
    if (!isSupabaseConfigured()) {
      setAuthError("Supabase is not configured. Configure env vars to enable signup.");
      return false;
    }

    const supabase = getSupabaseClient();
    const { error } = await supabase.auth.signUp({
      email: request.email,
      password: request.password,
      options: {
        data: {
          full_name: request.fullName,
        },
      },
    });

    if (error) {
      setAuthError(error.message);
      return false;
    }

    setAuthError(null);
    return true;
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
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setAuthError(error.message);
      return false;
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
      loading,
      authError,
      signupWithEmail,
      signinWithEmail,
      signout,
    }),
    [currentUser, currentSession, loading, authError]
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
