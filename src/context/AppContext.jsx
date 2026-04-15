<<<<<<< Updated upstream
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { mockCourses } from "../data/mockCourses";
import { mockUsers } from "../data/mockUsers";

const AppContext = createContext(null);

const STORAGE_KEY = "courseApp_currentUser";

function loadUserFromStorage() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    return JSON.parse(stored);
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

function saveUserToStorage(user) {
  try {
    if (user) {
      const { password, ...safeUser } = user;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(safeUser));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // Storage full or unavailable — continue without persistence
  }
}

export function AppProvider({ children }) {
  const [courses, setCourses] = useState(mockCourses);
  const [users, setUsers] = useState(mockUsers);
  const [currentUser, setCurrentUser] = useState(loadUserFromStorage);
  // courseId -> { lessonId: true }
  const [lessonProgress, setLessonProgress] = useState({});
  // set of completed courseIds
=======
import { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from "react";
import { sanitizeInput } from "../utils/validators";
import { apiGet, apiPost, apiPut, apiDelete } from "../utils/api";
import { RESOURCE_STATUS } from "../utils/status";
import {
  readToken,
  writeToken,
  readUser,
  writeUser,
  clearSession,
} from "../utils/authStorage";

const AppContext = createContext(null);

const THEME_KEY = "courseApp_theme";

const AUTH_STATUS = {
  IDLE: "idle",
  LOADING: "loading",
  AUTHENTICATED: "authenticated",
  UNAUTHENTICATED: "unauthenticated",
  ERROR: "error",
};

// Maps the backend course shape (instructor, instructorId) onto the
// frontend-facing shape (instructorName) while leaving unknown fields intact.
// Accepts both wrapped ({ data: {...} }) and bare server payloads.
function normalizeCourse(raw) {
  if (!raw) return raw;
  const course = raw.data && raw.id === undefined ? raw.data : raw;
  return {
    ...course,
    id: course.id || course._id,
    instructorName: course.instructorName || course.instructor || "",
    tags: Array.isArray(course.tags) ? course.tags : [],
    price: Number(course.price || 0),
    rating: Number(course.rating || 0),
  };
}

function extractList(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  return [];
}

function normalizeUserCollections(user) {
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

function loadThemeFromStorage() {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === "light" || stored === "dark") return stored;
  } catch {
    // Fall through to system preference
  }

  if (typeof window !== "undefined" && window.matchMedia?.("(prefers-color-scheme: light)").matches) {
    return "light";
  }

  return "dark";
}

function pickProfileExtras(form) {
  const extras = {};
  if (form.phone) extras.phone = sanitizeInput(form.phone);
  if (form.bio) extras.bio = sanitizeInput(form.bio);
  return extras;
}

export function AppProvider({ children }) {
  const [courses, setCourses] = useState([]);
  const [coursesStatus, setCoursesStatus] = useState(RESOURCE_STATUS.IDLE);
  const [coursesError, setCoursesError] = useState(null);
  // The `users` array is a legacy surface from the Phase 1 mock. The backend
  // never returns a full user list; keep as an empty array so older consumers
  // don't crash until slice 5 removes them.
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(() => normalizeUserCollections(readUser()));
  const [authStatus, setAuthStatus] = useState(
    readToken() ? AUTH_STATUS.LOADING : AUTH_STATUS.UNAUTHENTICATED
  );

  // Per-user resource arrays, hydrated from the API once the user is authenticated.
  // The legacy `currentUser.*Ids` mirrors are kept in sync on each write so pages
  // that still read those arrays keep working without changes.
  const [enrollments, setEnrollments] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [progress, setProgress] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [myDataStatus, setMyDataStatus] = useState(RESOURCE_STATUS.IDLE);
  const [myDataError, setMyDataError] = useState(null);

>>>>>>> Stashed changes
  const [completedCourses, setCompletedCourses] = useState(new Set());
  const [toasts, setToasts] = useState([]);
<<<<<<< Updated upstream
=======
  const [theme, setTheme] = useState(loadThemeFromStorage);
  // True when the backend (free-tier Render) is cold-starting — surfaced as
  // a thin banner so users don't think the app is broken during the ~30 s
  // wake-up window on the first request after idle.
  const [isBackendWaking, setIsBackendWaking] = useState(false);

  const didRehydrateRef = useRef(false);
  const didFetchCoursesRef = useRef(false);

  // On mount, if we have a token, verify it against the server.
  // Network failures are treated as "still authenticated with the cached user"
  // so the app remains usable offline — but a 401 forces a clean logout.
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
        // Network or 5xx — keep the cached user but flag the auth status
        // so the UI can optionally show a reconnection hint.
        setAuthStatus(
          currentUser ? AUTH_STATUS.AUTHENTICATED : AUTH_STATUS.UNAUTHENTICATED
        );
      });
    // Intentionally excluding currentUser: we only rehydrate once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
