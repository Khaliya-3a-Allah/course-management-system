import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { apiGet } from "../utils/api";
import { readToken } from "../utils/authStorage";
import { RESOURCE_STATUS } from "../utils/status";
import CourseCard from "../components/CourseCard";
import Modal from "../components/Modal";
import TwoFactorEnroll from "../components/TwoFactorEnroll";
import {
  validateName,
  validatePhone,
  validateBio,
  validateExpertise,
  validateOptionalUrl,
  validatePassword,
  validatePasswordMatch,
  sanitizeInput,
  validateTwoFactorCode,
} from "../utils/validators";

function formatDate(dateValue) {
  if (!dateValue) return "Soon";
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(new Date(dateValue));
}

function formatShortDateTime(dateValue) {
  if (!dateValue) return "Recently";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(dateValue));
}

function formatCountdown(daysRemaining) {
  if (daysRemaining === 0) return "Today";
  if (daysRemaining === 1) return "1 day left";
  return `${daysRemaining} days left`;
}

export default function Dashboard() {
  const {
    currentUser,
    courses,
    unenrollCourse,
    updateProfile,
    addToast,
    deleteCourse,
    unsaveCourse,
    requestPasswordChange,
    changePassword,
  } = useAppContext();
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState(null);
  const [dashboardStatus, setDashboardStatus] = useState(RESOURCE_STATUS.IDLE);
  const [dashboardError, setDashboardError] = useState("");
  const [visible, setVisible] = useState(false);
  const [unenrollTarget, setUnenrollTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [profileErrors, setProfileErrors] = useState({});
  const [profileForm, setProfileForm] = useState({
    name: "",
    phone: "",
    bio: "",
    expertise: "",
    website: "",
    profileImage: "",
  });
  const [passwordForm, setPasswordForm] = useState({
    code: "",
    password: "",
    confirmPassword: "",
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordStatus, setPasswordStatus] = useState("");
  const [isPasswordSubmitting, setIsPasswordSubmitting] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
      return;
    }

    const timer = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(timer);
  }, [currentUser, navigate]);

  async function loadDashboard() {
    const token = readToken();
    if (!token) {
      setDashboardStatus(RESOURCE_STATUS.ERROR);
      setDashboardError("Missing authentication token. Please sign in again.");
      return;
    }

    setDashboardStatus(RESOURCE_STATUS.LOADING);
    setDashboardError("");

    try {
      const response = await apiGet("/dashboard/me", { token });
      setDashboardData(response?.data || null);
      setDashboardStatus(RESOURCE_STATUS.SUCCESS);
    } catch (error) {
      setDashboardData(null);
      setDashboardStatus(RESOURCE_STATUS.ERROR);
      setDashboardError(error?.message || "Could not load your dashboard.");
    }
  }

  useEffect(() => {
    if (!currentUser) return;
    loadDashboard();
    // The dashboard should refresh when the authenticated user changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.id]);

  const summary = dashboardData?.summary || {};
  const continueWatching = dashboardData?.continueWatching || [];
  const deadlineReminders = dashboardData?.deadlineReminders || [];
  const completionForecast = dashboardData?.completionForecast || [];
  const recommendations = dashboardData?.recommendations || [];
  const instructor = dashboardData?.instructor || {
    createdCount: 0,
    publishedCount: 0,
    draftCount: 0,
    createdCourses: [],
  };
  const isInstructor = currentUser?.role === "instructor";
  const canManageCreatedCourses = isInstructor || (instructor.createdCourses?.length || 0) > 0;
  const isLoading = dashboardStatus === RESOURCE_STATUS.LOADING || dashboardStatus === RESOURCE_STATUS.IDLE;
  const hasError = dashboardStatus === RESOURCE_STATUS.ERROR;
  const savedCourseIds = currentUser?.savedCourseIds || [];
  const savedCourses = courses.filter((course) => savedCourseIds.includes(course.id));

  const summaryCards = [
    {
      label: "Learning streak",
      value: `${summary.currentStreakDays || 0} day${summary.currentStreakDays === 1 ? "" : "s"}`,
      hint: summary.currentStreakDays > 0 ? "Keep the chain alive today." : "Start a new streak today.",
    },
    {
      label: "Weekly goal",
      value: `${summary.studyDaysThisWeek || 0}/${summary.weeklyGoalDays || 0} days`,
      hint: `${summary.weeklyGoalProgress || 0}% of your study goal complete.`,
    },
    {
      label: "Active courses",
      value: `${summary.enrolledCourses || 0}`,
      hint: `${summary.completedCourses || 0} course${summary.completedCourses === 1 ? "" : "s"} completed.`,
    },
    {
      label: "Velocity",
      value: `${summary.averageVelocityPerDay || 0}%/day`,
      hint: `Current pace suggests ${summary.preferredLevel || "Beginner"} tracks next.`,
    },
  ];

  function openProfileEditor() {
    setProfileForm({
      name: currentUser?.name || "",
      phone: currentUser?.phone || "",
      bio: currentUser?.bio || "",
      expertise: currentUser?.expertise || "",
      website: currentUser?.website || "",
      profileImage: currentUser?.profileImage || "",
    });
    setProfileErrors({});
    setShowProfileModal(true);
  }

  function updateProfileField(key, value) {
    setProfileForm((prev) => ({ ...prev, [key]: value }));
    if (profileErrors[key]) {
      setProfileErrors((prev) => ({ ...prev, [key]: "" }));
    }
  }

  function handleProfileImageChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setProfileErrors((prev) => ({ ...prev, profileImage: "Please upload an image file." }));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      updateProfileField("profileImage", String(reader.result || ""));
    };
    reader.readAsDataURL(file);
  }

  async function handleSaveProfile(event) {
    event.preventDefault();

    const isInstructor = currentUser?.role === "instructor";
    const errors = {
      name: validateName(profileForm.name),
      phone: validatePhone(profileForm.phone),
      bio: validateBio(profileForm.bio),
      expertise: isInstructor ? validateExpertise(profileForm.expertise) : "",
      website: isInstructor ? validateOptionalUrl(profileForm.website) : "",
      profileImage: "",
    };

    setProfileErrors(errors);
    if (Object.values(errors).some(Boolean)) return;

    await updateProfile({
      name: sanitizeInput(profileForm.name),
      phone: sanitizeInput(profileForm.phone),
      bio: sanitizeInput(profileForm.bio),
      expertise: isInstructor ? sanitizeInput(profileForm.expertise) : "",
      website: isInstructor ? profileForm.website.trim() : "",
      profileImage: profileForm.profileImage,
    });

    setShowProfileModal(false);
    addToast("Profile updated successfully.", "success");
  }

  async function handleUnenroll(courseId) {
    try {
      await unenrollCourse(courseId);
      setUnenrollTarget(null);
      addToast("You were unenrolled from the course.", "success");
      await loadDashboard();
    } catch (error) {
      addToast(error?.message || "Could not unenroll from this course.", "error");
    }
  }

  async function handleDeleteCourse(courseId) {
    try {
      await deleteCourse(courseId);
      setDeleteTarget(null);
      addToast("Course deleted successfully.", "success");
      await loadDashboard();
    } catch (error) {
      addToast(error?.message || "Could not delete this course.", "error");
    }
  }

  async function openPasswordChange() {
    setPasswordForm({ code: "", password: "", confirmPassword: "" });
    setPasswordErrors({});
    setPasswordStatus("");
    setShowPasswordModal(true);
    setIsPasswordSubmitting(true);
    try {
      await requestPasswordChange();
      setPasswordStatus("Check your email for a 6-digit verification code.");
    } catch (error) {
      setPasswordStatus(error?.message || "Could not send verification code.");
    } finally {
      setIsPasswordSubmitting(false);
    }
  }

  function updatePasswordField(key, value) {
    setPasswordForm((prev) => ({ ...prev, [key]: value }));
    if (passwordErrors[key]) {
      setPasswordErrors((prev) => ({ ...prev, [key]: "" }));
    }
    setPasswordStatus("");
  }

  async function handleChangePassword(event) {
    event.preventDefault();

    const errors = {
      code: validateTwoFactorCode(passwordForm.code),
      password: validatePassword(passwordForm.password),
      confirmPassword: validatePasswordMatch(passwordForm.password, passwordForm.confirmPassword),
    };
    setPasswordErrors(errors);
    if (Object.values(errors).some(Boolean)) return;

    setIsPasswordSubmitting(true);
    try {
      await changePassword({
        code: passwordForm.code,
        password: passwordForm.password,
      });
      setShowPasswordModal(false);
      addToast("Password changed successfully.", "success");
    } catch (error) {
      setPasswordStatus(error?.message || "Could not change password.");
    } finally {
      setIsPasswordSubmitting(false);
    }
  }

  async function handleUnsaveCourse(courseId) {
    try {
      await unsaveCourse(courseId);
      addToast("Course removed from saved courses.", "success");
    } catch (error) {
      addToast(error?.message || "Could not update saved courses.", "error");
    }
  }

  if (!currentUser) return null;

  return (
    <div
      className="relative min-h-screen overflow-hidden bg-[#0c0c0e] text-[#e8e6e0] font-['DM_Sans',sans-serif]"
      style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(14px)", transition: "opacity 0.5s ease, transform 0.5s ease" }}
    >
      <style>{`
        .dash-surface { background: linear-gradient(180deg, rgba(255,255,255,0.045), rgba(255,255,255,0.015)); }
        .dash-card { transition: transform 220ms ease, border-color 220ms ease, box-shadow 220ms ease; }
        .dash-card:hover { transform: translateY(-3px); border-color: rgba(217,119,6,0.35); box-shadow: 0 14px 30px rgba(0,0,0,0.25); }
        .dash-pill { transition: all 220ms ease; }
      `}</style>

      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute -top-24 left-[12%] h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(217,119,6,0.2)_0%,rgba(217,119,6,0)_72%)] blur-3xl" />
        <div className="absolute bottom-[-90px] right-[8%] h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(245,158,11,0.16)_0%,rgba(245,158,11,0)_72%)] blur-3xl" />
        <div className="absolute inset-0 opacity-[0.14]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)", backgroundSize: "56px 56px" }} />
      </div>

      <header className="relative z-10 bg-[#111114]/85 border-b border-[rgba(255,255,255,0.06)] px-4 md:px-8 py-6 md:py-8 backdrop-blur-sm">
        <div className="max-w-[1100px] mx-auto">
          <div className="dash-surface rounded-3xl border border-[rgba(255,255,255,0.08)] p-4 md:p-6 lg:p-7">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
              <div className="flex items-start gap-4 md:gap-5 flex-1 min-w-0">
                {currentUser.profileImage ? (
                  <img
                    src={currentUser.profileImage}
                    alt={`${currentUser.name} profile`}
                    className="w-[74px] h-[74px] rounded-2xl shrink-0 border border-[rgba(217,119,6,0.45)] object-cover"
                  />
                ) : (
                  <div
                    className="w-[74px] h-[74px] rounded-2xl flex items-center justify-center font-['Playfair_Display',serif] text-[1.8rem] shrink-0 border border-[rgba(217,119,6,0.45)] bg-[rgba(217,119,6,0.15)] text-[#d97706]"
                    aria-hidden="true"
                  >
                    {currentUser.name.charAt(0).toUpperCase()}
                  </div>
                )}

                <div className="min-w-0">
                  <p className="text-[0.72rem] tracking-[0.18em] uppercase text-[#d97706] mb-2">Personalized dashboard</p>
                  <h1 className="font-['Playfair_Display',serif] text-[2rem] md:text-[2.35rem] text-[#f5f2ec] leading-tight mb-2">
                    {currentUser.name}
                  </h1>
                  <p className="text-[0.9rem] text-[#9ca3af] max-w-[58ch] mb-3">
                    Your progress is computed from live enrollment and progress records in MongoDB, so the streak, reminders, and recommendations reflect real activity.
                  </p>
                  <div className="flex flex-wrap items-center gap-2.5 mb-4">
                    <span className="px-3 py-1 rounded-full text-[0.72rem] font-bold tracking-wider uppercase border border-[rgba(245,158,11,0.25)] bg-[rgba(245,158,11,0.08)] text-[#f6c56b]">
                      {currentUser.role}
                    </span>
                    {!!currentUser.email && <span className="text-[0.82rem] text-[#6b7280]">{currentUser.email}</span>}
                    {!!currentUser.phone && <span className="text-[0.82rem] text-[#6b7280]">{currentUser.phone}</span>}
                  </div>
                  {!!currentUser.bio && <p className="text-[0.86rem] text-[#a3a3a3] max-w-[72ch]">{currentUser.bio}</p>}
                </div>
              </div>

              <div className="flex flex-wrap gap-2.5 shrink-0">
                <button
                  onClick={openProfileEditor}
                  className="dash-pill px-4 py-2.5 rounded-xl font-bold text-[0.83rem] border border-[rgba(255,255,255,0.14)] text-[#e8e6e0] hover:border-[rgba(217,119,6,0.4)]"
                >
                  Edit Profile
                </button>
                <Link
                  to="/certificates"
                  className="dash-pill px-4 py-2.5 rounded-xl no-underline font-bold text-[0.83rem] border border-[rgba(255,255,255,0.14)] text-[#e8e6e0] hover:border-[rgba(217,119,6,0.4)]"
                >
                  Certificates
                </Link>
                <Link
                  to="/courses"
                  className="dash-pill px-4 py-2.5 rounded-xl no-underline font-bold text-[0.83rem] bg-[#d97706] text-[#0c0c0e] hover:brightness-110"
                >
                  Browse courses
                </Link>
                {isInstructor && (
                  <Link
                    to="/course-form"
                    className="dash-pill px-4 py-2.5 rounded-xl no-underline font-bold text-[0.83rem] border border-[rgba(255,255,255,0.14)] text-[#e8e6e0] hover:border-[rgba(217,119,6,0.4)]"
                  >
                    + Add course
                  </Link>
                )}
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4">
              {summaryCards.map((card) => (
                <div key={card.label} className="dash-card rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] p-4">
                  <p className="text-[0.72rem] tracking-[0.18em] uppercase text-[#8b8f98] mb-2">{card.label}</p>
                  <p className="font-['Playfair_Display',serif] text-[1.55rem] md:text-[1.75rem] text-[#f5f2ec] m-0">{card.value}</p>
                  <p className="text-[0.82rem] text-[#9ca3af] mt-1.5 leading-relaxed">{card.hint}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-[1100px] mx-auto px-4 md:px-8 py-6 md:py-8">
        <section className="mb-6" aria-labelledby="dashboard-security-heading">
          <div className="mb-3">
            <p className="text-[0.72rem] tracking-[0.18em] uppercase text-[#f6c56b] mb-1">Optional security</p>
            <h2 id="dashboard-security-heading" className="font-['Playfair_Display',serif] text-[1.3rem] text-[#f5f2ec]">
              Account Protection
            </h2>
          </div>
          <TwoFactorEnroll />
        </section>

        {hasError && (
          <section className="mb-6 rounded-2xl border border-[rgba(239,68,68,0.25)] bg-[rgba(239,68,68,0.08)] p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <p className="text-[#fecaca] font-semibold mb-1">Dashboard unavailable</p>
              <p className="text-[#fca5a5] text-[0.9rem]">{dashboardError}</p>
            </div>
            <button
              onClick={loadDashboard}
              className="self-start md:self-auto px-4 py-2 rounded-lg bg-[#ef4444] text-white font-semibold"
            >
              Retry
            </button>
          </section>
        )}

        {isLoading ? (
          <section className="dash-surface rounded-2xl border border-[rgba(255,255,255,0.08)] p-6 text-center text-[#9ca3af]">
            Loading your live dashboard from the database...
          </section>
        ) : (
          <div className="space-y-8">
            <section>
              <div className="flex items-end justify-between gap-3 mb-4">
                <div>
                  <p className="text-[0.72rem] tracking-[0.18em] uppercase text-[#f6c56b] mb-1">Continue watching</p>
                  <h2 className="font-['Playfair_Display',serif] text-[1.3rem] text-[#f5f2ec]">Pick up where you left off</h2>
                </div>
                <Link to="/courses" className="text-[0.88rem] font-semibold text-[#f6c56b] no-underline">
                  Browse all courses
                </Link>
              </div>

              {continueWatching.length === 0 ? (
                <div className="dash-surface rounded-2xl border border-[rgba(255,255,255,0.08)] p-6 text-[#9ca3af]">
                  You do not have any in-progress courses yet.
                </div>
              ) : (
                <div className="grid gap-5 lg:grid-cols-2">
                  {continueWatching.map((item) => {
                    const course = item.course || {};
                    return (
                      <article key={course.id} className="dash-surface rounded-2xl border border-[rgba(255,255,255,0.08)] p-4 md:p-5">
                        <div className="grid gap-4 md:grid-cols-[220px,1fr] items-start">
                          <CourseCard course={course} />

                          <div className="space-y-4">
                            <div>
                              <p className="text-[0.72rem] tracking-[0.18em] uppercase text-[#8b8f98] mb-1">Current progress</p>
                              <div className="flex items-end justify-between gap-3">
                                <h3 className="font-['Playfair_Display',serif] text-[1.4rem] text-[#f5f2ec] m-0">{course.title || "Untitled course"}</h3>
                                <span className="text-[0.9rem] font-semibold text-[#f6c56b]">{item.progress || 0}%</span>
                              </div>
                              <div className="mt-3 h-2 rounded-full overflow-hidden bg-[rgba(255,255,255,0.08)]">
                                <div className="h-full rounded-full bg-[linear-gradient(90deg,#d97706,#f59e0b)]" style={{ width: `${item.progress || 0}%` }} />
                              </div>
                              <p className="text-[0.86rem] text-[#9ca3af] mt-3 leading-relaxed">{item.nextAction}</p>
                            </div>

                            <div className="grid sm:grid-cols-3 gap-3 text-[0.84rem]">
                              <div className="rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] p-3">
                                <p className="text-[#8b8f98] mb-1">Forecast</p>
                                <p className="text-[#f5f2ec] font-semibold">{formatDate(item.forecastDate)}</p>
                              </div>
                              <div className="rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] p-3">
                                <p className="text-[#8b8f98] mb-1">Pace</p>
                                <p className="text-[#f5f2ec] font-semibold">{item.velocityPerDay || 0}% / day</p>
                              </div>
                              <div className="rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] p-3">
                                <p className="text-[#8b8f98] mb-1">Last active</p>
                                <p className="text-[#f5f2ec] font-semibold">{formatShortDateTime(item.lastActivityAt)}</p>
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-2.5">
                              <Link
                                to={`/courses/${course.id}`}
                                className="px-4 py-2 rounded-lg no-underline bg-[#d97706] text-[#0c0c0e] font-bold text-[0.84rem]"
                              >
                                Continue course
                              </Link>
                              <button
                                onClick={() => setUnenrollTarget(course)}
                                className="px-4 py-2 rounded-lg border border-[rgba(239,68,68,0.22)] bg-[rgba(239,68,68,0.08)] text-[#f87171] font-bold text-[0.84rem]"
                              >
                                Unenroll
                              </button>
                            </div>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>

            <section>
              <div className="flex items-end justify-between gap-3 mb-4">
                <div>
                  <p className="text-[0.72rem] tracking-[0.18em] uppercase text-[#f6c56b] mb-1">Saved courses</p>
                  <h2 className="font-['Playfair_Display',serif] text-[1.3rem] text-[#f5f2ec]">Courses you liked</h2>
                </div>
                <Link to="/courses" className="text-[0.88rem] font-semibold text-[#f6c56b] no-underline">
                  Find more
                </Link>
              </div>

              {savedCourses.length === 0 ? (
                <div className="dash-surface rounded-2xl border border-[rgba(255,255,255,0.08)] p-6 text-[#9ca3af]">
                  Save courses from their detail pages and they will appear here.
                </div>
              ) : (
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {savedCourses.map((course) => (
                    <div key={course.id} className="space-y-3">
                      <CourseCard course={course} />
                      <div className="dash-surface rounded-xl border border-[rgba(255,255,255,0.08)] p-3 flex items-center gap-2">
                        <Link
                          to={`/courses/${course.id}`}
                          className="px-3 py-1.5 rounded-lg no-underline text-[0.8rem] font-semibold bg-[#d97706] text-[#0c0c0e]"
                        >
                          View Course
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleUnsaveCourse(course.id)}
                          className="px-3 py-1.5 rounded-lg text-[0.8rem] font-semibold border border-[rgba(255,255,255,0.12)] text-[#e8e6e0]"
                        >
                          Remove
                        </button>
                        <span className="ml-auto text-[0.72rem] text-[#9ca3af]">
                          {course.level}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
              <div>
                <div className="flex items-end justify-between gap-3 mb-4">
                  <div>
                    <p className="text-[0.72rem] tracking-[0.18em] uppercase text-[#f6c56b] mb-1">Deadlines</p>
                    <h2 className="font-['Playfair_Display',serif] text-[1.3rem] text-[#f5f2ec]">Reminders and forecast</h2>
                  </div>
                </div>

                {deadlineReminders.length === 0 ? (
                  <div className="dash-surface rounded-2xl border border-[rgba(255,255,255,0.08)] p-6 text-[#9ca3af]">
                    No deadline reminders right now.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {deadlineReminders.map((item) => (
                      <div key={item.course?.id || item.course?.title} className="dash-surface rounded-2xl border border-[rgba(255,255,255,0.08)] p-4">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                          <div>
                            <p className="text-[0.72rem] tracking-[0.18em] uppercase text-[#8b8f98] mb-1">Reminder</p>
                            <h3 className="font-['Playfair_Display',serif] text-[1.15rem] text-[#f5f2ec] m-0">{item.course?.title || "Course"}</h3>
                            <p className="text-[0.88rem] text-[#9ca3af] mt-2 leading-relaxed">{item.reminder}</p>
                          </div>
                          <div className="rounded-xl border border-[rgba(245,158,11,0.18)] bg-[rgba(245,158,11,0.06)] px-3 py-2 text-[#f6c56b] text-[0.84rem] font-semibold shrink-0">
                            {formatCountdown(item.daysRemaining)}
                          </div>
                        </div>
                        <div className="mt-4 grid sm:grid-cols-3 gap-3 text-[0.84rem]">
                          <div className="rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] p-3">
                            <p className="text-[#8b8f98] mb-1">Progress</p>
                            <p className="text-[#f5f2ec] font-semibold">{item.progress || 0}%</p>
                          </div>
                          <div className="rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] p-3">
                            <p className="text-[#8b8f98] mb-1">Forecast</p>
                            <p className="text-[#f5f2ec] font-semibold">{formatDate(item.forecastDate)}</p>
                          </div>
                          <div className="rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] p-3">
                            <p className="text-[#8b8f98] mb-1">Last activity</p>
                            <p className="text-[#f5f2ec] font-semibold">{formatShortDateTime(item.lastActivityAt)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-end justify-between gap-3 mb-4">
                  <div>
                    <p className="text-[0.72rem] tracking-[0.18em] uppercase text-[#f6c56b] mb-1">Forecast</p>
                    <h2 className="font-['Playfair_Display',serif] text-[1.3rem] text-[#f5f2ec]">Completion outlook</h2>
                  </div>
                </div>

                {completionForecast.length === 0 ? (
                  <div className="dash-surface rounded-2xl border border-[rgba(255,255,255,0.08)] p-6 text-[#9ca3af]">
                    You are caught up on every active course.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {completionForecast.map((item) => (
                      <div key={item.course?.id || item.course?.title} className="dash-surface rounded-2xl border border-[rgba(255,255,255,0.08)] p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-[0.72rem] tracking-[0.18em] uppercase text-[#8b8f98] mb-1">Projected finish</p>
                            <h3 className="font-['Playfair_Display',serif] text-[1.15rem] text-[#f5f2ec] m-0">{item.course?.title || "Course"}</h3>
                            <p className="text-[0.88rem] text-[#9ca3af] mt-2">{item.daysRemaining} days remaining</p>
                          </div>
                          <div className="rounded-xl border border-[rgba(52,211,153,0.18)] bg-[rgba(52,211,153,0.08)] px-3 py-2 text-[#86efac] text-[0.84rem] font-semibold shrink-0">
                            {item.confidence}% confidence
                          </div>
                        </div>
                        <p className="mt-3 text-[0.88rem] text-[#9ca3af]">Estimated completion date: {formatDate(item.projectedCompletionDate)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>

            <section>
              <div className="flex items-end justify-between gap-3 mb-4">
                <div>
                  <p className="text-[0.72rem] tracking-[0.18em] uppercase text-[#f6c56b] mb-1">Recommendations</p>
                  <h2 className="font-['Playfair_Display',serif] text-[1.3rem] text-[#f5f2ec]">Picked for your pace and category affinity</h2>
                </div>
              </div>

              {recommendations.length === 0 ? (
                <div className="dash-surface rounded-2xl border border-[rgba(255,255,255,0.08)] p-6 text-[#9ca3af]">
                  No new recommendations right now. Enroll in more courses to refine your feed.
                </div>
              ) : (
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {recommendations.map((item) => (
                    <div key={item.course.id} className="space-y-3">
                      <CourseCard course={item.course} />
                      <div className="dash-surface rounded-2xl border border-[rgba(255,255,255,0.08)] p-4">
                        <div className="flex flex-wrap gap-2 mb-3">
                          {item.reasons.slice(0, 3).map((reason) => (
                            <span key={reason} className="px-2.5 py-1 rounded-full text-[0.72rem] border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] text-[#d4d4d8]">
                              {reason}
                            </span>
                          ))}
                        </div>
                        <Link to={`/courses/${item.course.id}`} className="inline-flex no-underline text-[0.86rem] font-semibold text-[#f6c56b]">
                          View course
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {canManageCreatedCourses && (
              <section>
                <div className="flex items-end justify-between gap-3 mb-4">
                  <div>
                    <p className="text-[0.72rem] tracking-[0.18em] uppercase text-[#f6c56b] mb-1">Instructor studio</p>
                    <h2 className="font-['Playfair_Display',serif] text-[1.3rem] text-[#f5f2ec]">Your created courses</h2>
                  </div>
                  {isInstructor && (
                    <Link to="/course-form" className="text-[0.88rem] font-semibold text-[#f6c56b] no-underline">
                      + Add new course
                    </Link>
                  )}
                </div>

                <div className="grid gap-3 sm:grid-cols-3 mb-4">
                  <div className="dash-surface rounded-xl border border-[rgba(255,255,255,0.08)] p-3">
                    <p className="text-[0.75rem] text-[#8b8f98] uppercase tracking-widest mb-1">Created</p>
                    <p className="font-['Playfair_Display',serif] text-[1.4rem] text-[#f5f2ec]">{instructor.createdCount}</p>
                  </div>
                  <div className="dash-surface rounded-xl border border-[rgba(255,255,255,0.08)] p-3">
                    <p className="text-[0.75rem] text-[#8b8f98] uppercase tracking-widest mb-1">Published</p>
                    <p className="font-['Playfair_Display',serif] text-[1.4rem] text-[#f5f2ec]">{instructor.publishedCount}</p>
                  </div>
                  <div className="dash-surface rounded-xl border border-[rgba(255,255,255,0.08)] p-3">
                    <p className="text-[0.75rem] text-[#8b8f98] uppercase tracking-widest mb-1">Drafts</p>
                    <p className="font-['Playfair_Display',serif] text-[1.4rem] text-[#f5f2ec]">{instructor.draftCount}</p>
                  </div>
                </div>

                {instructor.createdCourses.length === 0 ? (
                  <div className="dash-surface rounded-2xl border border-[rgba(255,255,255,0.08)] p-6 text-[#9ca3af]">
                    You have not created any courses yet.
                  </div>
                ) : (
                  <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                    {instructor.createdCourses.map((course) => (
                      <div key={course.id} className="space-y-3">
                        <CourseCard course={course} />
                        <div className="dash-surface rounded-xl border border-[rgba(255,255,255,0.08)] p-3 flex items-center gap-2">
                          <Link
                            to={`/course-form/${course.id}`}
                            className="px-3 py-1.5 rounded-lg no-underline text-[0.8rem] font-semibold border border-[rgba(255,255,255,0.12)] text-[#e8e6e0]"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => setDeleteTarget(course)}
                            className="px-3 py-1.5 rounded-lg text-[0.8rem] font-semibold border border-[rgba(239,68,68,0.22)] bg-[rgba(239,68,68,0.08)] text-[#f87171]"
                          >
                            Delete
                          </button>
                          <span className="ml-auto text-[0.72rem] text-[#9ca3af]">
                            {course.isPublished ? "Published" : "Draft"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}
          </div>
        )}
      </main>

      <Modal isOpen={Boolean(unenrollTarget)} onClose={() => setUnenrollTarget(null)} title="Unenroll from Course?">
        <p className="text-[#9ca3af] mb-6 text-[0.95rem] leading-relaxed">
          Are you sure you want to unenroll from <strong className="text-[#f5f2ec]">{unenrollTarget?.title}</strong>? You will lose access to all modules.
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => handleUnenroll(unenrollTarget.id)}
            className="flex-1 py-3 rounded-lg font-bold text-[0.9rem] cursor-pointer border-none text-white bg-[#ef4444]"
          >
            Yes, Unenroll
          </button>
          <button
            onClick={() => setUnenrollTarget(null)}
            className="flex-1 py-3 rounded-lg font-medium text-[0.9rem] cursor-pointer text-[#e8e6e0] border border-[rgba(255,255,255,0.12)] bg-transparent"
          >
            Cancel
          </button>
        </div>
      </Modal>

      <Modal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} title="Edit Profile">
        <form onSubmit={handleSaveProfile} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-[0.82rem] text-[#9ca3af]">
            Full Name
            <input
              value={profileForm.name}
              onChange={(event) => updateProfileField("name", event.target.value)}
              aria-invalid={!!profileErrors.name}
              className="w-full rounded-lg px-3 py-2.5 border border-[rgba(255,255,255,0.12)] bg-[#121216] text-[#e8e6e0]"
              maxLength={50}
            />
            {profileErrors.name && <span role="alert" className="text-[#ef4444] text-[0.74rem]">{profileErrors.name}</span>}
          </label>

          <label className="flex flex-col gap-1.5 text-[0.82rem] text-[#9ca3af]">
            Phone
            <input
              value={profileForm.phone}
              onChange={(event) => updateProfileField("phone", event.target.value)}
              aria-invalid={!!profileErrors.phone}
              className="w-full rounded-lg px-3 py-2.5 border border-[rgba(255,255,255,0.12)] bg-[#121216] text-[#e8e6e0]"
            />
            {profileErrors.phone && <span role="alert" className="text-[#ef4444] text-[0.74rem]">{profileErrors.phone}</span>}
          </label>

          <label className="flex flex-col gap-1.5 text-[0.82rem] text-[#9ca3af]">
            Bio
            <textarea
              value={profileForm.bio}
              onChange={(event) => updateProfileField("bio", event.target.value)}
              rows={3}
              maxLength={300}
              aria-invalid={!!profileErrors.bio}
              className="w-full rounded-lg px-3 py-2.5 border border-[rgba(255,255,255,0.12)] bg-[#121216] text-[#e8e6e0] resize-y"
            />
            {profileErrors.bio && <span role="alert" className="text-[#ef4444] text-[0.74rem]">{profileErrors.bio}</span>}
          </label>

          {currentUser.role === "instructor" && (
            <>
              <label className="flex flex-col gap-1.5 text-[0.82rem] text-[#9ca3af]">
                Expertise
                <input
                  value={profileForm.expertise}
                  onChange={(event) => updateProfileField("expertise", event.target.value)}
                  aria-invalid={!!profileErrors.expertise}
                  className="w-full rounded-lg px-3 py-2.5 border border-[rgba(255,255,255,0.12)] bg-[#121216] text-[#e8e6e0]"
                />
                {profileErrors.expertise && <span role="alert" className="text-[#ef4444] text-[0.74rem]">{profileErrors.expertise}</span>}
              </label>

              <label className="flex flex-col gap-1.5 text-[0.82rem] text-[#9ca3af]">
                Website
                <input
                  value={profileForm.website}
                  onChange={(event) => updateProfileField("website", event.target.value)}
                  aria-invalid={!!profileErrors.website}
                  className="w-full rounded-lg px-3 py-2.5 border border-[rgba(255,255,255,0.12)] bg-[#121216] text-[#e8e6e0]"
                />
                {profileErrors.website && <span role="alert" className="text-[#ef4444] text-[0.74rem]">{profileErrors.website}</span>}
              </label>
            </>
          )}

          <label className="flex flex-col gap-1.5 text-[0.82rem] text-[#9ca3af]">
            Profile Image
            <input
              type="file"
              accept="image/*"
              onChange={handleProfileImageChange}
              className="w-full rounded-lg px-3 py-2.5 border border-[rgba(255,255,255,0.12)] bg-[#121216] text-[#e8e6e0]"
            />
            {profileErrors.profileImage && <span role="alert" className="text-[#ef4444] text-[0.74rem]">{profileErrors.profileImage}</span>}
          </label>

          <div className="rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] p-4">
            <p className="text-[0.86rem] font-semibold text-[#f5f2ec] mb-1">Password</p>
            <p className="text-[0.78rem] text-[#9ca3af] mb-3">
              Change your password with a 6-digit verification code sent to your email.
            </p>
            <button
              type="button"
              onClick={openPasswordChange}
              className="px-4 py-2 rounded-lg text-[0.82rem] font-semibold border border-[rgba(245,158,11,0.35)] bg-[rgba(245,158,11,0.1)] text-[#f6c56b]"
            >
              Change Password
            </button>
          </div>

          <div className="flex gap-3 mt-2">
            <button
              type="submit"
              className="flex-1 py-3 rounded-lg font-bold text-[0.9rem] cursor-pointer border-none text-[#0c0c0e] bg-[#d97706]"
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={() => setShowProfileModal(false)}
              className="flex-1 py-3 rounded-lg font-medium text-[0.9rem] cursor-pointer text-[#e8e6e0] border border-[rgba(255,255,255,0.12)] bg-transparent"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={showPasswordModal} onClose={() => setShowPasswordModal(false)} title="Change Password">
        {passwordStatus && (
          <p className="mb-4 rounded-lg border border-[rgba(245,158,11,0.25)] bg-[rgba(245,158,11,0.08)] px-3 py-2 text-[0.85rem] text-[#f6c56b]">
            {passwordStatus}
          </p>
        )}
        <form onSubmit={handleChangePassword} className="space-y-4">
          <label className="flex flex-col gap-1.5 text-[0.82rem] text-[#9ca3af]">
            6-Digit Email Code
            <input
              value={passwordForm.code}
              onChange={(event) => updatePasswordField("code", event.target.value)}
              inputMode="numeric"
              maxLength={6}
              className="w-full rounded-lg px-3 py-2.5 border border-[rgba(255,255,255,0.12)] bg-[#121216] text-[#e8e6e0]"
            />
            {passwordErrors.code && <span role="alert" className="text-[#ef4444] text-[0.74rem]">{passwordErrors.code}</span>}
          </label>

          <label className="flex flex-col gap-1.5 text-[0.82rem] text-[#9ca3af]">
            New Password
            <input
              type="password"
              value={passwordForm.password}
              onChange={(event) => updatePasswordField("password", event.target.value)}
              autoComplete="new-password"
              className="w-full rounded-lg px-3 py-2.5 border border-[rgba(255,255,255,0.12)] bg-[#121216] text-[#e8e6e0]"
            />
            {passwordErrors.password && <span role="alert" className="text-[#ef4444] text-[0.74rem]">{passwordErrors.password}</span>}
          </label>

          <label className="flex flex-col gap-1.5 text-[0.82rem] text-[#9ca3af]">
            Confirm Password
            <input
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(event) => updatePasswordField("confirmPassword", event.target.value)}
              autoComplete="new-password"
              className="w-full rounded-lg px-3 py-2.5 border border-[rgba(255,255,255,0.12)] bg-[#121216] text-[#e8e6e0]"
            />
            {passwordErrors.confirmPassword && <span role="alert" className="text-[#ef4444] text-[0.74rem]">{passwordErrors.confirmPassword}</span>}
          </label>

          <button
            type="submit"
            disabled={isPasswordSubmitting}
            className="w-full py-3 rounded-lg font-bold text-[0.9rem] cursor-pointer border-none text-[#0c0c0e] bg-[#d97706] disabled:opacity-60"
          >
            {isPasswordSubmitting ? "Working..." : "Update Password"}
          </button>
        </form>
      </Modal>

      <Modal isOpen={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} title="Delete Course?">
        <p className="text-[#9ca3af] mb-6 text-[0.95rem] leading-relaxed">
          Are you sure you want to delete <strong className="text-[#f5f2ec]">{deleteTarget?.title}</strong>? This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => handleDeleteCourse(deleteTarget.id)}
            className="flex-1 py-3 rounded-lg font-bold text-[0.9rem] cursor-pointer border-none text-white bg-[#ef4444]"
          >
            Yes, Delete
          </button>
          <button
            onClick={() => setDeleteTarget(null)}
            className="flex-1 py-3 rounded-lg font-medium text-[0.9rem] cursor-pointer text-[#e8e6e0] border border-[rgba(255,255,255,0.12)] bg-transparent"
          >
            Cancel
          </button>
        </div>
      </Modal>
    </div>
  );
}
