/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from "react";
import { apiGet, apiPost, apiPut, apiDelete } from "../utils/api";
import { RESOURCE_STATUS } from "../utils/status";
import { readToken } from "../utils/authStorage";
import { useAuthContext, AUTH_STATUS, normalizeUserCollections } from "./AuthContext";
import { useUiContext } from "./UiContext";
import { getActiveSale } from "../utils/pricing";

const DataContext = createContext(null);

const COLD_START_THRESHOLD_MS = 3000;
const COURSE_CACHE_KEY = "cms_course_bundle_v1";

function readCourseCache() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(COURSE_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed?.courses) ? parsed : null;
  } catch {
    return null;
  }
}

function writeCourseCache(courses) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      COURSE_CACHE_KEY,
      JSON.stringify({
        savedAt: new Date().toISOString(),
        courses,
      })
    );
  } catch {
    // Cache writes are opportunistic.
  }
}

function makeIdempotencyKey(prefix = "purchase") {
  if (typeof window !== "undefined" && window.crypto?.randomUUID) {
    return `${prefix}-${window.crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function normalizeCourse(raw) {
  if (!raw) return raw;
  const course = raw.data && raw.id === undefined ? raw.data : raw;
  return {
    ...course,
    id: course.id || course._id,
    instructorName: course.instructorName || course.instructor || "",
    tags: Array.isArray(course.tags) ? course.tags : [],
    price: Number(course.price || 0),
    salePrice: Number(course.salePrice || 0),
    saleEndsAt: course.saleEndsAt || null,
    rating: Number(course.rating || 0),
  };
}

function extractList(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  return [];
}

const COURSE_WRITE_FIELDS = [
  "title", "description", "instructor", "price", "salePrice", "saleEndsAt", "category",
  "level", "thumbnail", "tags", "language", "duration", "isPublished",
];

function pickCoursePayload(source) {
  const payload = {};
  COURSE_WRITE_FIELDS.forEach((key) => {
    if (source[key] !== undefined) payload[key] = source[key];
  });
  return payload;
}

function isMongoId(id) {
  return typeof id === "string" && /^[0-9a-f]{24}$/i.test(id);
}

function toIdString(ref) {
  return String(ref?._id || ref?.id || ref || "");
}

function buildLessonPayload(lesson, moduleId, courseId, order) {
  const payload = {
    title: lesson.title,
    content: lesson.contentPreview || lesson.content || "",
    videoUrl: lesson.videoUrl || "",
    duration: lesson.duration || "",
    order,
    quiz: lesson.quiz || { enabled: false, questions: [] },
  };

  if (moduleId) payload.moduleId = moduleId;
  if (courseId) payload.courseId = courseId;
  return payload;
}

export function DataProvider({ children }) {
  const { currentUser, setCurrentUser, authStatus } = useAuthContext();
  const { setIsBackendWaking } = useUiContext();

  const [courses, setCourses] = useState([]);
  const [coursesStatus, setCoursesStatus] = useState(RESOURCE_STATUS.IDLE);
  const [coursesError, setCoursesError] = useState(null);
  const [users, setUsers] = useState([]);

  const [enrollments, setEnrollments] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [progress, setProgress] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [myDataStatus, setMyDataStatus] = useState(RESOURCE_STATUS.IDLE);
  const [myDataError, setMyDataError] = useState(null);
  const [completedCourses, setCompletedCourses] = useState(new Set());

  const didFetchCoursesRef = useRef(false);

  // Clear user data on logout
  useEffect(() => {
    if (authStatus === AUTH_STATUS.UNAUTHENTICATED) {
      setEnrollments([]);
      setPurchases([]);
      setProgress([]);
      setReviews([]);
      setMyDataStatus(RESOURCE_STATUS.IDLE);
      setMyDataError(null);
      setCompletedCourses(new Set());
    }
  }, [authStatus]);

  // Sync completedCourses from currentUser
  useEffect(() => {
    setCompletedCourses(new Set((currentUser?.completedCourseIds || []).map(toIdString).filter(Boolean)));
  }, [currentUser?.id, currentUser?.completedCourseIds]);

  const lessonProgress = useMemo(() => {
    const lookup = {};
    progress.forEach((row) => {
      const courseId = toIdString(row.courseId);
      if (!courseId) return;
      lookup[courseId] = {};
      (row.completedLessonIds || []).forEach((lessonRef) => {
        const lessonId = toIdString(lessonRef);
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
      const [coursesRes, modulesRes, lessonsRes] = await Promise.all([
        apiGet("/courses"),
        apiGet("/modules"),
        apiGet("/lessons"),
      ]);

      const allModules = extractList(modulesRes);
      const allLessons = extractList(lessonsRes);

      const lessonsByModuleId = {};
      allLessons.forEach((les) => {
        const mid = String(les.moduleId?._id || les.moduleId || "");
        if (!mid) return;
        if (!lessonsByModuleId[mid]) lessonsByModuleId[mid] = [];
        lessonsByModuleId[mid].push(les);
      });

      const modulesByCourseId = {};
      allModules.forEach((mod) => {
        const cid = String(mod.courseId?._id || mod.courseId || "");
        if (!cid) return;
        if (!modulesByCourseId[cid]) modulesByCourseId[cid] = [];
        const modWithLessons = {
          ...mod,
          lessons: (lessonsByModuleId[String(mod.id)] || []).sort(
            (a, b) => (a.order ?? 0) - (b.order ?? 0)
          ),
        };
        modulesByCourseId[cid].push(modWithLessons);
      });
      Object.values(modulesByCourseId).forEach((mods) =>
        mods.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      );

      const list = extractList(coursesRes).map((raw) => {
        const course = normalizeCourse(raw);
        return { ...course, modules: modulesByCourseId[String(course.id)] || [] };
      });

      setCourses(list);
      writeCourseCache(list);
      setCoursesStatus(RESOURCE_STATUS.SUCCESS);
      return list;
    } catch (error) {
      const cached = readCourseCache();
      if (cached?.courses?.length) {
        setCourses(cached.courses.map((raw) => normalizeCourse(raw)));
        setCoursesStatus(RESOURCE_STATUS.SUCCESS);
        setCoursesError(null);
        return cached.courses;
      }

      setCoursesError(error);
      setCoursesStatus(RESOURCE_STATUS.ERROR);
      throw error;
    } finally {
      clearTimeout(wakingTimer);
      setIsBackendWaking(false);
    }
  }, [setIsBackendWaking]);

  useEffect(() => {
    if (didFetchCoursesRef.current) return;
    didFetchCoursesRef.current = true;
    fetchCourses().catch(() => {});
  }, [fetchCourses]);

  const loadMyData = useCallback(async (userId, token) => {
    if (!userId || !token) return;
    setMyDataStatus(RESOURCE_STATUS.LOADING);
    setMyDataError(null);
    try {
      const [enrollRes, purchaseRes, progressRes, reviewRes] = await Promise.all([
        apiGet(`/enrollments?userId=${userId}`, { token }),
        apiGet(`/purchases?userId=${userId}`, { token }),
        apiGet(`/progress?userId=${userId}`, { token }),
        apiGet(`/reviews?userId=${userId}`, { token }),
      ]);

      const myEnrollments = extractList(enrollRes);
      const myPurchases = extractList(purchaseRes);
      const myProgress = extractList(progressRes);
      setEnrollments(myEnrollments);
      setPurchases(myPurchases);
      setProgress(myProgress);

      const myReviews = extractList(reviewRes);
      setReviews(myReviews);

      // Derive course ID lists from actual records (source of truth)
      const enrolledIds = myEnrollments
        .map((row) => String(row.courseId?._id || row.courseId || ""))
        .filter(Boolean);
      const purchasedIds = myPurchases
        .map((row) => String(row.courseId?._id || row.courseId || ""))
        .filter(Boolean);
      const completedIds = myProgress
        .filter((row) => row.completed)
        .map((row) => toIdString(row.courseId))
        .filter(Boolean);

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
      setCurrentUser((prev) => {
        if (!prev) return prev;
        return normalizeUserCollections({
          ...prev,
          enrolledCourseIds: [...new Set([...(prev.enrolledCourseIds || []), ...enrolledIds])],
          purchasedCourseIds: [...new Set([...(prev.purchasedCourseIds || []), ...purchasedIds])],
          completedCourseIds: [...new Set([...(prev.completedCourseIds || []).map(toIdString), ...completedIds])],
          reviews: reviewsByCourseId,
        });
      });

      setMyDataStatus(RESOURCE_STATUS.SUCCESS);
    } catch (error) {
      setMyDataError(error);
      setMyDataStatus(RESOURCE_STATUS.ERROR);
    }
  }, [setCurrentUser]);

  useEffect(() => {
    if (authStatus !== AUTH_STATUS.AUTHENTICATED) return;
    if (!currentUser?.id) return;
    const token = readToken();
    if (!token) return;
    loadMyData(currentUser.id, token);
  }, [authStatus, currentUser?.id, loadMyData]);

  async function addCourse(course) {
    const token = readToken();
    const payload = {
      ...pickCoursePayload(course),
      instructor: course.instructor || course.instructorName || currentUser?.name || "",
      instructorId: currentUser?.id,
    };
    const response = await apiPost("/courses", payload, { token });
    const created = normalizeCourse(response?.data || response);

    const savedModules = [];
    for (let i = 0; i < (course.modules || []).length; i++) {
      const mod = course.modules[i];
      const modRes = await apiPost("/modules", {
        title: mod.title,
        order: mod.order ?? i,
        courseId: created.id,
      }, { token });
      const savedMod = modRes?.data || modRes;

      const savedLessons = [];
      for (let j = 0; j < (mod.lessons || []).length; j++) {
        const les = mod.lessons[j];
        const lesRes = await apiPost(
          "/lessons",
          buildLessonPayload(les, savedMod.id, created.id, les.order ?? j),
          { token }
        );
        savedLessons.push(lesRes?.data || lesRes);
      }
      savedModules.push({ ...savedMod, lessons: savedLessons });
    }

    const courseWithModules = { ...created, modules: savedModules };
    setCourses((prev) => [...prev, courseWithModules]);
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
    return courseWithModules;
  }

  async function updateCourse(course) {
    const token = readToken();
    const courseId = course.id || course._id;
    if (!courseId) throw new Error("updateCourse requires a course id");
    const payload = pickCoursePayload(course);
    const response = await apiPut(`/courses/${courseId}`, payload, { token });
    const updated = normalizeCourse(response?.data || response);

    const existingModules = courses.find((c) => c.id === courseId)?.modules || [];
    const newModules = course.modules || [];

    // Delete modules that were removed
    const keptModuleIds = new Set(newModules.filter((m) => isMongoId(m.id)).map((m) => m.id));
    for (const existingMod of existingModules) {
      if (!keptModuleIds.has(existingMod.id)) {
        for (const les of (existingMod.lessons || [])) {
          try { await apiDelete(`/lessons/${les.id}`, { token }); } catch { /* non-fatal */ }
        }
        try { await apiDelete(`/modules/${existingMod.id}`, { token }); } catch { /* non-fatal */ }
      }
    }

    const savedModules = [];
    for (let i = 0; i < newModules.length; i++) {
      const mod = newModules[i];
      let savedMod;
      if (isMongoId(mod.id)) {
        const res = await apiPut(`/modules/${mod.id}`, { title: mod.title, order: mod.order ?? i }, { token });
        savedMod = res?.data || res;
      } else {
        const res = await apiPost("/modules", { title: mod.title, order: mod.order ?? i, courseId }, { token });
        savedMod = res?.data || res;
      }

      const existingMod = existingModules.find((m) => m.id === mod.id);
      const existingLessons = existingMod?.lessons || [];
      const newLessons = mod.lessons || [];

      const keptLessonIds = new Set(newLessons.filter((l) => isMongoId(l.id)).map((l) => l.id));
      for (const existingLes of existingLessons) {
        if (!keptLessonIds.has(existingLes.id)) {
          try { await apiDelete(`/lessons/${existingLes.id}`, { token }); } catch { /* non-fatal */ }
        }
      }

      const savedLessons = [];
      for (let j = 0; j < newLessons.length; j++) {
        const les = newLessons[j];
        let savedLes;
        if (isMongoId(les.id)) {
          const res = await apiPut(
            `/lessons/${les.id}`,
            buildLessonPayload(les, null, null, les.order ?? j),
            { token }
          );
          savedLes = res?.data || res;
        } else {
          const res = await apiPost(
            "/lessons",
            buildLessonPayload(les, savedMod.id, courseId, les.order ?? j),
            { token }
          );
          savedLes = res?.data || res;
        }
        savedLessons.push(savedLes);
      }
      savedModules.push({ ...savedMod, lessons: savedLessons });
    }

    const courseWithModules = { ...updated, modules: savedModules };
    setCourses((prev) => prev.map((c) => (c.id === courseId ? courseWithModules : c)));
    return courseWithModules;
  }

  async function deleteCourse(courseId) {
    if (!currentUser) throw new Error("You must be signed in to delete a course.");
    const token = readToken();

    const courseToDelete = courses.find((c) => c.id === courseId);
    for (const mod of (courseToDelete?.modules || [])) {
      for (const les of (mod.lessons || [])) {
        try { await apiDelete(`/lessons/${les.id}`, { token }); } catch { /* non-fatal */ }
      }
      try { await apiDelete(`/modules/${mod.id}`, { token }); } catch { /* non-fatal */ }
    }

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
        completedCourseIds: (prev.completedCourseIds || []).filter((id) => toIdString(id) !== String(courseId)),
      });
    });

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
      next.delete(String(courseId));
      return next;
    });

    return true;
  }

  async function submitReview(courseId, rating, comment) {
    if (!currentUser) throw new Error("You must be signed in to leave a review.");
    const token = readToken();
    if (!token) throw new Error("Missing auth token. Please sign in again.");

    // Update existing review if one already exists, otherwise create
    const existingReview = currentUser?.reviews?.[courseId];
    let review;
    if (existingReview?.id) {
      const response = await apiPut(`/reviews/${existingReview.id}`, { rating, comment }, { token });
      review = response?.data || response;
      setReviews((prev) => prev.map((r) => (r.id === existingReview.id ? review : r)));
    } else {
      const response = await apiPost("/reviews", { courseId, rating, comment }, { token });
      review = response?.data || response;
      setReviews((prev) => [...prev, review]);
    }

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

    // Refresh the course's rating from the server so the stars update immediately
    try {
      const courseRes = await apiGet(`/courses/${courseId}`);
      const freshCourse = normalizeCourse(courseRes?.data || courseRes);
      if (freshCourse?.id) {
        setCourses((prev) =>
          prev.map((c) =>
            c.id === freshCourse.id
              ? { ...c, rating: freshCourse.rating, reviewCount: freshCourse.reviewCount }
              : c
          )
        );
      }
    } catch { /* non-fatal — stale rating is better than a broken submit */ }

    return review;
  }

  async function enrollCourse(courseId) {
    if (!currentUser) throw new Error("You must be signed in to enroll.");
    const token = readToken();
    if (!token) throw new Error("Missing auth token. Please sign in again.");

    const existing = enrollments.find((row) => {
      const rowCourseId = row.courseId?._id || row.courseId;
      return String(rowCourseId) === String(courseId);
    });
    if (existing) {
      // Enrollment record exists — make sure currentUser reflects it
      setCurrentUser((prev) => {
        if (!prev) return prev;
        const currentIds = prev.enrolledCourseIds || [];
        if (currentIds.some((id) => String(id) === String(courseId))) return prev;
        return normalizeUserCollections({
          ...prev,
          enrolledCourseIds: [...currentIds, courseId],
        });
      });
      return existing;
    }

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

  async function purchaseCourse(courseId, paymentDetails = {}) {
    if (!currentUser) throw new Error("You must be signed in to purchase.");
    const token = readToken();
    if (!token) throw new Error("Missing auth token. Please sign in again.");

    const idempotencyKey = paymentDetails.idempotencyKey || makeIdempotencyKey();
    const selectedCourse = courses.find((course) => course.id === courseId);
    const sale = getActiveSale(selectedCourse);
    const optimisticFinalAmount = Math.max(0, Number((sale.finalPrice - Number(paymentDetails.discount || 0)).toFixed(2)));
    const optimisticPurchase = {
      id: `optimistic-${idempotencyKey}`,
      idempotencyKey,
      userId: currentUser.id,
      courseId,
      amount: Number(selectedCourse?.price || 0),
      finalAmount: optimisticFinalAmount,
      status: "paid",
      paymentMethod: paymentDetails.paymentMethod || "card",
      purchasedAt: new Date().toISOString(),
      __optimistic: true,
    };

    const previousPurchases = purchases;
    const previousEnrollments = enrollments;
    const previousUser = currentUser;

    setPurchases((prev) => [...prev, optimisticPurchase]);
    setCurrentUser((prev) => {
      if (!prev) return prev;
      return normalizeUserCollections({
        ...prev,
        purchasedCourseIds: [...new Set([...(prev.purchasedCourseIds || []), courseId])],
        enrolledCourseIds: [...new Set([...(prev.enrolledCourseIds || []), courseId])],
      });
    });

    try {
      const purchaseResponse = await apiPost(
        "/purchases",
        { userId: currentUser.id, courseId, idempotencyKey, ...paymentDetails },
        { token }
      );
      const purchase = purchaseResponse?.data || purchaseResponse;
      setPurchases((prev) => [
        ...prev.filter((row) => row.idempotencyKey !== idempotencyKey),
        purchase,
      ]);

      const alreadyEnrolled = previousEnrollments.some((row) => {
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
        setEnrollments((prev) => [
          ...prev.filter((row) => !(String(row.courseId?._id || row.courseId) === String(courseId) && String(row.userId?._id || row.userId) === String(currentUser.id))),
          enrollment,
        ]);
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
    } catch (error) {
      setPurchases(previousPurchases);
      setEnrollments(previousEnrollments);
      setCurrentUser(previousUser);
      throw error;
    }
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
        completedCourseIds: (prev.completedCourseIds || []).filter((id) => toIdString(id) !== String(courseId)),
      });
    });
    setCompletedCourses((prev) => {
      const next = new Set(prev);
      next.delete(String(courseId));
      return next;
    });
  }

  async function persistSavedCourseIds(nextSavedIds) {
    if (!currentUser) throw new Error("You must be signed in to save courses.");
    const token = readToken();
    if (!token) throw new Error("Missing auth token. Please sign in again.");

    await apiPut(
      `/users/${currentUser.id}`,
      { savedCourseIds: nextSavedIds },
      { token }
    );
    // Only update savedCourseIds — spreading the server response would overwrite
    // client-tracked enrolledCourseIds/purchasedCourseIds with the server's stale empty arrays.
    const merged = normalizeUserCollections({
      ...currentUser,
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
  }

  async function unsaveCourse(courseId) {
    if (!currentUser) throw new Error("You must be signed in to save courses.");
    const current = currentUser.savedCourseIds || [];
    if (!current.includes(courseId)) return currentUser;
    return persistSavedCourseIds(current.filter((id) => id !== courseId));
  }

  function findProgressRow(courseId) {
    return progress.find((row) => {
      const rowCourseId = toIdString(row.courseId);
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

  async function upsertProgress(courseId, updates) {
    if (!currentUser) throw new Error("You must be signed in to record progress.");
    const token = readToken();
    if (!token) throw new Error("Missing auth token. Please sign in again.");

    const existing = findProgressRow(courseId);
    if (existing) {
      const rowId = existing.id || existing._id;
      const response = await apiPut(`/progress/${rowId}`, { ...updates }, { token });
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
      toIdString(ref)
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
      setCurrentUser((prev) => {
        if (!prev) return prev;
        const completedCourseIds = (prev.completedCourseIds || []).map(toIdString);
        if (completedCourseIds.includes(String(courseId))) return prev;
        return normalizeUserCollections({
          ...prev,
          completedCourseIds: [...completedCourseIds, courseId],
        });
      });
      setCompletedCourses((prev) => new Set([...prev, String(courseId)]));
    }

    return row;
  }

  async function markCourseComplete(courseId) {
    if (!currentUser) throw new Error("You must be signed in to record progress.");

    await upsertProgress(courseId, { completed: true, percentage: 100 });

    setCurrentUser((prev) => {
      if (!prev) return prev;
      const completedCourseIds = (prev.completedCourseIds || []).map(toIdString);
      if (completedCourseIds.includes(String(courseId))) return prev;
      return normalizeUserCollections({
        ...prev,
        completedCourseIds: [...completedCourseIds, courseId],
      });
    });
    setCompletedCourses((prev) => new Set([...prev, String(courseId)]));
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
    <DataContext.Provider
      value={{
        courses, setCourses,
        coursesStatus, coursesError, fetchCourses,
        users, setUsers,
        enrollments, purchases, progress, reviews,
        myDataStatus, myDataError, loadMyData,
        completedCourses,
        lessonProgress,
        addCourse, updateCourse, deleteCourse,
        submitReview,
        enrollCourse, purchaseCourse, unenrollCourse,
        saveCourse, unsaveCourse,
        markLessonComplete, markCourseComplete,
        getCourseProgress,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useDataContext() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useDataContext must be used inside <DataProvider>");
  return ctx;
}
