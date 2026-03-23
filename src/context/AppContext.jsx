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
  const [completedCourses, setCompletedCourses] = useState(new Set());
  // toast notifications
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    saveUserToStorage(currentUser);
  }, [currentUser]);

  useEffect(() => {
    setCompletedCourses(new Set(currentUser?.completedCourseIds || []));
  }, [currentUser?.id, currentUser?.completedCourseIds]);

  const logout = useCallback(() => {
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  function addToast(message, variant = "success") {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, variant }]);
  }

  function removeToast(id) {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
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
        logout,
        addCourse, updateCourse,
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