import { mockCourses } from "../../src/data/mockCourses.js";
import { mockUsers } from "../../src/data/mockUsers.js";
import { generateId } from "../utils/id.js";

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function normalizeUsers(users) {
  return users.map((user) => ({
    ...user,
    reviews: user.reviews || {},
    createdCourseIds: user.createdCourseIds || [],
    enrolledCourseIds: user.enrolledCourseIds || [],
    purchasedCourseIds: user.purchasedCourseIds || [],
    savedCourseIds: user.savedCourseIds || [],
    completedCourseIds: user.completedCourseIds || [],
  }));
}

function flattenModulesFromCourses(courses) {
  return courses.flatMap((course) =>
    (course.modules || []).map((module) => ({
      ...module,
      courseId: module.courseId || course.id,
      lessons: (module.lessons || []).map((lesson) => ({
        ...lesson,
        moduleId: lesson.moduleId || module.id,
      })),
    }))
  );
}

function flattenLessonsFromModules(modules) {
  return modules.flatMap((module) =>
    (module.lessons || []).map((lesson) => ({
      ...lesson,
      moduleId: lesson.moduleId || module.id,
      courseId: module.courseId,
    }))
  );
}

function buildDerivedCollections(users, courses) {
  const reviews = [];
  const enrollments = [];
  const purchases = [];
  const progress = [];
  const certificates = [];

  users.forEach((user) => {
    const reviewEntries = Object.entries(user.reviews || {});
    reviewEntries.forEach(([courseId, review]) => {
      reviews.push({
        id: generateId("review"),
        userId: user.id,
        courseId,
        rating: review.rating,
        comment: review.comment || "",
      });
    });

    (user.enrolledCourseIds || []).forEach((courseId) => {
      enrollments.push({
        id: generateId("enrollment"),
        userId: user.id,
        courseId,
        enrolledAt: new Date().toISOString(),
      });
    });

    (user.purchasedCourseIds || []).forEach((courseId) => {
      purchases.push({
        id: generateId("purchase"),
        userId: user.id,
        courseId,
        amount: Number(courses.find((c) => c.id === courseId)?.price || 0),
        status: "paid",
        purchasedAt: new Date().toISOString(),
      });
    });

    (user.completedCourseIds || []).forEach((courseId) => {
      progress.push({
        id: generateId("progress"),
        userId: user.id,
        courseId,
        completedLessonIds: [],
        percentage: 100,
        completed: true,
      });

      certificates.push({
        id: generateId("certificate"),
        userId: user.id,
        courseId,
        issuedAt: new Date().toISOString(),
      });
    });
  });

  return { reviews, enrollments, purchases, progress, certificates };
}

const courses = deepClone(mockCourses);
const users = normalizeUsers(deepClone(mockUsers));
let modules = flattenModulesFromCourses(courses);
let lessons = flattenLessonsFromModules(modules);

const derived = buildDerivedCollections(users, courses);
const supportTickets = [];

const db = {
  users,
  courses,
  modules,
  lessons,
  reviews: derived.reviews,
  enrollments: derived.enrollments,
  purchases: derived.purchases,
  progress: derived.progress,
  certificates: derived.certificates,
  supportTickets,
};

const idPrefixes = {
  users: "user",
  courses: "course",
  modules: "module",
  lessons: "lesson",
  reviews: "review",
  enrollments: "enrollment",
  purchases: "purchase",
  progress: "progress",
  certificates: "certificate",
  supportTickets: "ticket",
};

function ensureResourceName(resourceName) {
  if (!db[resourceName]) {
    throw new Error(`Unknown resource: ${resourceName}`);
  }
}

function rebuildCourseTreeCollections() {
  modules = flattenModulesFromCourses(db.courses);
  lessons = flattenLessonsFromModules(modules);
  db.modules = modules;
  db.lessons = lessons;
}

function normalizeCoursePayload(input, existingCourseId = null) {
  const nextCourseId = input.id || existingCourseId || generateId("course");

  const normalizedModules = (input.modules || []).map((module) => {
    const nextModuleId = module.id || generateId("module");

    const normalizedLessons = (module.lessons || []).map((lesson) => ({
      ...lesson,
      id: lesson.id || generateId("lesson"),
      moduleId: nextModuleId,
    }));

    return {
      ...module,
      id: nextModuleId,
      courseId: nextCourseId,
      lessons: normalizedLessons,
    };
  });

  return {
    ...input,
    id: nextCourseId,
    modules: normalizedModules,
  };
}

function findCourseByModuleId(moduleId) {
  return db.courses.find((course) =>
    (course.modules || []).some((module) => module.id === moduleId)
  );
}

function findModuleInCourse(course, moduleId) {
  return (course.modules || []).find((module) => module.id === moduleId);
}

export function list(resourceName) {
  ensureResourceName(resourceName);
  return db[resourceName];
}

export function findById(resourceName, id) {
  ensureResourceName(resourceName);
  return db[resourceName].find((item) => item.id === id) || null;
}

