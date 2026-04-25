export interface SigninFormValues {
  email: string;
  password: string;
}

export interface SigninValidationResult {
  isValid: boolean;
  errors: Partial<Record<keyof SigninFormValues, string>>;
}

/**
 * Validates sign-in fields before calling Supabase Auth.
 */
export function validateSigninForm(values: SigninFormValues): SigninValidationResult {
  const errors: Partial<Record<keyof SigninFormValues, string>> = {};

  if (!values.email.trim()) {
    errors.email = "Please enter your email address.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    errors.email = "Please enter a valid email address.";
  }

  if (!values.password) {
    errors.password = "Please enter your password.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
