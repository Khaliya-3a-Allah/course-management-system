import Course from "../models/Course.js";
import Enrollment from "../models/Enrollment.js";
import Progress from "../models/Progress.js";
import { ApiError } from "../utils/ApiError.js";
import { buildDashboardAnalytics } from "../utils/dashboardAnalytics.js";

const DASHBOARD_COURSE_SELECT = [
  "title",
  "description",
  "instructor",
  "instructorId",
  "price",
  "category",
  "level",
  "thumbnail",
  "rating",
  "reviewCount",
  "enrolled",
  "tags",
  "language",
  "duration",
  "isPublished",
].join(" ");

export async function getMyDashboard(req, res) {
  if (!req.user?.id) {
    throw new ApiError(401, "Authentication required");
  }

  const userId = req.user.id;

  const [user, enrollments, progress, courses, createdCourses] = await Promise.all([
    Promise.resolve(req.user),
    Enrollment.find({ userId })
      .sort({ updatedAt: -1, createdAt: -1 })
      .populate({ path: "courseId", select: DASHBOARD_COURSE_SELECT })
      .lean({ virtuals: true }),
    Progress.find({ userId })
      .sort({ updatedAt: -1, createdAt: -1 })
      .populate({ path: "courseId", select: DASHBOARD_COURSE_SELECT })
      .lean({ virtuals: true }),
    Course.find({ isPublished: true })
      .select(DASHBOARD_COURSE_SELECT)
      .sort({ enrolled: -1, rating: -1, createdAt: -1 })
      .lean({ virtuals: true }),
    req.user.role === "instructor"
      ? Course.find({ instructorId: userId })
        .select(DASHBOARD_COURSE_SELECT)
        .sort({ updatedAt: -1, createdAt: -1 })
        .lean({ virtuals: true })
      : Promise.resolve([]),
  ]);

  const dashboard = buildDashboardAnalytics({ user, enrollments, progress, courses });

  if (req.user.role === "instructor") {
    dashboard.instructor = {
      createdCount: createdCourses.length,
      publishedCount: createdCourses.filter((course) => course.isPublished).length,
      draftCount: createdCourses.filter((course) => !course.isPublished).length,
      createdCourses: createdCourses.map((course) => ({
        id: String(course.id || course._id),
        title: course.title || "Untitled course",
        description: course.description || "",
        instructor: course.instructor || req.user.name || "",
        instructorId: course.instructorId || req.user.id,
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
      })),
    };
  }

  res.status(200).json({
    success: true,
    data: dashboard,
  });
}
