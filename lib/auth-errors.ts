export type AuthError = {
  code: string;
  message: string;
};

export const authErrors: Record<string, AuthError> = {
  InvalidCredentials: {
    code: "auth/invalid-credentials",
    message: "Invalid email or password",
  },
  UserExists: {
    code: "auth/user-exists",
    message: "An account with this email already exists",
  },
  WeakPassword: {
    code: "auth/weak-password",
    message: "Password should be at least 8 characters long",
  },
  InvalidEmail: {
    code: "auth/invalid-email",
    message: "Please enter a valid email address",
  },
  UserNotFound: {
    code: "auth/user-not-found",
    message: "No account found with this email",
  },
  Unauthorized: {
    code: "auth/unauthorized",
    message: "You must be signed in to access this page",
  },
  OAuthAccountNotLinked: {
    code: "auth/oauth-account-not-linked",
    message: "This account is already linked to a different provider",
  },
  SessionRequired: {
    code: "auth/session-required",
    message: "Please sign in to continue",
  },
  DatabaseError: {
    code: "auth/database-error",
    message: "An error occurred while accessing the database",
  },
  Default: {
    code: "auth/unknown",
    message: "An unexpected error occurred. Please try again",
  },
};

export function getAuthError(error: unknown): AuthError {
  if (error instanceof Error) {
    // Try to match the error message with known errors
    const knownError = Object.values(authErrors).find((authError) =>
      error.message.includes(authError.code)
    );
    return knownError || authErrors.Default;
  }
  return authErrors.Default;
}

export function isAuthError(error: unknown): error is AuthError {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    "message" in error
  );
}

export function formatAuthError(error: unknown): string {
  if (isAuthError(error)) {
    return error.message;
  }
  return getAuthError(error).message;
}
