import { createContext, useContext, useState } from "react";
import { mockCourses } from "../data/mockCourses";
import { mockUsers } from "../data/mockUsers";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [courses, setCourses] = useState(mockCourses);
  const [users, setUsers] = useState(mockUsers);
  const [currentUser, setCurrentUser] = useState(null);

  function enrollCourse(courseId) {
    if (!currentUser) return;
    const updated = { ...currentUser, enrolledCourseIds: currentUser.enrolledCourseIds.includes(courseId) ? currentUser.enrolledCourseIds : [...currentUser.enrolledCourseIds, courseId] };
    setCurrentUser(updated);
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
  }

  function unenrollCourse(courseId) {
    if (!currentUser) return;
    const updated = { ...currentUser, enrolledCourseIds: currentUser.enrolledCourseIds.filter((id) => id !== courseId) };
    setCurrentUser(updated);
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
  }

  function saveCourse(courseId) {
    if (!currentUser) return;
    const updated = { ...currentUser, savedCourseIds: currentUser.savedCourseIds.includes(courseId) ? currentUser.savedCourseIds : [...currentUser.savedCourseIds, courseId] };
    setCurrentUser(updated);
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
  }

  function unsaveCourse(courseId) {
    if (!currentUser) return;
    const updated = { ...currentUser, savedCourseIds: currentUser.savedCourseIds.filter((id) => id !== courseId) };
    setCurrentUser(updated);
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
  }

  function addCourse(course) {
    setCourses((prev) => [...prev, course]);
    if (currentUser) {
      const updated = { ...currentUser, createdCourseIds: [...(currentUser.createdCourseIds || []), course.id] };
      setCurrentUser(updated);
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    }
  }

  function updateCourse(updated) {
    setCourses((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
  }

  return (
    <AppContext.Provider value={{ courses, setCourses, users, setUsers, currentUser, setCurrentUser, addCourse, updateCourse, enrollCourse, unenrollCourse, saveCourse, unsaveCourse }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppContext must be used inside <AppProvider>");
  return ctx;
}
