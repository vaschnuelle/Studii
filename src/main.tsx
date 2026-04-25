import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import "./styles/index.css";
import { StudiiDataProvider } from "./contexts/studii-data-context";
import { AuthProvider, useAuth } from "./contexts/auth-context";
import { getSupabaseClient, isSupabaseConfigured } from "./lib/supabase";

/**
 * Binds Supabase auth user state to the Studii data provider.
 */
function RootApp() {
  const { currentUser } = useAuth();
  const [supabaseUserId, setSupabaseUserId] = useState<string | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setSupabaseUserId(null);
      return;
    }

    const supabase = getSupabaseClient();
    void supabase.auth.getUser().then(({ data, error }) => {
      if (!error) {
        setSupabaseUserId(data.user?.id ?? null);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSupabaseUserId(session?.user?.id ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    setSupabaseUserId(currentUser?.id ?? null);
  }, [currentUser?.id]);

  return <StudiiDataProvider supabaseUserId={supabaseUserId}><App /></StudiiDataProvider>;
}

createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <RootApp />
  </AuthProvider>
);