>>>>>>> Stashed changes

  useEffect(() => {
    writeUser(currentUser);
  }, [currentUser]);

<<<<<<< Updated upstream
=======
  useEffect(() => {
    setCompletedCourses(new Set(currentUser?.completedCourseIds || []));
  }, [currentUser?.id, currentUser?.completedCourseIds]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.style.colorScheme = theme;
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      // Ignore persistence issues and keep runtime theme state
    }
  }, [theme]);

  function applyAuthenticatedSession({ token, user }) {
    writeToken(token);
    const normalized = normalizeUserCollections(user);
    writeUser(normalized);
    setCurrentUser(normalized);
    setAuthStatus(AUTH_STATUS.AUTHENTICATED);
  }

  const COLD_START_THRESHOLD_MS = 3000;

  // Legacy-shape lookup `{ [courseId]: { [lessonId]: true } }` derived from
  // the new `progress` array so existing consumers (ModuleDetails.jsx) don't
  // need to change.
  const lessonProgress = useMemo(() => {
    const lookup = {};
    progress.forEach((row) => {
      const courseId = row.courseId?._id || row.courseId;
      if (!courseId) return;
      lookup[courseId] = {};
      (row.completedLessonIds || []).forEach((lessonRef) => {
        const lessonId = lessonRef?._id || lessonRef;
        if (lessonId) lookup[courseId][String(lessonId)] = true;
      });
    });
    return lookup;
  }, [progress]);

  const fetchCourses = useCallback(async () => {
    setCoursesStatus(RESOURCE_STATUS.LOADING);
    setCoursesError(null);

    const wakingTimer = setTimeout(() => {
      setIsBackendWaking(true);
    }, COLD_START_THRESHOLD_MS);

    try {
      const response = await apiGet("/courses");
      const list = extractList(response).map(normalizeCourse);
      setCourses(list);
      setCoursesStatus(RESOURCE_STATUS.SUCCESS);
      return list;
    } catch (error) {
      setCoursesError(error);
      setCoursesStatus(RESOURCE_STATUS.ERROR);
      throw error;
    } finally {
      clearTimeout(wakingTimer);
      setIsBackendWaking(false);
    }
  }, []);

  // Fetch the courses list once on mount. Subsequent calls require an
  // explicit fetchCourses() — e.g. after a create/update/delete.
  useEffect(() => {
    if (didFetchCoursesRef.current) return;
    didFetchCoursesRef.current = true;
    fetchCourses().catch(() => {
      // Error is already captured in coursesError state; swallow here so the
      // unhandled-promise warning doesn't surface in the console.
    });
  }, [fetchCourses]);

  // Hydrate the signed-in user's enrollments/purchases/progress/reviews.
  // The backend returns every row from each collection (no server-side userId
  // filter yet), so we filter locally. Safe for Phase 2 data volumes.
  const loadMyData = useCallback(async (userId, token) => {
    if (!userId || !token) return;
    setMyDataStatus(RESOURCE_STATUS.LOADING);
    setMyDataError(null);
    try {
      const [enrollRes, purchaseRes, progressRes, reviewRes] = await Promise.all([
        apiGet("/enrollments", { token }),
        apiGet("/purchases", { token }),
        apiGet("/progress", { token }),
        apiGet("/reviews", { token }),
      ]);

      const mine = (response) =>
        extractList(response).filter((row) => {
          const rowUserId = row.userId?._id || row.userId;
          return String(rowUserId) === String(userId);
        });

      const myEnrollments = mine(enrollRes);
      const myPurchases = mine(purchaseRes);
      const myProgress = mine(progressRes);
      const myReviews = mine(reviewRes);

      setEnrollments(myEnrollments);
      setPurchases(myPurchases);
      setProgress(myProgress);
      setReviews(myReviews);

      // Hydrate the legacy currentUser.reviews lookup map so pages that check
      // "did I review this course?" see persisted reviews after reload.
      const reviewsByCourseId = {};
      myReviews.forEach((review) => {
        const reviewCourseId = review.courseId?._id || review.courseId;
        if (!reviewCourseId) return;
        reviewsByCourseId[String(reviewCourseId)] = {
          rating: review.rating,
          comment: review.comment,
          id: review.id || review._id,
        };
      });
      setCurrentUser((prev) =>
        prev ? { ...prev, reviews: reviewsByCourseId } : prev
      );

      setMyDataStatus(RESOURCE_STATUS.SUCCESS);
    } catch (error) {
      setMyDataError(error);
      setMyDataStatus(RESOURCE_STATUS.ERROR);
    }
  }, []);

  useEffect(() => {
    if (authStatus !== AUTH_STATUS.AUTHENTICATED) return;
    if (!currentUser?.id) return;
    const token = readToken();
    if (!token) return;
    loadMyData(currentUser.id, token);
  }, [authStatus, currentUser?.id, loadMyData]);

  const login = useCallback(async ({ email, password }) => {
    setAuthStatus(AUTH_STATUS.LOADING);
    try {
      const response = await apiPost("/auth/login", { email, password });
      if (response?.twoFactorRequired) {
        // Caller (Login.jsx) renders TwoFactorForm and later calls completeTwoFactor.
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

      applyAuthenticatedSession({
        token: response.token,
        user: response.data,
      });

      // Best-effort profile enrichment — phone/bio don't fit in /auth/register.
      // Failure here is non-fatal; we'll surface a toast but the user is still
      // registered and logged in.
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
        } catch {
          // Profile extras are optional — swallow but let the caller toast if desired
        }
      }

      return { user: response.data };
    } catch (error) {
      setAuthStatus(AUTH_STATUS.ERROR);
      throw error;
    }
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

>>>>>>> Stashed changes
  const logout = useCallback(() => {
    clearSession();
    setCurrentUser(null);
    setAuthStatus(AUTH_STATUS.UNAUTHENTICATED);
    setEnrollments([]);
    setPurchases([]);
    setProgress([]);
    setReviews([]);
    setMyDataStatus(RESOURCE_STATUS.IDLE);
    setMyDataError(null);
    setCompletedCourses(new Set());
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

  function addToast(message, variant = "success") {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, variant }]);
  }

  function removeToast(id) {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }

