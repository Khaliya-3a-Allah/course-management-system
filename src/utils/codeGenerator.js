/**
 * Generates a random 6-digit verification code, zero-padded.
 *
 * NOTE: Uses Math.random() which is NOT cryptographically secure.
 * In production (Phase 2+), codes must be generated server-side
 * using crypto.getRandomValues() or equivalent.
 *
 * @returns {string} A string of exactly 6 digits (e.g., "007293")
 */
export function generateVerificationCode() {
  return String(Math.floor(Math.random() * 1000000)).padStart(6, "0");
}
