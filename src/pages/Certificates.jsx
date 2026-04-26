import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { jsPDF } from "jspdf";
import { useAppContext } from "../context/AppContext";
import { apiPost } from "../utils/api";
import { readToken } from "../utils/authStorage";

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

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

async function loadImageDataUrl(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to load image: ${url}`);
  }
  const blob = await response.blob();
  return blobToDataUrl(blob);
}

// QR Code Modal Component
function QRCodeModal({ isOpen, certId, onClose }) {
  if (!isOpen) return null;

  // Use hash routing URL format
  const verificationUrl = `${window.location.origin}/#/verify/${certId}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
    verificationUrl
  )}`;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-surface rounded-xl p-6 max-w-sm w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold text-text-primary mb-4">
          Certificate QR Code
        </h3>
        <div className="flex justify-center mb-4 bg-white p-4 rounded-lg">
          <img src={qrUrl} alt="Certificate QR Code" className="w-64 h-64" />
        </div>
        <p className="text-sm text-text-dim mb-4 text-center">
          Scan to verify certificate authenticity
        </p>
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-lg bg-surface border border-[rgba(255,255,255,0.12)] text-text-secondary hover:bg-opacity-80 transition-colors"
          >
            Close
          </button>
          <a
            href={qrUrl}
            download="certificate-qr-code.png"
            className="flex-1 px-4 py-2 rounded-lg bg-brand text-base font-semibold text-center no-underline hover:bg-opacity-90 transition-colors"
          >
            Download QR
          </a>
        </div>
      </div>
    </div>
  );
}

// Share Modal Component
function ShareModal({ isOpen, certId, courseName, onClose }) {
  const [copied, setCopied] = useState(false);
  // Use hash routing URL format
  const verificationUrl = `${window.location.origin}/#/verify/${certId}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(verificationUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const linkedInShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(verificationUrl)}`;

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-surface rounded-xl p-6 max-w-sm w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold text-text-primary mb-4">
          Share Certificate
        </h3>

        <div className="space-y-3 mb-6">
          {/* Copy Link Button */}
          <button
            onClick={handleCopyLink}
            className="w-full px-4 py-3 rounded-lg border border-[rgba(255,255,255,0.12)] text-text-secondary hover:bg-surface-hover transition-colors text-sm flex items-center justify-between"
          >
            <span>📋 {copied ? "Copied!" : "Copy Verification Link"}</span>
            {copied && <span className="text-[#f59e0b]">✓</span>}
          </button>

          {/* LinkedIn Share Button */}
          <a
            href={linkedInShareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full px-4 py-3 rounded-lg bg-[#0A66C2] text-white hover:bg-[#084699] transition-colors text-sm font-semibold text-center no-underline block"
          >
            🔗 Share on LinkedIn
          </a>

          {/* Twitter Share Button */}
          <a
            href={`https://twitter.com/intent/tweet?text=I%20just%20completed%20the%20"${encodeURIComponent(courseName)}"%20course%20on%20Courseware!%20%F0%9F%8E%93%20Verify%20my%20certificate:%20${encodeURIComponent(verificationUrl)}&hashtags=Learning,CourseCompletion,Courseware`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full px-4 py-3 rounded-lg bg-[#1DA1F2] text-white hover:bg-[#1a8cd8] transition-colors text-sm font-semibold text-center no-underline block"
          >
            𝕏 Share on X
          </a>

          {/* Email Share Button */}
          <a
            href={`mailto:?subject=Check%20Out%20My%20Course%20Certificate!&body=I%20just%20completed%20the%20${encodeURIComponent(courseName)}%20course%20on%20Courseware!%20You%20can%20verify%20my%20certificate%20here:%20${encodeURIComponent(verificationUrl)}`}
            className="w-full px-4 py-3 rounded-lg border border-[rgba(255,255,255,0.12)] text-text-secondary hover:bg-surface-hover transition-colors text-sm flex items-center justify-center gap-2"
          >
            ✉️ Share via Email
          </a>
        </div>

        <div className="pt-4 border-t border-[rgba(255,255,255,0.1)]">
          <p className="text-xs text-text-faint mb-3">Direct verification link:</p>
          <div className="bg-[rgba(255,255,255,0.05)] p-2 rounded text-xs text-text-dim break-all font-mono">
            {verificationUrl}
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-4 px-4 py-2 rounded-lg bg-surface border border-[rgba(255,255,255,0.12)] text-text-secondary hover:bg-opacity-80 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}

export default function Certificates() {
  const { currentUser, courses, completedCourses, progress } = useAppContext();
  const [selectedCertId, setSelectedCertId] = useState(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareCertData, setShareCertData] = useState({ certId: "", courseName: "" });
  const [issuedCertByCourse, setIssuedCertByCourse] = useState({});

  const completedCourseList = useMemo(
    () => {
      const completedProgressIds = new Set(
        progress
          .filter((row) => row.completed || Number(row.percentage || 0) >= 100)
          .map((row) => String(row.courseId?._id || row.courseId?.id || row.courseId || ""))
          .filter(Boolean)
      );

      return courses.filter((course) => {
        const courseId = String(course.id);
        return completedCourses.has(courseId) || completedProgressIds.has(courseId);
      });
    },
    [courses, completedCourses, progress]
  );

  async function ensureCertificateId(course) {
    const courseKey = String(course.id);
    if (issuedCertByCourse[courseKey]) {
      return issuedCertByCourse[courseKey];
    }

    const fallbackId = buildCertificateId(currentUser.id, course.id);
    const token = readToken();
    if (!token || !currentUser?.id) {
      return fallbackId;
    }

    try {
      const response = await apiPost(
        "/certificates",
        {
          userId: currentUser.id,
          courseId: course.id,
        },
        { token }
      );
      const signedId = response?.data?.signedCertificateId;
      if (signedId) {
        setIssuedCertByCourse((prev) => ({ ...prev, [courseKey]: signedId }));
        return signedId;
      }
    } catch {
      // Fall back to local deterministic ID if backend issuance fails.
    }

    return fallbackId;
  }

  async function downloadCertificate(course) {
    if (!currentUser) return;

    const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
    const width = doc.internal.pageSize.getWidth();
    const height = doc.internal.pageSize.getHeight();
    const issueDate = formatDate(new Date());
    const certId = await ensureCertificateId(course);
    
    // Generate verification URL with hash routing
    const verificationUrl = `${window.location.origin}/#/verify/${certId}`;

    // Borders
    doc.setDrawColor(217, 119, 6);
    doc.setLineWidth(2.5);
    doc.rect(24, 24, width - 48, height - 48);

    doc.setDrawColor(245, 158, 11);
    doc.setLineWidth(0.8);
    doc.rect(36, 36, width - 72, height - 72);

    // Top accent bar
    doc.setFillColor(255, 248, 236);
    doc.roundedRect(52, 52, width - 104, 40, 6, 6, "F");

    // Header
    doc.setFont("times", "bold");
    doc.setTextColor(90, 90, 90);
    doc.setFontSize(16);
    doc.text("Courseware", width / 2, 78, { align: "center" });

    // Title
    doc.setFontSize(42);
    doc.setTextColor(217, 119, 6);
    doc.text("Certificate of Completion", width / 2, 142, { align: "center" });

    // Recipient intro
    doc.setFont("helvetica", "normal");
    doc.setTextColor(75, 85, 99);
    doc.setFontSize(15);
    doc.text("This certificate is proudly presented to", width / 2, 188, { align: "center" });

    // Recipient name
    doc.setFont("times", "bold");
    doc.setTextColor(17, 24, 39);
    doc.setFontSize(36);
    doc.text(currentUser.name, width / 2, 238, { align: "center" });

    // Course intro
    doc.setFont("helvetica", "normal");
    doc.setTextColor(75, 85, 99);
    doc.setFontSize(15);
    doc.text("for successfully completing the course", width / 2, 274, { align: "center" });

    // Course name
    doc.setFont("times", "bold");
    doc.setTextColor(217, 119, 6);
    doc.setFontSize(30);
    const courseTitleLines = doc.splitTextToSize(course.title, width - 240);
    doc.text(courseTitleLines, width / 2, 316, { align: "center" });

    // Instructor
    doc.setFont("helvetica", "normal");
    doc.setTextColor(75, 85, 99);
    doc.setFontSize(14);
    doc.text(`Instructor: ${course.instructorName}`, width / 2, 358, { align: "center" });

    // Dedicated fixed QR panel (top-right) so placement is deterministic
    const qrPanelW = 124;
    const qrPanelH = 114;
    const qrPanelX = width - qrPanelW - 54;
    const qrPanelY = height - qrPanelH - 38;
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(qrPanelX, qrPanelY, qrPanelW, qrPanelH, 8, 8, "F");
    doc.setDrawColor(229, 231, 235);
    doc.roundedRect(qrPanelX, qrPanelY, qrPanelW, qrPanelH, 8, 8, "S");
    doc.setFont("helvetica", "bold");
    doc.setTextColor(55, 65, 81);
    doc.setFontSize(10);
    doc.text("Scan To Verify", qrPanelX + qrPanelW / 2, qrPanelY + 16, {
      align: "center",
    });

    // QR image inside panel
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(verificationUrl)}`;
    try {
      const qrDataUrl = await loadImageDataUrl(qrUrl);
      doc.addImage(qrDataUrl, "PNG", qrPanelX + 23, qrPanelY + 20, 78, 78);
    } catch {
      doc.setTextColor(120, 120, 120);
      doc.setFontSize(9);
      doc.text("QR unavailable", qrPanelX + qrPanelW / 2, qrPanelY + 62, {
        align: "center",
      });
    }
    doc.setFont("helvetica", "normal");
    doc.setTextColor(75, 85, 99);
    doc.setFontSize(8);
    doc.text("Works on mobile camera", qrPanelX + qrPanelW / 2, qrPanelY + 106, {
      align: "center",
    });

    // Bottom signature guides
    doc.setDrawColor(209, 213, 219);
    doc.setLineWidth(1);
    doc.line(114, height - 154, 314, height - 154);
    doc.line(336, height - 154, 536, height - 154);

    // Labels
    doc.setFont("helvetica", "bold");
    doc.setTextColor(55, 65, 81);
    doc.setFontSize(11);
    doc.text("Date Issued", 214, height - 132, { align: "center" });
    doc.text("Authorized by Courseware", 436, height - 132, { align: "center" });

    // Values
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(issueDate, 214, height - 114, { align: "center" });
    doc.text("Learning Platform", 436, height - 114, { align: "center" });

    // Certificate ID
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(107, 114, 128);
    const certInfoX = 110;
    const certIdLines = doc.splitTextToSize(`Certificate ID: ${certId}`, 410);
    doc.text(certIdLines, certInfoX, height - 84, { align: "left" });

    // Verification link (short label + clickable full link)
    doc.setFontSize(9);
    doc.setTextColor(75, 85, 99);
    doc.text("Verify this certificate online:", certInfoX, height - 66, { align: "left" });
    doc.setTextColor(217, 119, 6);
    doc.setFont("helvetica", "bold");
    const linkText = "Open Verification Page";
    const linkWidth = doc.getTextWidth(linkText);
    const linkX = certInfoX;
    const linkY = height - 52;
    doc.textWithLink(linkText, linkX, linkY, { url: verificationUrl });
    doc.setDrawColor(217, 119, 6);
    doc.line(linkX, linkY + 2, linkX + linkWidth, linkY + 2);

    const safeCourse = course.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase();
    const safeUser = currentUser.name.replace(/[^a-z0-9]+/gi, "-").toLowerCase();
    doc.save(`courseware-certificate-${safeUser}-${safeCourse}.pdf`);
  }

  return (
    <main className="min-h-screen bg-base text-[#e8e6e0] px-4 sm:px-6 md:px-8 py-8 md:py-10">
      <section className="max-w-[1100px] mx-auto" aria-labelledby="certificates-heading">
        <header className="mb-8">
          <p className="text-[0.72rem] uppercase tracking-[0.2em] text-[#f59e0b] mb-2" aria-hidden="true">Achievements</p>
          <h1 id="certificates-heading" className="font-heading text-[2rem] md:text-[2.3rem] text-text-primary mb-2">Your Certificates</h1>
          <p className="text-text-dim text-[0.95rem] max-w-[720px]">
            Download official completion certificates for courses you have finished on Courseware. Share and verify your achievements with confidence.
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
          <ul aria-label="Certificates" className="grid gap-4 sm:gap-6 list-none p-0 m-0" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 300px), 1fr))" }}>
            {completedCourseList.map((course) => {
              const certId =
                issuedCertByCourse[String(course.id)] ||
                buildCertificateId(currentUser.id, course.id);
              return (
                <li key={course.id}>
                  <article className="h-full overflow-hidden rounded-2xl border border-[rgba(255,255,255,0.1)] bg-[linear-gradient(170deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] shadow-[0_20px_40px_rgba(0,0,0,0.28)] flex flex-col">
                    <div className="relative h-[170px] bg-[rgba(255,255,255,0.04)]">
                      {course.thumbnail ? (
                        <img
                          src={course.thumbnail}
                          alt={`${course.title} course cover`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#f59e0b] text-sm tracking-[0.16em] uppercase">
                          Certificate Course
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[rgba(7,11,20,0.92)] via-[rgba(7,11,20,0.35)] to-transparent" />
                      <p className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-[rgba(245,158,11,0.16)] border border-[rgba(245,158,11,0.45)] text-[0.68rem] tracking-[0.16em] uppercase text-[#f59e0b]">
                        Certificate Ready
                      </p>
                      <h2 className="absolute left-4 right-4 bottom-3 font-heading text-[1.18rem] text-white leading-snug">
                        {course.title}
                      </h2>
                    </div>

                    <div className="p-5 flex flex-col gap-4 flex-1">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[0.8rem]">
                        <div className="rounded-lg border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] p-2.5">
                          <p className="text-text-faint mb-1">Recipient</p>
                          <p className="text-text-secondary font-medium truncate">{currentUser?.name}</p>
                        </div>
                        <div className="rounded-lg border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] p-2.5">
                          <p className="text-text-faint mb-1">Instructor</p>
                          <p className="text-text-secondary font-medium truncate">{course.instructorName}</p>
                        </div>
                      </div>

                      <div className="rounded-lg border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] p-3">
                        <p className="text-[0.72rem] text-text-faint mb-1">Certificate ID</p>
                        <p className="text-[0.8rem] text-text-secondary font-mono break-all">{certId}</p>
                      </div>

                      <div className="mt-auto space-y-2.5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          <Link
                            to={`/courses/${course.id}`}
                            aria-label={`View ${course.title} course`}
                            className="text-center px-3 py-2.5 rounded-lg text-[0.82rem] no-underline border border-[rgba(255,255,255,0.14)] text-text-secondary hover:bg-[rgba(255,255,255,0.05)] transition-colors"
                          >
                            View Course
                          </Link>
                          <button
                            type="button"
                            onClick={() => downloadCertificate(course)}
                            aria-label={`Download PDF for ${course.title}`}
                            className="px-3 py-2.5 rounded-lg text-[0.82rem] font-semibold border-none cursor-pointer bg-brand text-base hover:bg-opacity-90 transition-colors"
                          >
                            Download PDF
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          <button
                            type="button"
                            onClick={async () => {
                              const resolvedCertId = await ensureCertificateId(course);
                              setSelectedCertId(resolvedCertId);
                              setShowQRModal(true);
                            }}
                            aria-label={`View QR code for ${course.title}`}
                            className="px-3 py-2 rounded-lg text-[0.8rem] border border-[rgba(255,255,255,0.14)] text-text-secondary hover:bg-[rgba(255,255,255,0.05)] transition-colors"
                          >
                            QR Code
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              const resolvedCertId = await ensureCertificateId(course);
                              setShareCertData({ certId: resolvedCertId, courseName: course.title });
                              setShowShareModal(true);
                            }}
                            aria-label={`Share ${course.title} certificate`}
                            className="px-3 py-2 rounded-lg text-[0.8rem] border border-[rgba(255,255,255,0.14)] text-text-secondary hover:bg-[rgba(255,255,255,0.05)] transition-colors"
                          >
                            Share
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Modals */}
      <QRCodeModal
        isOpen={showQRModal && selectedCertId}
        certId={selectedCertId}
        onClose={() => setShowQRModal(false)}
      />
      <ShareModal
        isOpen={showShareModal && shareCertData.certId}
        certId={shareCertData.certId}
        courseName={shareCertData.courseName}
        onClose={() => setShowShareModal(false)}
      />
    </main>
  );
}
