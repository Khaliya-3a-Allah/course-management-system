import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { sanitizeInput } from "../utils/validators";
import { apiGet, apiPost, apiPut } from "../utils/api";
import {
  readToken,
  writeToken,
  readUser,
  writeUser,
  clearSession,
} from "../utils/authStorage";

const AuthContext = createContext(null);

export const AUTH_STATUS = {
  IDLE: "idle",
  LOADING: "loading",
  AUTHENTICATED: "authenticated",
  UNAUTHENTICATED: "unauthenticated",
  ERROR: "error",
};

export function normalizeUserCollections(user) {
  if (!user) return user;
  return {
    ...user,
    createdCourseIds: user.createdCourseIds || [],
    enrolledCourseIds: user.enrolledCourseIds || [],
    purchasedCourseIds: user.purchasedCourseIds || [],
    savedCourseIds: user.savedCourseIds || [],
    completedCourseIds: user.completedCourseIds || [],
  };
}

function pickProfileExtras(form) {
  const extras = {};
  if (form.phone) extras.phone = sanitizeInput(form.phone);
  if (form.bio) extras.bio = sanitizeInput(form.bio);
  return extras;
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => normalizeUserCollections(readUser()));
  const [authStatus, setAuthStatus] = useState(
    readToken() ? AUTH_STATUS.LOADING : AUTH_STATUS.UNAUTHENTICATED
  );

  const didRehydrateRef = useRef(false);

  // Rehydrate session from stored token
  useEffect(() => {
    if (didRehydrateRef.current) return;
    didRehydrateRef.current = true;

    const token = readToken();
    if (!token) {
      setAuthStatus(AUTH_STATUS.UNAUTHENTICATED);
      return;
    }

    apiGet("/auth/me", { token })
      .then((response) => {
        const serverUser = response?.data;
        if (!serverUser) {
          throw new Error("Malformed /auth/me response");
        }
        const normalized = normalizeUserCollections(serverUser);
        setCurrentUser(normalized);
        writeUser(normalized);
        setAuthStatus(AUTH_STATUS.AUTHENTICATED);
      })
      .catch((error) => {
        if (error.status === 401) {
          clearSession();
          setCurrentUser(null);
          setAuthStatus(AUTH_STATUS.UNAUTHENTICATED);
          return;
        }
        setAuthStatus(
          currentUser ? AUTH_STATUS.AUTHENTICATED : AUTH_STATUS.UNAUTHENTICATED
        );
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- rehydrate runs once on mount; excluding currentUser avoids infinite re-trigger
  }, []);

  // Persist user to localStorage on changes
  useEffect(() => {
    writeUser(currentUser);
  }, [currentUser]);

  function applyAuthenticatedSession({ token, user }) {
    writeToken(token);
    const normalized = normalizeUserCollections(user);
    writeUser(normalized);
    setCurrentUser(normalized);
    setAuthStatus(AUTH_STATUS.AUTHENTICATED);
  }

  const login = useCallback(async ({ email, password }) => {
    setAuthStatus(AUTH_STATUS.LOADING);
    try {
      const response = await apiPost("/auth/login", { email, password });
      if (response?.emailVerificationRequired) {
        setAuthStatus(AUTH_STATUS.UNAUTHENTICATED);
        return { emailVerificationRequired: true, email: response.email };
      }
      if (response?.twoFactorRequired) {
        setAuthStatus(AUTH_STATUS.UNAUTHENTICATED);
        return {
          twoFactorRequired: true,
          challengeToken: response.challengeToken,
          email,
        };
      }
      applyAuthenticatedSession({
        token: response.token,
        user: response.data,
      });
      return { twoFactorRequired: false, user: response.data };
    } catch (error) {
      setAuthStatus(AUTH_STATUS.ERROR);
      throw error;
    }
  }, []);

  const register = useCallback(async (form) => {
    setAuthStatus(AUTH_STATUS.LOADING);
    try {
      const response = await apiPost("/auth/register", {
        name: sanitizeInput(form.name),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        role: form.role || "student",
      });

      if (response?.emailVerificationRequired) {
        setAuthStatus(AUTH_STATUS.UNAUTHENTICATED);
        return { emailVerificationRequired: true, email: response.email };
      }

      applyAuthenticatedSession({ token: response.token, user: response.data });

      const extras = pickProfileExtras(form);
      if (Object.keys(extras).length > 0) {
        try {
          const updated = await apiPut(`/users/${response.data.id}`, extras, {
            token: response.token,
          });
          const userFromUpdate = updated?.data || updated;
          if (userFromUpdate) {
            const normalized = normalizeUserCollections(userFromUpdate);
            writeUser(normalized);
            setCurrentUser(normalized);
          }
        } catch (profileError) {
          if (import.meta.env.DEV) console.warn("Failed to save profile extras:", profileError);
        }
      }

      return { user: response.data };
    } catch (error) {
      setAuthStatus(AUTH_STATUS.ERROR);
      throw error;
    }
  }, []);

  const verifyEmail = useCallback(async ({ email, code }) => {
    const response = await apiPost("/auth/verify-email", { email, code });
    applyAuthenticatedSession({ token: response.token, user: response.data });
    return { user: response.data };
  }, []);

  const resendVerificationCode = useCallback(async ({ email }) => {
    await apiPost("/auth/resend-verification", { email });
  }, []);

  const requestPasswordReset = useCallback(async ({ email }) => {
    return apiPost("/auth/password/forgot", { email });
  }, []);

  const resetPassword = useCallback(async ({ email, code, password }) => {
    return apiPost("/auth/password/reset", { email, code, password });
  }, []);

  const requestPasswordChange = useCallback(async () => {
    const token = readToken();
    return apiPost("/auth/password/change/request", {}, { token });
  }, []);

  const changePassword = useCallback(async ({ code, password }) => {
    const token = readToken();
    return apiPost("/auth/password/change", { code, password }, { token });
  }, []);

  const completeTwoFactor = useCallback(async ({ challengeToken, code }) => {
    setAuthStatus(AUTH_STATUS.LOADING);
    try {
      const response = await apiPost(
        "/auth/2fa/verify",
        { code },
        { token: challengeToken }
      );
      applyAuthenticatedSession({
        token: response.token,
        user: response.data,
      });
      return { user: response.data };
    } catch (error) {
      setAuthStatus(AUTH_STATUS.UNAUTHENTICATED);
      throw error;
    }
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setCurrentUser(null);
    setAuthStatus(AUTH_STATUS.UNAUTHENTICATED);
  }, []);

  const setupTwoFactor = useCallback(async () => {
    const token = readToken();
    const response = await apiPost("/auth/2fa/setup", {}, { token });
    return response?.data || response;
  }, []);

  const enableTwoFactor = useCallback(async ({ code }) => {
    const token = readToken();
    await apiPost("/auth/2fa/enable", { code }, { token });
    setCurrentUser((prev) =>
      prev ? normalizeUserCollections({ ...prev, twoFactorEnabled: true }) : prev
    );
  }, []);

  const disableTwoFactor = useCallback(async ({ password, code }) => {
    const token = readToken();
    await apiPost("/auth/2fa/disable", { password, code }, { token });
    setCurrentUser((prev) =>
      prev ? normalizeUserCollections({ ...prev, twoFactorEnabled: false }) : prev
    );
  }, []);

  async function updateProfile(fields) {
    if (!currentUser) return;

    const persistableKeys = ["name", "phone", "bio"];
    const clientOnlyKeys = ["expertise", "website", "profileImage"];
    const persistableUpdates = {};
    const clientOnlyUpdates = {};

    persistableKeys.forEach((key) => {
      if (key in fields) persistableUpdates[key] = sanitizeInput(fields[key] || "");
    });
    clientOnlyKeys.forEach((key) => {
      if (!(key in fields)) return;
      if (key === "profileImage") {
        clientOnlyUpdates.profileImage = fields.profileImage || "";
      } else if (key === "website") {
        clientOnlyUpdates.website = fields.website?.trim() || "";
      } else {
        clientOnlyUpdates[key] = sanitizeInput(fields[key] || "");
      }
    });

    let serverUser = currentUser;
    if (Object.keys(persistableUpdates).length > 0) {
      const token = readToken();
      const response = await apiPut(
        `/users/${currentUser.id}`,
        persistableUpdates,
        { token }
      );
      serverUser = response?.data || response || currentUser;
    }

    const merged = normalizeUserCollections({
      ...currentUser,
      ...serverUser,
      ...clientOnlyUpdates,
    });
    setCurrentUser(merged);
  }

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        authStatus,
        login,
        register,
        logout,
        completeTwoFactor,
        setupTwoFactor,
        enableTwoFactor,
        disableTwoFactor,
        updateProfile,
        verifyEmail,
        resendVerificationCode,
        requestPasswordReset,
        resetPassword,
        requestPasswordChange,
        changePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used inside <AuthProvider>");
  return ctx;
}
