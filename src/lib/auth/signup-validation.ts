export interface SignupFormValues {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface SignupValidationResult {
  isValid: boolean;
  errors: Partial<Record<keyof SignupFormValues, string>>;
}

const MINIMUM_PASSWORD_LENGTH = 8;

/**
 * Validates signup form fields before calling Supabase Auth.
 */
export function validateSignupForm(values: SignupFormValues): SignupValidationResult {
  const errors: Partial<Record<keyof SignupFormValues, string>> = {};

  if (!values.fullName.trim()) {
    errors.fullName = "Please enter your full name.";
  }

  if (!values.email.trim()) {
    errors.email = "Please enter your email address.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    errors.email = "Please enter a valid email address.";
  }

  if (!values.password) {
    errors.password = "Please enter a password.";
  } else if (values.password.length < MINIMUM_PASSWORD_LENGTH) {
    errors.password = `Password must be at least ${MINIMUM_PASSWORD_LENGTH} characters.`;
  }

  if (!values.confirmPassword) {
    errors.confirmPassword = "Please confirm your password.";
  } else if (values.confirmPassword !== values.password) {
    errors.confirmPassword = "Passwords do not match.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
