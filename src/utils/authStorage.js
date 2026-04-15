const TOKEN_KEY = "courseApp_token";
const USER_KEY = "courseApp_currentUser";

function safeGetItem(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSetItem(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Storage full or unavailable — the app keeps working in-memory
  }
}

function safeRemoveItem(key) {
  try {
    localStorage.removeItem(key);
  } catch {
    // Ignore — same rationale as safeSetItem
  }
}

export function readToken() {
  return safeGetItem(TOKEN_KEY);
}

export function writeToken(token) {
  if (!token) {
    safeRemoveItem(TOKEN_KEY);
    return;
  }
  safeSetItem(TOKEN_KEY, token);
}

export function clearToken() {
  safeRemoveItem(TOKEN_KEY);
}

export function readUser() {
  const stored = safeGetItem(USER_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    safeRemoveItem(USER_KEY);
    return null;
  }
}

export function writeUser(user) {
  if (!user) {
    safeRemoveItem(USER_KEY);
    return;
  }
  // Defensively strip any password field the server might have included
  const { password, ...safeUser } = user;
  void password;
  safeSetItem(USER_KEY, JSON.stringify(safeUser));
}

export function clearUser() {
  safeRemoveItem(USER_KEY);
}

export function clearSession() {
  clearToken();
  clearUser();
}