<<<<<<< Updated upstream
  function enrollCourse(courseId) {
    if (!currentUser) return;
    const updated = {
      ...currentUser,
      enrolledCourseIds: currentUser.enrolledCourseIds.includes(courseId)
        ? currentUser.enrolledCourseIds
        : [...currentUser.enrolledCourseIds, courseId],
    };
    setCurrentUser(updated);
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
  }

  function unenrollCourse(courseId) {
    if (!currentUser) return;
    const updated = {
      ...currentUser,
      enrolledCourseIds: currentUser.enrolledCourseIds.filter((id) => id !== courseId),
    };
    setCurrentUser(updated);
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    // Remove progress for this course
    setLessonProgress((prev) => {
      const next = { ...prev };
      delete next[courseId];
      return next;
=======
  async function updateProfile(fields) {
    if (!currentUser) return;

    // Only these fields exist on the backend User model. Expertise/website
    // /profileImage are kept client-side until the backend schema catches up.
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

  async function enrollCourse(courseId) {
    if (!currentUser) throw new Error("You must be signed in to enroll.");
    const token = readToken();
    if (!token) throw new Error("Missing auth token. Please sign in again.");

    const existing = enrollments.find((row) => {
      const rowCourseId = row.courseId?._id || row.courseId;
      return String(rowCourseId) === String(courseId);
    });
    if (existing) return existing;

    const response = await apiPost(
      "/enrollments",
      { userId: currentUser.id, courseId },
      { token }
    );
    const created = response?.data || response;
    setEnrollments((prev) => [...prev, created]);

    setCurrentUser((prev) => {
      if (!prev) return prev;
      const currentIds = prev.enrolledCourseIds || [];
      if (currentIds.includes(courseId)) return prev;
      return normalizeUserCollections({
        ...prev,
        enrolledCourseIds: [...currentIds, courseId],
      });
    });

    return created;
  }

  async function purchaseCourse(courseId) {
    if (!currentUser) throw new Error("You must be signed in to purchase.");
    const token = readToken();
    if (!token) throw new Error("Missing auth token. Please sign in again.");

    const course = courses.find((c) => c.id === courseId);
    const amount = Number(course?.price || 0);

    const purchaseResponse = await apiPost(
      "/purchases",
      { userId: currentUser.id, courseId, amount, status: "completed" },
      { token }
    );
    const purchase = purchaseResponse?.data || purchaseResponse;
    setPurchases((prev) => [...prev, purchase]);

    const alreadyEnrolled = enrollments.some((row) => {
      const rowCourseId = row.courseId?._id || row.courseId;
      return String(rowCourseId) === String(courseId);
    });
    if (!alreadyEnrolled) {
      const enrollResponse = await apiPost(
        "/enrollments",
        { userId: currentUser.id, courseId },
        { token }
      );
      const enrollment = enrollResponse?.data || enrollResponse;
      setEnrollments((prev) => [...prev, enrollment]);
    }

    setCurrentUser((prev) => {
      if (!prev) return prev;
      const purchasedIds = prev.purchasedCourseIds || [];
      const enrolledIds = prev.enrolledCourseIds || [];
      return normalizeUserCollections({
        ...prev,
        purchasedCourseIds: purchasedIds.includes(courseId)
          ? purchasedIds
          : [...purchasedIds, courseId],
        enrolledCourseIds: enrolledIds.includes(courseId)
          ? enrolledIds
          : [...enrolledIds, courseId],
      });
    });

    return purchase;
  }

  async function unenrollCourse(courseId) {
    if (!currentUser) throw new Error("You must be signed in to unenroll.");
    const token = readToken();
    if (!token) throw new Error("Missing auth token. Please sign in again.");

    const enrollment = enrollments.find((row) => {
      const rowCourseId = row.courseId?._id || row.courseId;
      return String(rowCourseId) === String(courseId);
    });
    if (!enrollment) return;

    const enrollmentId = enrollment.id || enrollment._id;
    await apiDelete(`/enrollments/${enrollmentId}`, { token });

    setEnrollments((prev) =>
      prev.filter((row) => (row.id || row._id) !== enrollmentId)
    );

    // Best-effort: also remove the course's progress document so re-enrolling
    // starts fresh. We ignore failures so the unenroll itself never regresses.
    const progressRow = progress.find((row) => {
      const rowCourseId = row.courseId?._id || row.courseId;
      return String(rowCourseId) === String(courseId);
    });
    if (progressRow) {
      const progressId = progressRow.id || progressRow._id;
      try {
        await apiDelete(`/progress/${progressId}`, { token });
      } catch {
        // Non-fatal — the enrollment is already gone
      }
      setProgress((prev) =>
        prev.filter((row) => (row.id || row._id) !== progressId)
      );
    }

    setCurrentUser((prev) => {
      if (!prev) return prev;
      return normalizeUserCollections({
        ...prev,
        enrolledCourseIds: (prev.enrolledCourseIds || []).filter((id) => id !== courseId),
        completedCourseIds: (prev.completedCourseIds || []).filter((id) => id !== courseId),
      });
>>>>>>> Stashed changes
    });
    setCompletedCourses((prev) => {
      const next = new Set(prev);
      next.delete(courseId);
      return next;
    });
  }

<<<<<<< Updated upstream
  function saveCourse(courseId) {
    if (!currentUser) return;
    const updated = {
      ...currentUser,
      savedCourseIds: currentUser.savedCourseIds.includes(courseId)
        ? currentUser.savedCourseIds
        : [...currentUser.savedCourseIds, courseId],
    };
    setCurrentUser(updated);
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
  }

  function unsaveCourse(courseId) {
    if (!currentUser) return;
    const updated = {
      ...currentUser,
      savedCourseIds: currentUser.savedCourseIds.filter((id) => id !== courseId),
    };
    setCurrentUser(updated);
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
=======
  // The backend has no dedicated bookmark endpoint; savedCourseIds is a plain
  // array field on the User model, so we read-modify-write the whole array
  // through PUT /users/:id.
  async function persistSavedCourseIds(nextSavedIds) {
    if (!currentUser) throw new Error("You must be signed in to save courses.");
    const token = readToken();
    if (!token) throw new Error("Missing auth token. Please sign in again.");

    const response = await apiPut(
      `/users/${currentUser.id}`,
      { savedCourseIds: nextSavedIds },
      { token }
    );
    const serverUser = response?.data || response;
    const merged = normalizeUserCollections({
      ...currentUser,
      ...(serverUser || {}),
      savedCourseIds: nextSavedIds,
    });
    setCurrentUser(merged);
    return merged;
  }

  async function saveCourse(courseId) {
    if (!currentUser) throw new Error("You must be signed in to save courses.");
    const current = currentUser.savedCourseIds || [];
    if (current.includes(courseId)) return currentUser;
    return persistSavedCourseIds([...current, courseId]);
>>>>>>> Stashed changes
  }

  async function unsaveCourse(courseId) {
    if (!currentUser) throw new Error("You must be signed in to save courses.");
    const current = currentUser.savedCourseIds || [];
    if (!current.includes(courseId)) return currentUser;
    return persistSavedCourseIds(current.filter((id) => id !== courseId));
  }

  // Whitelist of fields the backend Course model accepts. Anything else
  // (e.g. locally-built modules) is dropped rather than sent to the server.
  const COURSE_WRITE_FIELDS = [
    "title",
    "description",
    "instructor",
    "price",
    "category",
    "level",
    "thumbnail",
    "tags",
    "language",
    "duration",
    "isPublished",
  ];

  function pickCoursePayload(source) {
    const payload = {};
    COURSE_WRITE_FIELDS.forEach((key) => {
      if (source[key] !== undefined) payload[key] = source[key];
    });
    return payload;
  }

  async function addCourse(course) {
    const token = readToken();
    const payload = {
      ...pickCoursePayload(course),
      instructor: course.instructor || course.instructorName || currentUser?.name || "",
      instructorId: currentUser?.id,
    };
    const response = await apiPost("/courses", payload, { token });
    const created = normalizeCourse(response?.data || response);
    setCourses((prev) => [...prev, created]);
    if (currentUser) {
      setCurrentUser((prev) =>
        prev
          ? normalizeUserCollections({
              ...prev,
              createdCourseIds: [...(prev.createdCourseIds || []), created.id],
            })
          : prev
      );
    }
    return created;
  }

  async function updateCourse(course) {
    const token = readToken();
    const courseId = course.id || course._id;
    if (!courseId) throw new Error("updateCourse requires a course id");
    const payload = pickCoursePayload(course);
    const response = await apiPut(`/courses/${courseId}`, payload, { token });
    const updated = normalizeCourse(response?.data || response);
    setCourses((prev) => prev.map((c) => (c.id === courseId ? updated : c)));
    return updated;
  }

<<<<<<< Updated upstream
  /** Mark a lesson complete and persist in context */
  function markLessonComplete(courseId, lessonId) {
    setLessonProgress((prev) => ({
      ...prev,
      [courseId]: { ...(prev[courseId] || {}), [lessonId]: true },
    }));
  }

  /** Mark entire course as completed */
  function markCourseComplete(courseId) {
=======
  async function submitReview(courseId, rating, comment) {
    if (!currentUser) throw new Error("You must be signed in to leave a review.");
    const token = readToken();
    if (!token) throw new Error("Missing auth token. Please sign in again.");

    const response = await apiPost(
      "/reviews",
      { userId: currentUser.id, courseId, rating, comment },
      { token }
    );
    const review = response?.data || response;
    setReviews((prev) => [...prev, review]);

    // Keep the `currentUser.reviews` lookup map in sync so pages that check
    // "has this user already reviewed this course?" keep working without
    // page-level changes.
    setCurrentUser((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        reviews: {
          ...(prev.reviews || {}),
          [courseId]: { rating, comment, id: review?.id || review?._id },
        },
      };
    });

    return review;
  }

  async function deleteCourse(courseId) {
    if (!currentUser) throw new Error("You must be signed in to delete a course.");

    const token = readToken();
    await apiDelete(`/courses/${courseId}`, { token });

    setCourses((prev) => prev.filter((c) => c.id !== courseId));

    setCurrentUser((prev) => {
      if (!prev) return prev;
      return normalizeUserCollections({
        ...prev,
        createdCourseIds: (prev.createdCourseIds || []).filter((id) => id !== courseId),
        enrolledCourseIds: (prev.enrolledCourseIds || []).filter((id) => id !== courseId),
        purchasedCourseIds: (prev.purchasedCourseIds || []).filter((id) => id !== courseId),
        savedCourseIds: (prev.savedCourseIds || []).filter((id) => id !== courseId),
        completedCourseIds: (prev.completedCourseIds || []).filter((id) => id !== courseId),
      });
    });

    // Drop the course's enrollment and progress rows locally so the various
    // id-mirror collections stay consistent. Server-side cleanup (if any)
    // happens in backend cascades — the client never owned those rows.
    setEnrollments((prev) =>
      prev.filter((row) => {
        const rowCourseId = row.courseId?._id || row.courseId;
        return String(rowCourseId) !== String(courseId);
      })
    );
    setProgress((prev) =>
      prev.filter((row) => {
        const rowCourseId = row.courseId?._id || row.courseId;
        return String(rowCourseId) !== String(courseId);
      })
    );

    setCompletedCourses((prev) => {
      const next = new Set(prev);
      next.delete(courseId);
      return next;
    });

    return true;
  }

  function findProgressRow(courseId) {
    return progress.find((row) => {
      const rowCourseId = row.courseId?._id || row.courseId;
      return String(rowCourseId) === String(courseId);
    });
  }

  function countTotalLessons(courseId) {
    const course = courses.find((c) => c.id === courseId);
    if (!course?.modules) return 0;
    return course.modules.reduce(
      (sum, module) => sum + (module.lessons?.length || 0),
      0
    );
  }

  // Upsert the single Progress document for this (user, course) pair.
  // POST on first call, PUT thereafter. Returns the normalized row from the
  // server and syncs the local progress state.
  async function upsertProgress(courseId, updates) {
    if (!currentUser) throw new Error("You must be signed in to record progress.");
    const token = readToken();
    if (!token) throw new Error("Missing auth token. Please sign in again.");

    const existing = findProgressRow(courseId);
    if (existing) {
      const rowId = existing.id || existing._id;
      const response = await apiPut(
        `/progress/${rowId}`,
        { ...updates },
        { token }
      );
      const row = response?.data || response;
      setProgress((prev) =>
        prev.map((r) => ((r.id || r._id) === rowId ? row : r))
      );
      return row;
    }

    const response = await apiPost(
      "/progress",
      { userId: currentUser.id, courseId, ...updates },
      { token }
    );
    const row = response?.data || response;
    setProgress((prev) => [...prev, row]);
    return row;
  }

  async function markLessonComplete(courseId, lessonId) {
    if (!currentUser) throw new Error("You must be signed in to record progress.");

    const existing = findProgressRow(courseId);
    const currentCompleted = (existing?.completedLessonIds || []).map((ref) =>
      String(ref?._id || ref)
    );
    const lessonKey = String(lessonId);
    if (currentCompleted.includes(lessonKey)) return existing;

    const nextCompleted = [...currentCompleted, lessonKey];
    const totalLessons = countTotalLessons(courseId);
    const percentage = totalLessons
      ? Math.round((nextCompleted.length / totalLessons) * 100)
      : existing?.percentage || 0;
    const completed = totalLessons > 0 && nextCompleted.length >= totalLessons;

    const row = await upsertProgress(courseId, {
      completedLessonIds: nextCompleted,
      percentage,
      completed,
    });

    if (completed) {
      await markCourseComplete(courseId);
    }

    return row;
  }

  async function markCourseComplete(courseId) {
    if (!currentUser) throw new Error("You must be signed in to record progress.");

    await upsertProgress(courseId, { completed: true, percentage: 100 });

    setCurrentUser((prev) => {
      if (!prev) return prev;
      const completedCourseIds = prev.completedCourseIds || [];
      if (completedCourseIds.includes(courseId)) return prev;
      return normalizeUserCollections({
        ...prev,
        completedCourseIds: [...completedCourseIds, courseId],
      });
    });
>>>>>>> Stashed changes
    setCompletedCourses((prev) => new Set([...prev, courseId]));
  }

  function getCourseProgress(courseId) {
    const row = findProgressRow(courseId);
    if (!row) return 0;
    if (typeof row.percentage === "number") return row.percentage;

    const totalLessons = countTotalLessons(courseId);
    if (totalLessons === 0) return 0;
    const done = (row.completedLessonIds || []).length;
    return Math.round((done / totalLessons) * 100);
  }

  return (
    <AppContext.Provider
      value={{
        courses, setCourses,
        coursesStatus, coursesError, fetchCourses,
        users, setUsers,
        currentUser, setCurrentUser,
<<<<<<< Updated upstream
        logout,
        addCourse, updateCourse,
        enrollCourse, unenrollCourse,
=======
        authStatus,
        login, register, logout, completeTwoFactor,
        setupTwoFactor, enableTwoFactor, disableTwoFactor,
        theme, setTheme, toggleTheme,
        addCourse, updateCourse, submitReview,
        deleteCourse,
        updateProfile,
        enrollCourse, purchaseCourse, unenrollCourse,
>>>>>>> Stashed changes
        saveCourse, unsaveCourse,
        lessonProgress, markLessonComplete,
        completedCourses, markCourseComplete,
        getCourseProgress,
        enrollments, purchases, progress, reviews,
        myDataStatus, myDataError, loadMyData,
        toasts, addToast, removeToast,
        isBackendWaking,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppContext must be used inside <AppProvider>");
  return ctx;
}
