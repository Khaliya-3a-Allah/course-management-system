const MS_PER_DAY = 24 * 60 * 60 * 1000;

function toUtcDayKey(date) {
  const value = new Date(date);
  return [
    value.getUTCFullYear(),
    String(value.getUTCMonth() + 1).padStart(2, "0"),
    String(value.getUTCDate()).padStart(2, "0"),
  ].join("-");
}

function startOfUtcWeek(date = new Date()) {
  const value = new Date(date);
  const day = value.getUTCDay() || 7;
  value.setUTCHours(0, 0, 0, 0);
  value.setUTCDate(value.getUTCDate() - day + 1);
  return value;
}

function addDays(date, days) {
  return new Date(new Date(date).getTime() + days * MS_PER_DAY);
}

function diffDays(later, earlier) {
  return Math.floor((new Date(later).getTime() - new Date(earlier).getTime()) / MS_PER_DAY);
}

function clampNumber(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function formatDate(date) {
  return new Date(date).toISOString();
}

function getCourseId(row) {
  return String(row?.courseId?._id || row?.courseId?.id || row?.courseId || "");
}

function getCourseSnapshot(course) {
  if (!course) return null;
  return {
    id: String(course.id || course._id),
    title: course.title || "Untitled course",
    description: course.description || "",
    instructor: course.instructor || "",
    instructorId: course.instructorId || null,
    price: Number(course.price || 0),
    category: course.category || "",
    level: course.level || "Beginner",
    thumbnail: course.thumbnail || "",
    rating: Number(course.rating || 0),
    reviewCount: Number(course.reviewCount || 0),
    enrolled: Number(course.enrolled || 0),
    tags: Array.isArray(course.tags) ? course.tags : [],
    language: course.language || "English",
    duration: course.duration || "",
    isPublished: Boolean(course.isPublished),
  };
}

function calculateVelocity(progressDoc, enrollmentDoc, now = new Date()) {
  const percentage = Number(progressDoc?.percentage || (progressDoc?.completed ? 100 : 0) || 0);
  if (percentage <= 0) return 0;

  const anchorDate = progressDoc?.createdAt || enrollmentDoc?.createdAt || enrollmentDoc?.enrolledAt || progressDoc?.updatedAt || now;
  const elapsedDays = Math.max(1, diffDays(now, anchorDate));
  return percentage / elapsedDays;
}

function countStreak(activityDays, anchorDate = new Date()) {
  let streak = 0;
  const cursor = new Date(anchorDate);
  cursor.setUTCHours(0, 0, 0, 0);

  while (activityDays.has(toUtcDayKey(cursor))) {
    streak += 1;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }

  return streak;
}

function rankCourses(courses, categoryCounts, preferredLevel, enrolledCourseIds) {
  const topCategories = [...categoryCounts.entries()]
    .sort((left, right) => right[1] - left[1])
    .map(([category]) => category);

  return courses
    .filter((course) => course.isPublished && !enrolledCourseIds.has(String(course.id)))
    .map((course) => {
      let score = 0;
      const reasons = [];

      const categoryRank = topCategories.indexOf(course.category);
      if (categoryRank !== -1) {
        score += Math.max(8, 18 - categoryRank * 4);
        reasons.push(`Matches your ${course.category} learning history`);
      }

      if (course.level === preferredLevel) {
        score += 6;
        reasons.push(`Fits your current pace (${preferredLevel})`);
      }

      const ratingScore = clampNumber(Math.round((Number(course.rating || 0) / 5) * 6), 0, 6);
      score += ratingScore;
      if (ratingScore > 0) {
        reasons.push(`Highly rated at ${Number(course.rating || 0).toFixed(1)}/5`);
      }

      const popularityScore = clampNumber(Math.round(Math.log1p(Number(course.enrolled || 0))), 0, 6);
      score += popularityScore;
      if (popularityScore > 0) {
        reasons.push(`${course.enrolled || 0} learners already enrolled`);
      }

      if (course.tags?.length && topCategories.length > 0) {
        const overlap = course.tags.filter((tag) => topCategories.some((category) => category.toLowerCase().includes(tag.toLowerCase()) || tag.toLowerCase().includes(category.toLowerCase())));
        if (overlap.length > 0) {
          score += Math.min(4, overlap.length * 2);
          reasons.push(`Aligned with your interest in ${overlap.slice(0, 2).join(", ")}`);
        }
      }

      return {
        course,
        score,
        reasons,
      };
    })
    .sort((left, right) => right.score - left.score || right.course.rating - left.course.rating || right.course.enrolled - left.course.enrolled)
    .slice(0, 6)
    .map(({ course, score, reasons }) => ({
      course,
      score,
      reasons,
    }));
}

export function buildDashboardAnalytics({ user, enrollments, progress, courses }) {
  const now = new Date();

  const enrollmentMap = new Map();
  enrollments.forEach((enrollment) => {
    const courseId = getCourseId(enrollment);
    if (!courseId) return;
    enrollmentMap.set(courseId, enrollment);
  });

  const progressMap = new Map();
  progress.forEach((row) => {
    const courseId = getCourseId(row);
    if (!courseId) return;
    progressMap.set(courseId, row);
  });

  const activityDays = new Set();
  const activityDates = [];
  const activeCourses = [];
  const categoryCounts = new Map();
  const enrolledCourseIds = new Set();

  enrollments.forEach((enrollment) => {
    const courseId = getCourseId(enrollment);
    if (!courseId) return;
    enrolledCourseIds.add(courseId);

    const course = enrollment.courseId && enrollment.courseId.title ? enrollment.courseId : null;
    const courseSnapshot = getCourseSnapshot(course);
    if (courseSnapshot?.category) {
      categoryCounts.set(courseSnapshot.category, (categoryCounts.get(courseSnapshot.category) || 0) + 1);
    }

    const progressDoc = progressMap.get(courseId) || null;
    const percentage = clampNumber(Number(progressDoc?.percentage || (progressDoc?.completed ? 100 : 0) || 0), 0, 100);
    const completed = Boolean(progressDoc?.completed || percentage >= 100);
    const lastActivityAt = progressDoc?.updatedAt || progressDoc?.createdAt || enrollment.updatedAt || enrollment.enrolledAt || now;

    activityDays.add(toUtcDayKey(lastActivityAt));
    activityDates.push(lastActivityAt);

    const velocity = calculateVelocity(progressDoc, enrollment, now);
    const remainingPercentage = Math.max(0, 100 - percentage);
    const projectedDaysRemaining = completed
      ? 0
      : velocity > 0
        ? Math.max(1, Math.ceil(remainingPercentage / velocity))
        : Math.max(7, Math.round(remainingPercentage / 4));
    const forecastDate = completed ? lastActivityAt : addDays(lastActivityAt, projectedDaysRemaining);
    const daysSinceActivity = Math.max(0, diffDays(now, lastActivityAt));

    activeCourses.push({
      course: courseSnapshot,
      progress: percentage,
      completed,
      lastActivityAt: formatDate(lastActivityAt),
      daysSinceActivity,
      velocityPerDay: Number(velocity.toFixed(2)),
      forecastDate: formatDate(forecastDate),
      daysRemaining: projectedDaysRemaining,
      nextAction: completed
        ? "Review and reinforce this course"
        : percentage > 0
          ? "Continue from where you left off"
          : "Start your first lesson",
    });
  });

  progress.forEach((row) => {
    const courseId = getCourseId(row);
    if (!courseId) return;
    if (!enrollmentMap.has(courseId)) {
      const course = row.courseId && row.courseId.title ? row.courseId : null;
      const courseSnapshot = getCourseSnapshot(course);
      if (courseSnapshot?.category) {
        categoryCounts.set(courseSnapshot.category, (categoryCounts.get(courseSnapshot.category) || 0) + 1);
      }
    }
  });

  activeCourses.sort((left, right) => {
    if (left.completed !== right.completed) return left.completed ? 1 : -1;
    return right.daysRemaining - left.daysRemaining || right.progress - left.progress;
  });

  const currentStreakDays = countStreak(activityDays, now);
  const thisWeekStart = startOfUtcWeek(now);
  const studyDaysThisWeek = new Set(
    activityDates.filter((date) => new Date(date).getTime() >= thisWeekStart.getTime()).map((date) => toUtcDayKey(date))
  );
  const weeklyGoalDays = Math.max(3, Math.min(6, Math.round(Math.max(1, activeCourses.length) * 1.2)));
  const weeklyGoalProgress = Math.min(100, Math.round((studyDaysThisWeek.size / weeklyGoalDays) * 100));

  const completedCourses = activeCourses.filter((course) => course.completed);
  const inProgressCourses = activeCourses.filter((course) => !course.completed);
  const averageVelocity = activeCourses.length
    ? activeCourses.reduce((total, course) => total + course.velocityPerDay, 0) / activeCourses.length
    : 0;

  const preferredLevel = averageVelocity >= 10 ? "Advanced" : averageVelocity >= 4 ? "Intermediate" : "Beginner";

  const deadlineReminders = inProgressCourses
    .map((course) => {
      const urgencyScore = course.daysSinceActivity >= 7 ? 100 : course.daysRemaining <= 7 ? 80 : course.daysRemaining <= 14 ? 60 : 40;
      const reason = course.daysSinceActivity >= 7
        ? `You have not studied ${course.daysSinceActivity} days.`
        : course.daysRemaining <= 7
          ? `At your current pace, you can finish ${course.course?.title || "this course"} within a week.`
          : `Keep momentum so ${course.course?.title || "this course"} stays on track.`;

      return {
        ...course,
        priority: urgencyScore,
        reminder: reason,
      };
    })
    .sort((left, right) => right.priority - left.priority || left.daysRemaining - right.daysRemaining)
    .slice(0, 4);

  const completionForecast = activeCourses
    .filter((course) => !course.completed)
    .slice(0, 4)
    .map((course) => ({
      course: course.course,
      projectedCompletionDate: course.forecastDate,
      daysRemaining: course.daysRemaining,
      confidence: clampNumber(Math.round(100 - Math.min(70, course.daysSinceActivity * 6)), 35, 95),
    }));

  const recommendations = rankCourses(courses, categoryCounts, preferredLevel, enrolledCourseIds);

  return {
    user: {
      id: user?.id || user?._id || null,
      name: user?.name || "Learner",
      role: user?.role || "student",
    },
    summary: {
      currentStreakDays,
      studyDaysThisWeek: studyDaysThisWeek.size,
      weeklyGoalDays,
      weeklyGoalProgress,
      enrolledCourses: activeCourses.length,
      completedCourses: completedCourses.length,
      averageVelocityPerDay: Number(averageVelocity.toFixed(2)),
      preferredLevel,
    },
    continueWatching: inProgressCourses,
    deadlineReminders,
    completionForecast,
    recommendations,
  };
}
