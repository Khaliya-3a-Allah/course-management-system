import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { mockCourses } from "../data/mockCourses";
import { mockUsers } from "../data/mockUsers";
import { sanitizeInput } from "../utils/validators";

const AppContext = createContext(null);

const STORAGE_KEY = "courseApp_currentUser";
const THEME_KEY = "courseApp_theme";

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
  const [completedCourses, setCompletedCourses] = useState(new Set());
  // toast notifications
  const [toasts, setToasts] = useState([]);
  const [theme, setTheme] = useState(loadThemeFromStorage);

  useEffect(() => {
    saveUserToStorage(currentUser);
  }, [currentUser]);

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

  const logout = useCallback(() => {
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  function addToast(message, variant = "success") {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, variant }]);
  }

  function removeToast(id) {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }

  function updateProfile(fields) {
    if (!currentUser) return;

    const allowedKeys = ["name", "phone", "bio", "expertise", "website", "profileImage"];
    const safeUpdates = {};

    allowedKeys.forEach((key) => {
      if (!(key in fields)) return;
      if (key === "profileImage") {
        safeUpdates.profileImage = fields.profileImage || "";
      } else if (key === "website") {
        safeUpdates.website = fields.website?.trim() || "";
      } else {
        safeUpdates[key] = sanitizeInput(fields[key] || "");
      }
    });

    const updated = { ...currentUser, ...safeUpdates };
    setCurrentUser(updated);
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
  }

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
      completedCourseIds: (currentUser.completedCourseIds || []).filter((id) => id !== courseId),
    };
    setCurrentUser(updated);
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    // Remove progress for this course
    setLessonProgress((prev) => {
      const next = { ...prev };
      delete next[courseId];
      return next;
    });
    setCompletedCourses((prev) => {
      const next = new Set(prev);
      next.delete(courseId);
      return next;
    });
  }

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
  }

  function addCourse(course) {
    setCourses((prev) => [...prev, course]);
    if (currentUser) {
      const updated = {
        ...currentUser,
        createdCourseIds: [...(currentUser.createdCourseIds || []), course.id],
      };
      setCurrentUser(updated);
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    }
  }

  function updateCourse(updated) {
    setCourses((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
  }

  function submitReview(courseId, rating, comment) {
    if (!currentUser) return;
    const updated = {
      ...currentUser,
      reviews: { ...(currentUser.reviews || {}), [courseId]: { rating, comment } },
    };
    setCurrentUser(updated);
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    const course = courses.find((c) => c.id === courseId);
    if (course) {
      const newRating = ((course.rating || 0) + rating) / 2;
      updateCourse({ ...course, rating: Math.round(newRating * 10) / 10 });
    }
  }

  function deleteCourse(courseId) {
    if (!currentUser || currentUser.role !== "instructor") return false;
    if (!(currentUser.createdCourseIds || []).includes(courseId)) return false;

    setCourses((prev) => prev.filter((c) => c.id !== courseId));

    setUsers((prev) => prev.map((u) => ({
      ...u,
      createdCourseIds: (u.createdCourseIds || []).filter((id) => id !== courseId),
      enrolledCourseIds: (u.enrolledCourseIds || []).filter((id) => id !== courseId),
      savedCourseIds: (u.savedCourseIds || []).filter((id) => id !== courseId),
      completedCourseIds: (u.completedCourseIds || []).filter((id) => id !== courseId),
    })));

    setCurrentUser((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        createdCourseIds: (prev.createdCourseIds || []).filter((id) => id !== courseId),
        enrolledCourseIds: (prev.enrolledCourseIds || []).filter((id) => id !== courseId),
        savedCourseIds: (prev.savedCourseIds || []).filter((id) => id !== courseId),
        completedCourseIds: (prev.completedCourseIds || []).filter((id) => id !== courseId),
      };
    });

    setLessonProgress((prev) => {
      const next = { ...prev };
      delete next[courseId];
      return next;
    });

    setCompletedCourses((prev) => {
      const next = new Set(prev);
      next.delete(courseId);
      return next;
    });

    return true;
  }

  /** Mark a lesson complete and persist in context */
  function markLessonComplete(courseId, lessonId) {
    setLessonProgress((prev) => ({
      ...prev,
      [courseId]: { ...(prev[courseId] || {}), [lessonId]: true },
    }));
  }

  /** Mark entire course as completed */
  function markCourseComplete(courseId) {
    if (!currentUser) return;

    const completedCourseIds = currentUser.completedCourseIds || [];
    if (completedCourseIds.includes(courseId)) return;

    const updated = {
      ...currentUser,
      completedCourseIds: [...completedCourseIds, courseId],
    };

    setCurrentUser(updated);
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    setCompletedCourses((prev) => new Set([...prev, courseId]));
  }

  /** Get progress % for a course */
  function getCourseProgress(courseId) {
    const course = courses.find((c) => c.id === courseId);
    if (!course) return 0;
    const totalLessons = course.modules?.reduce((acc, m) => acc + (m.lessons?.length || 0), 0) || 0;
    if (totalLessons === 0) return 0;
    const done = Object.keys(lessonProgress[courseId] || {}).filter((k) => lessonProgress[courseId][k]).length;
    return Math.round((done / totalLessons) * 100);
  }

  return (
    <AppContext.Provider
      value={{
        courses, setCourses,
        users, setUsers,
        currentUser, setCurrentUser,
        theme, setTheme, toggleTheme,
        logout,
        addCourse, updateCourse, submitReview,
        deleteCourse,
        updateProfile,
        enrollCourse, unenrollCourse,
        saveCourse, unsaveCourse,
        lessonProgress, markLessonComplete,
        completedCourses, markCourseComplete,
        getCourseProgress,
        toasts, addToast, removeToast,
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