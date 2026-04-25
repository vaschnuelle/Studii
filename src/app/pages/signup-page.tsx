import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "@/contexts/auth-context";
import {
  validateSignupForm,
  type SignupFormValues,
} from "@/lib/auth/signup-validation";
import { isSupabaseConfigured } from "@/lib/supabase";

const INITIAL_SIGNUP_VALUES: SignupFormValues = {
  fullName: "",
  email: "",
  password: "",
  confirmPassword: "",
};

/**
 * Supabase-native signup page with client-side validation and clear error messages.
 */
export default function SignupPage() {
  const navigate = useNavigate();
  const { signupWithEmail, authError } = useAuth();
  const [formValues, setFormValues] = useState<SignupFormValues>(INITIAL_SIGNUP_VALUES);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof SignupFormValues, string>>>(
    {}
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  /**
   * Updates a single form field value in local state.
   */
  function updateField<ValueKey extends keyof SignupFormValues>(
    fieldKey: ValueKey,
    fieldValue: SignupFormValues[ValueKey]
  ): void {
    setFormValues((previousValues) => ({
      ...previousValues,
      [fieldKey]: fieldValue,
    }));
  }

  /**
   * Validates and submits signup details to Supabase Auth.
   */
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setStatusMessage(null);

    const validationResult = validateSignupForm(formValues);
    setFormErrors(validationResult.errors);
    if (!validationResult.isValid) {
      return;
    }

    try {
      setIsSubmitting(true);
      const wasSuccessful = await signupWithEmail({
        fullName: formValues.fullName.trim(),
        email: formValues.email.trim(),
        password: formValues.password,
      });

      if (!wasSuccessful) {
        return;
      }

      setStatusMessage(
        "Signup successful. Check your email to confirm your account, then sign in."
      );
      setTimeout(() => navigate("/"), 1200);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto py-8">
      <div className="bg-white/85 backdrop-blur-md rounded-[2rem] p-8 border-2 border-white/90 shadow-xl">
        <h1 className="text-3xl font-black text-[#22223B]">Create your Studii account</h1>
        <p className="text-[#22223B]/65 mt-2 font-medium">
          Join your friends, track streaks, and start sessions instantly.
        </p>

        {!isSupabaseConfigured() ? (
          <p className="mt-4 text-sm font-semibold text-amber-700 bg-amber-100 border border-amber-300 rounded-xl p-3">
            Supabase is not configured. Add environment variables to enable signup.
          </p>
        ) : null}

        <form className="mt-6 space-y-4" onSubmit={(event) => void handleSubmit(event)}>
          <div>
            <label className="block text-sm font-bold text-[#22223B]/80">Full Name</label>
            <input
              value={formValues.fullName}
              onChange={(event) => updateField("fullName", event.target.value)}
              className="mt-1 w-full rounded-xl border border-[#508CA4]/30 bg-white px-3 py-2 font-medium text-[#22223B] focus:outline-none focus:border-[#508CA4]"
              placeholder="Veronica Wong"
            />
            {formErrors.fullName ? (
              <p className="text-xs text-rose-600 mt-1 font-semibold">{formErrors.fullName}</p>
            ) : null}
          </div>

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
              placeholder="Minimum 8 characters"
            />
            {formErrors.password ? (
              <p className="text-xs text-rose-600 mt-1 font-semibold">{formErrors.password}</p>
            ) : null}
          </div>

          <div>
            <label className="block text-sm font-bold text-[#22223B]/80">Confirm Password</label>
            <input
              type="password"
              value={formValues.confirmPassword}
              onChange={(event) => updateField("confirmPassword", event.target.value)}
              className="mt-1 w-full rounded-xl border border-[#508CA4]/30 bg-white px-3 py-2 font-medium text-[#22223B] focus:outline-none focus:border-[#508CA4]"
              placeholder="Re-enter your password"
            />
            {formErrors.confirmPassword ? (
              <p className="text-xs text-rose-600 mt-1 font-semibold">
                {formErrors.confirmPassword}
              </p>
            ) : null}
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !isSupabaseConfigured()}
            className="w-full rounded-xl bg-gradient-to-r from-[#508CA4] to-[#5ea4bf] py-3 text-white font-bold shadow-lg disabled:opacity-60"
          >
            {isSubmitting ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        {authError ? <p className="mt-3 text-sm font-semibold text-rose-700">{authError}</p> : null}
        {statusMessage ? (
          <p className="mt-3 text-sm font-semibold text-emerald-700">{statusMessage}</p>
        ) : null}

        <p className="mt-5 text-sm text-[#22223B]/70">
          Already have an account?{" "}
          <Link to="/signin" className="font-bold text-[#508CA4]">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