export function create(resourceName, payload) {
  ensureResourceName(resourceName);

  if (resourceName === "courses") {
    const course = normalizeCoursePayload(payload);
    db.courses.push(course);
    rebuildCourseTreeCollections();
    return course;
  }

  if (resourceName === "modules") {
    const course = db.courses.find((item) => item.id === payload.courseId);
    if (!course) return null;

    const module = {
      ...payload,
      id: payload.id || generateId("module"),
      courseId: course.id,
      lessons: (payload.lessons || []).map((lesson) => ({
        ...lesson,
        id: lesson.id || generateId("lesson"),
      })),
    };

    course.modules = course.modules || [];
    course.modules.push(module);
    rebuildCourseTreeCollections();
    return findById("modules", module.id);
  }

  if (resourceName === "lessons") {
    const course = findCourseByModuleId(payload.moduleId);
    if (!course) return null;

    const module = findModuleInCourse(course, payload.moduleId);
    if (!module) return null;

    const lesson = {
      ...payload,
      id: payload.id || generateId("lesson"),
      moduleId: module.id,
    };

    module.lessons = module.lessons || [];
    module.lessons.push(lesson);
    rebuildCourseTreeCollections();
    return findById("lessons", lesson.id);
  }

  const item = {
    ...payload,
    id: payload.id || generateId(idPrefixes[resourceName]),
  };

  db[resourceName].push(item);
  return item;
}

export function update(resourceName, id, payload) {
  ensureResourceName(resourceName);

  if (resourceName === "courses") {
    const index = db.courses.findIndex((item) => item.id === id);
    if (index === -1) return null;

    const merged = {
      ...db.courses[index],
      ...payload,
      id,
    };

    const normalized = normalizeCoursePayload(merged, id);
    db.courses[index] = normalized;
    rebuildCourseTreeCollections();
    return normalized;
  }

  if (resourceName === "modules") {
    const course = findCourseByModuleId(id);
    if (!course) return null;

    const moduleIndex = (course.modules || []).findIndex((module) => module.id === id);
    if (moduleIndex === -1) return null;

    const currentModule = course.modules[moduleIndex];
    const nextLessons = (payload.lessons || currentModule.lessons || []).map((lesson) => ({
      ...lesson,
      id: lesson.id || generateId("lesson"),
      moduleId: id,
    }));

    course.modules[moduleIndex] = {
      ...currentModule,
      ...payload,
      id,
      courseId: currentModule.courseId,
      lessons: nextLessons,
    };

    rebuildCourseTreeCollections();
    return findById("modules", id);
  }

  if (resourceName === "lessons") {
    const targetModule = db.modules.find((module) =>
      (module.lessons || []).some((lesson) => lesson.id === id)
    );
    if (!targetModule) return null;

    const course = findCourseByModuleId(targetModule.id);
    if (!course) return null;

    const module = findModuleInCourse(course, targetModule.id);
    if (!module) return null;

    const lessonIndex = (module.lessons || []).findIndex((lesson) => lesson.id === id);
    if (lessonIndex === -1) return null;

    module.lessons[lessonIndex] = {
      ...module.lessons[lessonIndex],
      ...payload,
      id,
      moduleId: module.id,
    };

    rebuildCourseTreeCollections();
    return findById("lessons", id);
  }

  const index = db[resourceName].findIndex((item) => item.id === id);
  if (index === -1) return null;

  db[resourceName][index] = {
    ...db[resourceName][index],
    ...payload,
    id,
  };

  return db[resourceName][index];
}

export function remove(resourceName, id) {
  ensureResourceName(resourceName);

  if (resourceName === "courses") {
    const index = db.courses.findIndex((item) => item.id === id);
    if (index === -1) return null;

    const [deleted] = db.courses.splice(index, 1);
    rebuildCourseTreeCollections();
    return deleted;
  }

  if (resourceName === "modules") {
    const course = findCourseByModuleId(id);
    if (!course) return null;

    const index = (course.modules || []).findIndex((module) => module.id === id);
    if (index === -1) return null;

    const [deleted] = course.modules.splice(index, 1);
    rebuildCourseTreeCollections();
    return deleted;
  }

  if (resourceName === "lessons") {
    const targetModule = db.modules.find((module) =>
      (module.lessons || []).some((lesson) => lesson.id === id)
    );
    if (!targetModule) return null;

    const course = findCourseByModuleId(targetModule.id);
    if (!course) return null;

    const module = findModuleInCourse(course, targetModule.id);
    if (!module) return null;

    const index = (module.lessons || []).findIndex((lesson) => lesson.id === id);
    if (index === -1) return null;

    const [deleted] = module.lessons.splice(index, 1);
    rebuildCourseTreeCollections();
    return deleted;
  }

  const index = db[resourceName].findIndex((item) => item.id === id);
  if (index === -1) return null;

  const [deleted] = db[resourceName].splice(index, 1);
  return deleted;
}
