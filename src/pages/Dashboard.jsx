import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import CourseCard from "../components/CourseCard";
import Modal from "../components/Modal";
import {
  validateName,
  validatePhone,
  validateBio,
  validateExpertise,
  validateOptionalUrl,
  sanitizeInput,
} from "../utils/validators";

export default function Dashboard() {
  const {
    currentUser,
    courses,
    unenrollCourse,
    unsaveCourse,
    completedCourses,
    getCourseProgress,
    updateProfile,
    deleteCourse,
    addToast,
  } = useAppContext();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [visible, setVisible] = useState(false);
  const [unenrollTarget, setUnenrollTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileErrors, setProfileErrors] = useState({});
  const [animatedCounts, setAnimatedCounts] = useState({
    enrolled: 0,
    completed: 0,
    saved: 0,
    created: 0,
  });
  const [profileForm, setProfileForm] = useState({
    name: "",
    phone: "",
    bio: "",
    expertise: "",
    website: "",
    profileImage: "",
  });

  useEffect(() => {
    if (!currentUser) { navigate("/login"); return; }
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, [currentUser, navigate]);

  const isInstructor = currentUser?.role === "instructor";

  const enrolledCourses = useMemo(
    () => courses.filter((c) => currentUser?.enrolledCourseIds?.includes(c.id) && !completedCourses.has(c.id)),
    [courses, currentUser?.enrolledCourseIds, completedCourses]
  );
  const completedCoursesList = useMemo(
    () => courses.filter((c) => completedCourses.has(c.id)),
    [courses, completedCourses]
  );
  const savedCourses = useMemo(
    () => courses.filter((c) => currentUser?.savedCourseIds?.includes(c.id)),
    [courses, currentUser?.savedCourseIds]
  );
  const createdCourses = useMemo(
    () => courses.filter((c) => currentUser?.createdCourseIds?.includes(c.id)),
    [courses, currentUser?.createdCourseIds]
  );

  const tabs = useMemo(() => [
    { id: "enrolled", label: "Enrolled", count: enrolledCourses.length },
    { id: "completed", label: "Completed", count: completedCoursesList.length },
    { id: "saved", label: "Saved", count: savedCourses.length },
    ...(isInstructor ? [{ id: "created", label: "Created", count: createdCourses.length }] : []),
  ], [enrolledCourses.length, completedCoursesList.length, savedCourses.length, createdCourses.length, isInstructor]);

  const stats = useMemo(
    () => [
      { key: "enrolled", label: "Enrolled", value: enrolledCourses.length },
      { key: "completed", label: "Completed", value: completedCoursesList.length },
      { key: "saved", label: "Saved", value: savedCourses.length },
      ...(isInstructor ? [{ key: "created", label: "Created", value: createdCourses.length }] : []),
    ],
    [enrolledCourses.length, completedCoursesList.length, savedCourses.length, createdCourses.length, isInstructor]
  );

  useEffect(() => {
    const startValues = { enrolled: 0, completed: 0, saved: 0, created: 0 };
    const targetValues = {
      enrolled: enrolledCourses.length,
      completed: completedCoursesList.length,
      saved: savedCourses.length,
      created: createdCourses.length,
    };
    const duration = 650;
    const startTime = performance.now();
    let frame = null;

    const tick = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);

      setAnimatedCounts({
        enrolled: Math.round(startValues.enrolled + (targetValues.enrolled - startValues.enrolled) * eased),
        completed: Math.round(startValues.completed + (targetValues.completed - startValues.completed) * eased),
        saved: Math.round(startValues.saved + (targetValues.saved - startValues.saved) * eased),
        created: Math.round(startValues.created + (targetValues.created - startValues.created) * eased),
      });

      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    };

    frame = requestAnimationFrame(tick);
    return () => {
      if (frame) cancelAnimationFrame(frame);
    };
  }, [enrolledCourses.length, completedCoursesList.length, savedCourses.length, createdCourses.length]);

  const requestedTab = searchParams.get("tab");
  const activeTab = (requestedTab && tabs.some((t) => t.id === requestedTab)) ? requestedTab : "enrolled";

  if (!currentUser) return null;

  const roleColor = isInstructor ? "#d97706" : "#6366f1";

  const getTabData = () => {
    switch (activeTab) {
      case "enrolled": return enrolledCourses;
      case "completed": return completedCoursesList;
      case "saved": return savedCourses;
      case "created": return createdCourses;
      default: return [];
    }
  };

  const activeData = getTabData();

  const emptyMessages = {
    enrolled: "No courses in progress.",
    completed: "You haven't completed any courses yet.",
    saved: "You haven't saved any courses yet.",
    created: "You haven't created any courses yet.",
  };

  const openProfileEditor = () => {
    setProfileForm({
      name: currentUser.name || "",
      phone: currentUser.phone || "",
      bio: currentUser.bio || "",
      expertise: currentUser.expertise || "",
      website: currentUser.website || "",
      profileImage: currentUser.profileImage || "",
    });
    setProfileErrors({});
    setShowProfileModal(true);
  };

  const updateProfileField = (key, value) => {
    setProfileForm((prev) => ({ ...prev, [key]: value }));
    if (profileErrors[key]) {
      setProfileErrors((prev) => ({ ...prev, [key]: "" }));
    }
  };

  const handleProfileImageChange = (event) => {
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
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();

    const errors = {
      name: validateName(profileForm.name),
      phone: validatePhone(profileForm.phone),
      bio: validateBio(profileForm.bio),
      expertise: isInstructor ? validateExpertise(profileForm.expertise) : "",
      website: isInstructor ? validateOptionalUrl(profileForm.website) : "",
      profileImage: "",
    };

    const hasErrors = Object.values(errors).some(Boolean);
    setProfileErrors(errors);
    if (hasErrors) return;

    updateProfile({
      name: sanitizeInput(profileForm.name),
      phone: sanitizeInput(profileForm.phone),
      bio: sanitizeInput(profileForm.bio),
      expertise: isInstructor ? sanitizeInput(profileForm.expertise) : "",
      website: isInstructor ? profileForm.website.trim() : "",
      profileImage: profileForm.profileImage,
    });

    setShowProfileModal(false);
    addToast("Profile updated successfully.", "success");
  };

  const handleDeleteCourse = () => {
    if (!deleteTarget) return;
    const success = deleteCourse(deleteTarget.id);
    if (success) {
      addToast("Course deleted successfully.", "success");
    } else {
      addToast("Could not delete this course.", "error");
    }
    setDeleteTarget(null);
  };

  return (
    <div
      className="relative min-h-screen overflow-hidden bg-[#0c0c0e] text-[#e8e6e0] font-['DM_Sans',sans-serif]"
      style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(14px)", transition: "opacity 0.5s ease, transform 0.5s ease" }}
    >
      <style>{`
        .dash-surface { background: linear-gradient(180deg, rgba(255,255,255,0.045), rgba(255,255,255,0.015)); }
        .dash-stat { transition: transform 220ms ease, border-color 220ms ease, box-shadow 220ms ease; }
        .dash-stat:hover { transform: translateY(-3px); border-color: rgba(217,119,6,0.35); box-shadow: 0 14px 30px rgba(0,0,0,0.25); }
        .dash-pill { transition: all 220ms ease; }
      `}</style>
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute -top-24 left-[12%] h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(217,119,6,0.2)_0%,rgba(217,119,6,0)_72%)] blur-3xl" />
        <div className="absolute bottom-[-90px] right-[8%] h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(245,158,11,0.16)_0%,rgba(245,158,11,0)_72%)] blur-3xl" />
        <div className="absolute inset-0 opacity-[0.14]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)", backgroundSize: "56px 56px" }} />
      </div>

      {/* Profile banner */}
      <header className="relative z-10 bg-[#111114]/85 border-b border-[rgba(255,255,255,0.06)] px-4 md:px-8 py-6 md:py-8 backdrop-blur-sm">
        <div className="max-w-[1100px] mx-auto">
          {/* Profile row */}
          <div className="dash-surface rounded-2xl border border-[rgba(255,255,255,0.08)] p-4 md:p-5 flex items-center gap-4 md:gap-5 mb-6 md:mb-7 flex-wrap">
            {currentUser.profileImage ? (
              <img
                src={currentUser.profileImage}
                alt={`${currentUser.name} profile`}
                className="w-[72px] h-[72px] rounded-full shrink-0 border-2 border-[rgba(217,119,6,0.4)] object-cover"
              />
            ) : (
              <div
                className="w-[72px] h-[72px] rounded-full flex items-center justify-center font-['Playfair_Display',serif] text-[1.8rem] shrink-0 border-2 border-[rgba(217,119,6,0.4)] bg-[rgba(217,119,6,0.15)] text-[#d97706]"
                aria-hidden="true"
              >
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex-1">
              <p className="text-[0.72rem] tracking-[0.18em] uppercase text-[#d97706] mb-1">Your Dashboard</p>
              <h1 className="font-['Playfair_Display',serif] text-[1.8rem] md:text-[2rem] text-[#f5f2ec] mb-1 leading-tight">{currentUser.name}</h1>
              <p className="text-[0.88rem] text-[#6b7280] mb-2">{currentUser.email}</p>
              {!!currentUser.phone && <p className="text-[0.82rem] text-[#9ca3af] mb-1">{currentUser.phone}</p>}
              {!!currentUser.bio && <p className="text-[0.82rem] text-[#9ca3af] max-w-[620px]">{currentUser.bio}</p>}
              <span
                className="inline-block px-3 py-0.5 rounded-full text-[0.72rem] font-bold tracking-widest uppercase"
                style={{ backgroundColor: `${roleColor}20`, color: roleColor, border: `1px solid ${roleColor}40` }}
              >
                {currentUser.role}
              </span>
            </div>
            <div className="flex flex-wrap gap-2.5">
              <button
                onClick={openProfileEditor}
                className="dash-pill px-4 py-2.5 rounded-lg font-bold text-[0.83rem] border border-[rgba(255,255,255,0.14)] text-[#e8e6e0] hover:border-[rgba(217,119,6,0.4)]"
              >
                Edit Profile
              </button>
              <Link
                to="/certificates"
                className="dash-pill px-4 py-2.5 rounded-lg no-underline font-bold text-[0.83rem] border border-[rgba(255,255,255,0.14)] text-[#e8e6e0] hover:border-[rgba(217,119,6,0.4)]"
              >
                Certificates
              </Link>
              {isInstructor && (
                <Link to="/course-form" className="dash-pill px-4 py-2.5 rounded-lg no-underline font-bold text-[0.83rem] bg-[#d97706] text-[#0c0c0e] hover:brightness-110">
                  + Add Course
                </Link>
              )}
            </div>
          </div>

          {/* Stats */}
          <dl className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 pb-1">
            {stats.map((s, idx) => (
              <div key={s.label} className="dash-stat relative overflow-hidden flex flex-col gap-1 rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] px-4 py-3">
                <span
                  className="absolute left-0 top-0 h-full w-1"
                  style={{ background: idx % 2 === 0 ? "linear-gradient(180deg, #d97706, transparent)" : "linear-gradient(180deg, #f59e0b, transparent)" }}
                  aria-hidden="true"
                />
                <dt className="text-[0.75rem] text-[#6b7280] tracking-wide uppercase m-0">{s.label}</dt>
                <dd className="font-['Playfair_Display',serif] text-[1.6rem] md:text-[1.75rem] tabular-nums text-[#f5f2ec] m-0">{animatedCounts[s.key]}</dd>
              </div>
            ))}
          </dl>
        </div>
      </header>

      {/* Tabs + content */}
      <main className="relative z-10 max-w-[1100px] mx-auto px-4 md:px-8 py-6 md:py-8">
        {/* Tab list */}
        <div
          role="tablist"
          aria-label="Dashboard sections"
          className="flex gap-2 mb-6 overflow-x-auto no-scrollbar rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] p-1.5"
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              id={`tab-${tab.id}`}
              aria-selected={activeTab === tab.id}
              aria-controls={`tabpanel-${tab.id}`}
              onClick={() => setSearchParams({ tab: tab.id })}
              className="dash-pill flex items-center gap-2 px-4 py-2.5 border cursor-pointer text-[0.88rem] font-semibold whitespace-nowrap rounded-lg bg-transparent"
              style={{
                color: activeTab === tab.id ? "#f5f2ec" : "var(--color-text-dim)",
                borderColor: activeTab === tab.id ? "rgba(217,119,6,0.35)" : "transparent",
                backgroundColor: activeTab === tab.id ? "rgba(217,119,6,0.12)" : "transparent",
              }}
            >
              {tab.label}
              <span
                className="px-2 py-0.5 rounded-full text-[0.7rem] font-bold"
                style={{
                  backgroundColor: activeTab === tab.id ? "rgba(245,158,11,0.2)" : "var(--color-surface-muted)",
                  color: activeTab === tab.id ? "#f6c56b" : "var(--color-text-dim)",
                }}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Tab panel */}
        <div role="tabpanel" id={`tabpanel-${activeTab}`} aria-labelledby={`tab-${activeTab}`} tabIndex={0} className="dash-surface rounded-2xl border border-[rgba(255,255,255,0.08)] p-4 md:p-5">
          {activeData.length === 0 ? (
            <section className="flex flex-col items-center py-16 px-6 text-center gap-3">
              <span className="text-[0.74rem] uppercase tracking-[0.2em] text-[#6b7280]" aria-hidden="true">
                {activeTab}
              </span>
              <p className="text-[#6b7280] text-[0.92rem]">{emptyMessages[activeTab]}</p>
              {activeTab === "created" ? (
                <Link to="/course-form" className="no-underline font-semibold text-[0.88rem] text-[#d97706]">Create your first course</Link>
              ) : (
                <Link to="/courses" className="no-underline font-semibold text-[0.88rem] text-[#d97706]">Browse courses</Link>
              )}
            </section>
          ) : (
            <ul
              className="grid gap-5 list-none p-0 m-0"
              style={{ gridTemplateColumns: "repeat(auto-fill, minmax(255px, 1fr))" }}
            >
              {activeData.map((course) => {
                const progress = getCourseProgress(course.id);
                return (
                  <li key={course.id} className="flex flex-col gap-2">
                    <CourseCard course={course} />

                    {/* Progress bar */}
                    {activeTab === "enrolled" && progress > 0 && (
                      <div className="flex items-center gap-3" aria-label={`${progress}% complete`}>
                        <div className="flex-1 h-1 rounded-full overflow-hidden bg-[rgba(255,255,255,0.07)]">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${progress}%`, background: "linear-gradient(90deg, #d97706, #f59e0b)" }}
                          />
                        </div>
                        <span className="text-[0.72rem] font-bold shrink-0 text-[#d97706]">{progress}%</span>
                      </div>
                    )}

                    {/* Completed badge */}
                    {activeTab === "completed" && (
                      <span className="self-start text-[0.78rem] font-semibold px-3 py-1 rounded-full border border-[rgba(34,197,94,0.2)] bg-[rgba(34,197,94,0.08)] text-[#22c55e]">
                        Completed
                      </span>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                      {activeTab === "enrolled" && (
                        <button
                          onClick={() => setUnenrollTarget(course)}
                          className="px-4 py-1.5 rounded-md text-[0.8rem] font-medium cursor-pointer border border-[rgba(239,68,68,0.2)] bg-[rgba(239,68,68,0.08)] text-[#ef4444]"
                        >
                          Unenroll
                        </button>
                      )}
                      {activeTab === "saved" && (
                        <button
                          onClick={() => unsaveCourse(course.id)}
                          className="px-4 py-1.5 rounded-md text-[0.8rem] font-medium cursor-pointer border border-[rgba(255,255,255,0.08)] bg-[#1a1a1e] text-[#9ca3af]"
                        >
                          Unsave
                        </button>
                      )}
                      {activeTab === "created" && (
                        <>
                          <Link
                            to={`/course-form/${course.id}`}
                            className="px-4 py-1.5 rounded-md text-[0.8rem] font-medium no-underline border border-[rgba(255,255,255,0.08)] bg-[#1a1a1e] text-[#9ca3af]"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => setDeleteTarget(course)}
                            className="px-4 py-1.5 rounded-md text-[0.8rem] font-medium cursor-pointer border border-[rgba(239,68,68,0.2)] bg-[rgba(239,68,68,0.08)] text-[#ef4444]"
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </main>

      {/* Unenroll modal */}
      <Modal isOpen={Boolean(unenrollTarget)} onClose={() => setUnenrollTarget(null)} title="Unenroll from Course?">
        <p className="text-[#9ca3af] mb-6 text-[0.95rem] leading-relaxed">
          Are you sure you want to unenroll from{" "}
          <strong className="text-[#f5f2ec]">{unenrollTarget?.title}</strong>?
          You will lose access to all modules.
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => { unenrollCourse(unenrollTarget.id); setUnenrollTarget(null); }}
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

      {/* Profile edit modal */}
      <Modal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} title="Edit Profile">
        <form onSubmit={handleSaveProfile} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-[0.82rem] text-[#9ca3af]">
            Full Name
            <input
              value={profileForm.name}
              onChange={(e) => updateProfileField("name", e.target.value)}
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
              onChange={(e) => updateProfileField("phone", e.target.value)}
              aria-invalid={!!profileErrors.phone}
              className="w-full rounded-lg px-3 py-2.5 border border-[rgba(255,255,255,0.12)] bg-[#121216] text-[#e8e6e0]"
            />
            {profileErrors.phone && <span role="alert" className="text-[#ef4444] text-[0.74rem]">{profileErrors.phone}</span>}
          </label>

          <label className="flex flex-col gap-1.5 text-[0.82rem] text-[#9ca3af]">
            Bio
            <textarea
              value={profileForm.bio}
              onChange={(e) => updateProfileField("bio", e.target.value)}
              rows={3}
              maxLength={300}
              aria-invalid={!!profileErrors.bio}
              className="w-full rounded-lg px-3 py-2.5 border border-[rgba(255,255,255,0.12)] bg-[#121216] text-[#e8e6e0] resize-y"
            />
            {profileErrors.bio && <span role="alert" className="text-[#ef4444] text-[0.74rem]">{profileErrors.bio}</span>}
          </label>

          {isInstructor && (
            <>
              <label className="flex flex-col gap-1.5 text-[0.82rem] text-[#9ca3af]">
                Expertise
                <input
                  value={profileForm.expertise}
                  onChange={(e) => updateProfileField("expertise", e.target.value)}
                  aria-invalid={!!profileErrors.expertise}
                  className="w-full rounded-lg px-3 py-2.5 border border-[rgba(255,255,255,0.12)] bg-[#121216] text-[#e8e6e0]"
                />
                {profileErrors.expertise && <span role="alert" className="text-[#ef4444] text-[0.74rem]">{profileErrors.expertise}</span>}
              </label>

              <label className="flex flex-col gap-1.5 text-[0.82rem] text-[#9ca3af]">
                Website
                <input
                  value={profileForm.website}
                  onChange={(e) => updateProfileField("website", e.target.value)}
                  placeholder="https://example.com"
                  aria-invalid={!!profileErrors.website}
                  className="w-full rounded-lg px-3 py-2.5 border border-[rgba(255,255,255,0.12)] bg-[#121216] text-[#e8e6e0]"
                />
                {profileErrors.website && <span role="alert" className="text-[#ef4444] text-[0.74rem]">{profileErrors.website}</span>}
              </label>
            </>
          )}

          <label className="flex flex-col gap-1.5 text-[0.82rem] text-[#9ca3af]">
            Profile Picture
            <input
              type="file"
              accept="image/*"
              onChange={handleProfileImageChange}
              className="w-full rounded-lg px-3 py-2.5 border border-[rgba(255,255,255,0.12)] bg-[#121216] text-[#e8e6e0]"
            />
            {profileForm.profileImage && (
              <div className="flex items-center gap-3 mt-1">
                <img src={profileForm.profileImage} alt="Profile preview" className="w-12 h-12 rounded-full object-cover border border-[rgba(255,255,255,0.12)]" />
                <button
                  type="button"
                  onClick={() => updateProfileField("profileImage", "")}
                  className="text-[0.78rem] text-[#ef4444]"
                >
                  Remove picture
                </button>
              </div>
            )}
            {profileErrors.profileImage && <span className="text-[#ef4444] text-[0.74rem]">{profileErrors.profileImage}</span>}
          </label>

          <div className="flex gap-3 pt-1">
            <button type="submit" className="flex-1 py-2.5 rounded-lg font-semibold bg-[#d97706] text-[#0c0c0e] border-none">
              Save
            </button>
            <button
              type="button"
              onClick={() => setShowProfileModal(false)}
              className="flex-1 py-2.5 rounded-lg font-medium text-[#e8e6e0] border border-[rgba(255,255,255,0.12)]"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete created course modal */}
      <Modal isOpen={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} title="Delete Course?">
        <p className="text-[#9ca3af] mb-6 text-[0.95rem] leading-relaxed">
          Are you sure you want to delete{" "}
          <strong className="text-[#f5f2ec]">{deleteTarget?.title}</strong>?
          This will remove it for all users.
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleDeleteCourse}
            className="flex-1 py-3 rounded-lg font-bold text-[0.9rem] cursor-pointer border-none text-white bg-[#ef4444]"
          >
            Yes, Delete
          </button>
          <button
            type="button"
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