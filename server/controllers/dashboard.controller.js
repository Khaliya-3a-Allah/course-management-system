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

  const [user, enrollments, progress, courses] = await Promise.all([
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
  ]);

  const dashboard = buildDashboardAnalytics({ user, enrollments, progress, courses });

  res.status(200).json({
    success: true,
    data: dashboard,
  });
}
