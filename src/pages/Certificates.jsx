import { useMemo } from "react";
import { Link } from "react-router-dom";
import { jsPDF } from "jspdf";
import { useAppContext } from "../context/AppContext";

function formatDate(value) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(value);
}

function buildCertificateId(userId, courseId) {
  const compactDate = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  return `CERT-${userId.toUpperCase()}-${courseId.toUpperCase()}-${compactDate}`;
}

export default function Certificates() {
  const { currentUser, courses, completedCourses } = useAppContext();

  const completedCourseList = useMemo(
    () => courses.filter((course) => completedCourses.has(course.id)),
    [courses, completedCourses]
  );

  function downloadCertificate(course) {
    if (!currentUser) return;

    const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
    const width = doc.internal.pageSize.getWidth();
    const height = doc.internal.pageSize.getHeight();
    const issueDate = formatDate(new Date());
    const certId = buildCertificateId(currentUser.id, course.id);

    doc.setDrawColor(217, 119, 6);
    doc.setLineWidth(2.5);
    doc.rect(24, 24, width - 48, height - 48);

    doc.setDrawColor(245, 158, 11);
    doc.setLineWidth(0.8);
    doc.rect(36, 36, width - 72, height - 72);

    doc.setFont("times", "bold");
    doc.setTextColor(90, 90, 90);
    doc.setFontSize(18);
    doc.text("Courseware", width / 2, 86, { align: "center" });

    doc.setFontSize(44);
    doc.setTextColor(217, 119, 6);
    doc.text("Certificate of Completion", width / 2, 150, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setTextColor(75, 85, 99);
    doc.setFontSize(16);
    doc.text("This certificate is proudly presented to", width / 2, 200, { align: "center" });

    doc.setFont("times", "bold");
    doc.setTextColor(17, 24, 39);
    doc.setFontSize(34);
    doc.text(currentUser.name, width / 2, 250, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setTextColor(75, 85, 99);
    doc.setFontSize(16);
    doc.text("for successfully completing the course", width / 2, 286, { align: "center" });

    doc.setFont("times", "bold");
    doc.setTextColor(217, 119, 6);
    doc.setFontSize(28);
    doc.text(course.title, width / 2, 326, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setTextColor(75, 85, 99);
    doc.setFontSize(14);
    doc.text(`Instructor: ${course.instructorName}`, width / 2, 356, { align: "center" });

    doc.setDrawColor(209, 213, 219);
    doc.setLineWidth(1);
    doc.line(100, height - 132, 290, height - 132);
    doc.line(width - 290, height - 132, width - 100, height - 132);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(55, 65, 81);
    doc.setFontSize(12);
    doc.text("Date Issued", 195, height - 115, { align: "center" });
    doc.text("Authorized by Courseware", width - 195, height - 115, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text(issueDate, 195, height - 98, { align: "center" });
    doc.text("Learning Team", width - 195, height - 98, { align: "center" });

    doc.setFontSize(10);
    doc.setTextColor(107, 114, 128);
    doc.text(`Certificate ID: ${certId}`, width / 2, height - 70, { align: "center" });
    doc.text("Issued via Courseware Learning Platform", width / 2, height - 54, { align: "center" });

    const safeCourse = course.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase();
    const safeUser = currentUser.name.replace(/[^a-z0-9]+/gi, "-").toLowerCase();
    doc.save(`courseware-certificate-${safeUser}-${safeCourse}.pdf`);
  }

  return (
    <main className="min-h-screen bg-base text-[#e8e6e0] px-6 md:px-8 py-10">
      <section className="max-w-[1100px] mx-auto" aria-labelledby="certificates-heading">
        <header className="mb-8">
          <p className="text-[0.72rem] uppercase tracking-[0.2em] text-[#f59e0b] mb-2" aria-hidden="true">Achievements</p>
          <h1 id="certificates-heading" className="font-heading text-[2rem] md:text-[2.3rem] text-text-primary mb-2">Your Certificates</h1>
          <p className="text-text-dim text-[0.95rem] max-w-[720px]">
            Download official completion certificates for courses you have finished on Courseware.
          </p>
        </header>

        {completedCourseList.length === 0 ? (
          <section aria-label="No certificates" className="rounded-xl border border-[rgba(255,255,255,0.07)] bg-surface p-10 text-center">
            <p className="text-[1.05rem] text-text-secondary mb-2">No certificates yet</p>
            <p className="text-text-dim text-[0.92rem] mb-5">Complete a course to unlock your first certificate.</p>
            <Link
              to="/courses"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg font-semibold no-underline text-[0.88rem] bg-brand text-base"
            >
              Browse Courses
            </Link>
          </section>
        ) : (
          <ul aria-label="Certificates" className="grid gap-5 list-none p-0 m-0" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
            {completedCourseList.map((course) => (
              <li key={course.id}>
                <article className="h-full rounded-xl border border-[rgba(255,255,255,0.08)] bg-surface p-5 flex flex-col">
                  <p className="text-[0.72rem] tracking-[0.18em] uppercase text-[#f59e0b] mb-2" aria-hidden="true">Certificate Ready</p>
                  <h2 className="font-heading text-[1.2rem] text-text-primary mb-2 leading-snug">{course.title}</h2>
                  <p className="text-[0.85rem] text-text-dim mb-1">Recipient: {currentUser?.name}</p>
                  <p className="text-[0.82rem] text-text-faint mb-4">Instructor: {course.instructorName}</p>

                  <div className="mt-auto flex gap-2.5">
                    <Link
                      to={`/courses/${course.id}`}
                      aria-label={`View ${course.title} course`}
                      className="flex-1 text-center px-3 py-2.5 rounded-lg text-[0.82rem] no-underline border border-[rgba(255,255,255,0.12)] text-text-secondary"
                    >
                      View Course
                    </Link>
                    <button
                      type="button"
                      onClick={() => downloadCertificate(course)}
                      aria-label={`Download PDF for ${course.title}`}
                      className="flex-1 px-3 py-2.5 rounded-lg text-[0.82rem] font-semibold border-none cursor-pointer bg-brand text-base"
                    >
                      Download PDF
                    </button>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
