import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "@/contexts/auth-context";
import { validateSigninForm, type SigninFormValues } from "@/lib/auth/signin-validation";
import { isSupabaseConfigured } from "@/lib/supabase";

const INITIAL_SIGNIN_VALUES: SigninFormValues = {
  email: "",
  password: "",
};

/**
 * Supabase-native sign-in page with client-side validation and friendly feedback.
 */
export default function SigninPage() {
  const navigate = useNavigate();
  const { signinWithEmail, authError } = useAuth();
  const [formValues, setFormValues] = useState<SigninFormValues>(INITIAL_SIGNIN_VALUES);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof SigninFormValues, string>>>(
    {}
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  /**
   * Updates one sign-in field in component state.
   */
  function updateField<FieldKey extends keyof SigninFormValues>(
    fieldKey: FieldKey,
    fieldValue: SigninFormValues[FieldKey]
  ): void {
    setFormValues((previousValues) => ({
      ...previousValues,
      [fieldKey]: fieldValue,
    }));
  }

  /**
   * Validates and submits sign-in credentials to Supabase Auth.
   */
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setStatusMessage(null);

    const validationResult = validateSigninForm(formValues);
    setFormErrors(validationResult.errors);
    if (!validationResult.isValid) {
      return;
    }

    try {
      setIsSubmitting(true);
      const wasSuccessful = await signinWithEmail(formValues.email.trim(), formValues.password);
      if (!wasSuccessful) {
        return;
      }

      setStatusMessage("Signed in successfully.");
      setTimeout(() => navigate("/"), 600);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto py-8">
      <div className="bg-white/85 backdrop-blur-md rounded-[2rem] p-8 border-2 border-white/90 shadow-xl">
        <h1 className="text-3xl font-black text-[#22223B]">Welcome back</h1>
        <p className="text-[#22223B]/65 mt-2 font-medium">
          Sign in to sync sessions, streaks, and social activity.
        </p>

        {!isSupabaseConfigured() ? (
          <p className="mt-4 text-sm font-semibold text-amber-700 bg-amber-100 border border-amber-300 rounded-xl p-3">
            Supabase is not configured. Add environment variables to enable sign in.
          </p>
        ) : null}

        <form className="mt-6 space-y-4" onSubmit={(event) => void handleSubmit(event)}>
          <div>
            <label className="block text-sm font-bold text-[#22223B]/80">Email</label>
            <input
              type="email"
              value={formValues.email}
              onChange={(event) => updateField("email", event.target.value)}
              className="mt-1 w-full rounded-xl border border-[#508CA4]/30 bg-white px-3 py-2 font-medium text-[#22223B] focus:outline-none focus:border-[#508CA4]"
              placeholder="you@example.com"
            />
            {formErrors.email ? (
              <p className="text-xs text-rose-600 mt-1 font-semibold">{formErrors.email}</p>
            ) : null}
          </div>

          <div>
            <label className="block text-sm font-bold text-[#22223B]/80">Password</label>
            <input
              type="password"
              value={formValues.password}
              onChange={(event) => updateField("password", event.target.value)}
              className="mt-1 w-full rounded-xl border border-[#508CA4]/30 bg-white px-3 py-2 font-medium text-[#22223B] focus:outline-none focus:border-[#508CA4]"
              placeholder="Your password"
            />
            {formErrors.password ? (
              <p className="text-xs text-rose-600 mt-1 font-semibold">{formErrors.password}</p>
            ) : null}
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !isSupabaseConfigured()}
            className="w-full rounded-xl bg-gradient-to-r from-[#508CA4] to-[#5ea4bf] py-3 text-white font-bold shadow-lg disabled:opacity-60"
          >
            {isSubmitting ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {authError ? <p className="mt-3 text-sm font-semibold text-rose-700">{authError}</p> : null}
        {statusMessage ? (
          <p className="mt-3 text-sm font-semibold text-emerald-700">{statusMessage}</p>
        ) : null}

        <p className="mt-5 text-sm text-[#22223B]/70">
          New here?{" "}
          <Link to="/signup" className="font-bold text-[#508CA4]">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
