/**
 * Error-description helpers for auth-related flows.
 *
 * Each function maps a backend error object (with `.status` and `.message`)
 * to a user-facing string.  Keeps error-text logic out of components so
 * every page describes the same HTTP status the same way.
 */

/**
 * Login endpoint errors (POST /auth/login).
 */
export function describeLoginError(error) {
  if (error?.status === 0) {
    return "We couldn't reach the server. Check your connection and try again.";
  }
  if (error?.status === 401) {
    return "Incorrect email or password.";
  }
  if (error?.status >= 500) {
    return "The server is having trouble right now. Please try again in a moment.";
  }
  return error?.message || "Sign-in failed. Please try again.";
}

/**
 * 2FA verification during login (POST /auth/2fa/verify).
 */
export function describeTwoFactorError(error) {
  if (error?.status === 0) {
    return "We couldn't reach the server. Check your connection and try again.";
  }
  if (error?.status === 401) {
    return "Incorrect or expired verification code.";
  }
  return error?.message || "Verification failed. Please try again.";
}

/**
 * 2FA enable after enrollment (POST /auth/2fa/enable).
 */
export function describeTwoFactorEnableError(error) {
  if (error?.status === 0) {
    return "We couldn't reach the server. Check your connection and try again.";
  }
  if (error?.status === 400) {
    return "Incorrect code. Make sure your device clock is accurate.";
  }
  return error?.message || "Could not enable 2FA. Please try again.";
}

/**
 * 2FA disable (POST /auth/2fa/disable).
 */
export function describeTwoFactorDisableError(error) {
  if (error?.status === 0) {
    return "We couldn't reach the server. Check your connection and try again.";
  }
  if (error?.status === 401) {
    return "Incorrect password or verification code.";
  }
  return error?.message || "Could not disable 2FA. Please try again.";
}

export function describeRegisterError(error) {
  if (error?.status === 0) {
    return "We couldn't reach the server. Check your connection and try again.";
  }
  if (error?.status === 409) {
    return "An account with this email already exists.";
  }
  if (error?.status === 400) {
    return error.message || "Please correct the highlighted fields and try again.";
  }
  if (error?.status >= 500) {
    return "The server is having trouble right now. Please try again in a moment.";
  }
  return error?.message || "Sign-up failed. Please try again.";
}
