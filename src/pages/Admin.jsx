import { useEffect, useMemo, useState } from "react";
import { apiGet, apiPatch, apiPost } from "../utils/api";
import { readToken } from "../utils/authStorage";
import { useAppContext } from "../context/AppContext";
import { AlertIcon, CheckIcon, CloseIcon, ClockIcon, SearchIcon } from "../components/Icons";

const tabs = [
  { id: "overview", label: "Overview" },
  { id: "users", label: "Users" },
  { id: "courses", label: "Courses" },
  { id: "support", label: "Support" },
  { id: "reports", label: "Reports" },
  { id: "audit", label: "Audit" },
];

function formatDate(value) {
  if (!value) return "N/A";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function getId(item) {
  return item?.id || item?._id;
}

function Stat({ label, value, tone = "default" }) {
  const toneClass = tone === "warn" ? "text-[#f59e0b]" : tone === "danger" ? "text-[#f87171]" : "text-text-primary";
  return (
    <article className="rounded-lg border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] p-4">
      <p className="text-[0.72rem] uppercase tracking-[0.14em] text-text-faint">{label}</p>
      <p className={`mt-2 text-2xl font-bold ${toneClass}`}>{value ?? 0}</p>
    </article>
  );
}

function RiskFlags({ flags = [] }) {
  if (!flags.length) {
    return <span className="text-[0.76rem] text-[#34d399]">Clear</span>;
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {flags.map((flag) => (
        <span key={flag} className="rounded-md border border-[rgba(245,158,11,0.32)] bg-[rgba(245,158,11,0.1)] px-2 py-1 text-[0.72rem] text-[#f6c56b]">
          {flag}
        </span>
      ))}
    </div>
  );
}

function IconButton({ children, icon, tone = "default", ...props }) {
  const toneClass =
    tone === "danger"
      ? "border-[rgba(239,68,68,0.35)] text-[#f87171] hover:bg-[rgba(239,68,68,0.1)]"
      : tone === "success"
        ? "border-[rgba(52,211,153,0.35)] text-[#34d399] hover:bg-[rgba(52,211,153,0.1)]"
        : "border-[rgba(255,255,255,0.13)] text-text-secondary hover:bg-[rgba(255,255,255,0.05)]";
  return (
    <button
      type="button"
      className={`inline-flex min-h-9 items-center justify-center gap-1.5 rounded-md border px-2.5 text-[0.78rem] font-semibold transition disabled:cursor-not-allowed disabled:opacity-45 ${toneClass}`}
      {...props}
    >
      {icon}
      <span>{children}</span>
    </button>
  );
}

export default function Admin() {
  const { addToast } = useAppContext();
  const token = readToken();
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState(null);
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [reports, setReports] = useState([]);
  const [supportTickets, setSupportTickets] = useState([]);
  const [supportReplies, setSupportReplies] = useState({});
  const [auditLogs, setAuditLogs] = useState([]);
  const [query, setQuery] = useState("");

  async function loadAdminData() {
    setLoading(true);
    try {
      const [overviewRes, usersRes, coursesRes, reportsRes, supportRes, auditRes] = await Promise.all([
        apiGet("/admin/overview", { token }),
        apiGet("/admin/users?limit=60", { token }),
        apiGet("/admin/courses?limit=60", { token }),
        apiGet("/admin/reports?limit=60", { token }),
        apiGet("/admin/support-tickets?limit=60", { token }),
        apiGet("/admin/audit-logs?limit=60", { token }),
      ]);
      setOverview(overviewRes?.data || null);
      setUsers(usersRes?.data || []);
      setCourses(coursesRes?.data || []);
      setReports(reportsRes?.data || []);
      setSupportTickets(supportRes?.data || []);
      setAuditLogs(auditRes?.data || []);
    } catch (error) {
      addToast(error.message || "Could not load admin data", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAdminData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function runAction(action, successMessage) {
    try {
      await action();
      addToast(successMessage, "success");
      await loadAdminData();
    } catch (error) {
      addToast(error.message || "Admin action failed", "error");
    }
  }

  const filteredUsers = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return users;
    return users.filter((user) => `${user.name} ${user.email} ${user.role}`.toLowerCase().includes(q));
  }, [query, users]);

  const filteredCourses = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return courses;
    return courses.filter((course) => `${course.title} ${course.category} ${course.instructor}`.toLowerCase().includes(q));
  }, [courses, query]);

  const metrics = overview?.metrics || {};

  return (
    <main className="min-h-screen bg-base px-4 py-8 text-text-secondary sm:px-6 md:px-8">
      <section className="mx-auto max-w-[1240px]">
        <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-2 text-[0.72rem] uppercase tracking-[0.2em] text-brand">Admin</p>
            <h1 className="font-heading text-[2rem] leading-tight text-text-primary md:text-[2.35rem]">Control Center</h1>
            <p className="mt-2 max-w-[720px] text-[0.94rem] leading-6 text-text-dim">
              Manage users, course approval, safety reports, risk flags, soft deletes, and audit history.
            </p>
          </div>
          <IconButton icon={<ClockIcon size={15} />} onClick={loadAdminData}>
            Refresh
          </IconButton>
        </header>

        <div className="mb-5 overflow-x-auto rounded-lg border border-[rgba(255,255,255,0.08)] bg-sidebar p-1">
          <div className="flex min-w-max gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`min-h-10 rounded-md px-3 text-[0.86rem] font-semibold transition ${
                  activeTab === tab.id
                    ? "bg-[rgba(217,119,6,0.18)] text-brand"
                    : "text-text-dim hover:text-text-primary"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <section className="rounded-lg border border-[rgba(255,255,255,0.08)] bg-surface p-8 text-center text-text-dim">
            Loading admin data...
          </section>
        ) : null}

        {!loading && activeTab === "overview" ? (
          <div className="space-y-5">
            <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Stat label="Active Users" value={metrics.activeUsers} />
              <Stat label="Active Courses" value={metrics.activeCourses} />
              <Stat label="Pending Courses" value={metrics.pendingCourses} tone="warn" />
              <Stat label="Open Support" value={metrics.openSupportTickets} tone={metrics.openSupportTickets ? "warn" : "default"} />
              <Stat label="Open Reports" value={metrics.openReports} tone={metrics.openReports ? "danger" : "default"} />
            </section>
            <section className="rounded-lg border border-[rgba(255,255,255,0.08)] bg-surface p-4">
              <h2 className="mb-3 text-[1rem] font-bold text-text-primary">Latest Audit Activity</h2>
              <div className="space-y-2">
                {(overview?.recentAuditLogs || []).map((log) => (
                  <article key={getId(log)} className="rounded-md border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.025)] p-3">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-[0.88rem] font-semibold text-text-secondary">{log.action}</p>
                      <time className="text-[0.76rem] text-text-faint">{formatDate(log.createdAt)}</time>
                    </div>
                    <p className="mt-1 text-[0.82rem] text-text-dim">{log.summary || "No summary"}</p>
                  </article>
                ))}
              </div>
            </section>
          </div>
        ) : null}

        {!loading && ["users", "courses"].includes(activeTab) ? (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-[rgba(255,255,255,0.1)] bg-surface px-3 py-2">
            <SearchIcon size={16} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={`Search ${activeTab}`}
              className="min-h-10 flex-1 border-none bg-transparent text-sm text-text-primary outline-none placeholder:text-text-faint"
            />
          </div>
        ) : null}

        {!loading && activeTab === "users" ? (
          <section className="space-y-3">
            {filteredUsers.map((user) => (
              <article key={getId(user)} className="rounded-lg border border-[rgba(255,255,255,0.08)] bg-surface p-4">
                <div className="grid gap-4 lg:grid-cols-[1.2fr,1fr,auto] lg:items-center">
                  <div className="min-w-0">
                    <p className="truncate font-bold text-text-primary">{user.name}</p>
                    <p className="break-words text-[0.82rem] text-text-dim">{user.email}</p>
                    <p className="mt-1 text-[0.78rem] text-text-faint">Joined {formatDate(user.createdAt)}</p>
                  </div>
                  <div>
                    <select
                      value={user.role}
                      onChange={(event) =>
                        runAction(
                          () => apiPatch(`/admin/users/${getId(user)}/role`, { role: event.target.value }, { token }),
                          "User role updated"
                        )
                      }
                      className="mb-3 min-h-10 w-full rounded-md border border-[rgba(255,255,255,0.12)] bg-base px-3 text-sm text-text-secondary lg:max-w-[190px]"
                    >
                      <option value="student">student</option>
                      <option value="instructor">instructor</option>
                      <option value="admin">admin</option>
                    </select>
                    <RiskFlags flags={user.riskFlags} />
                  </div>
                  <div className="flex flex-wrap gap-2 lg:justify-end">
                    {user.isDeleted ? (
                      <IconButton
                        icon={<CheckIcon size={14} />}
                        tone="success"
                        onClick={() => runAction(() => apiPost(`/admin/users/${getId(user)}/restore`, {}, { token }), "User restored")}
                      >
                        Restore
                      </IconButton>
                    ) : (
                      <IconButton
                        icon={<CloseIcon size={14} />}
                        tone="danger"
                        onClick={() =>
                          runAction(
                            () => apiPost(`/admin/users/${getId(user)}/soft-delete`, { reason: "Disabled from admin center" }, { token }),
                            "User soft-deleted"
                          )
                        }
                      >
                        Disable
                      </IconButton>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </section>
        ) : null}

        {!loading && activeTab === "courses" ? (
          <section className="space-y-3">
            {filteredCourses.map((course) => (
              <article key={getId(course)} className="rounded-lg border border-[rgba(255,255,255,0.08)] bg-surface p-4">
                <div className="grid gap-4 xl:grid-cols-[1.2fr,1fr,auto] xl:items-center">
                  <div className="min-w-0">
                    <p className="truncate font-bold text-text-primary">{course.title}</p>
                    <p className="mt-1 text-[0.82rem] text-text-dim">
                      {course.category || "Uncategorized"} - {course.level} - {course.isPublished ? "Published" : "Unpublished"}
                    </p>
                    <p className="mt-1 text-[0.78rem] text-text-faint">Approval: {course.approvalStatus || "draft"}</p>
                  </div>
                  <RiskFlags flags={course.riskFlags} />
                  <div className="flex flex-wrap gap-2 xl:justify-end">
                    <IconButton
                      icon={<CheckIcon size={14} />}
                      tone="success"
                      onClick={() => runAction(() => apiPost(`/admin/courses/${getId(course)}/approve`, { publish: true }, { token }), "Course approved")}
                    >
                      Approve
                    </IconButton>
                    <IconButton
                      icon={<AlertIcon size={14} />}
                      onClick={() =>
                        runAction(
                          () => apiPost(`/admin/courses/${getId(course)}/reject`, { reason: "Needs revision" }, { token }),
                          "Course rejected"
                        )
                      }
                    >
                      Reject
                    </IconButton>
                    {course.isDeleted ? (
                      <IconButton
                        icon={<CheckIcon size={14} />}
                        tone="success"
                        onClick={() => runAction(() => apiPost(`/admin/courses/${getId(course)}/restore`, {}, { token }), "Course restored")}
                      >
                        Restore
                      </IconButton>
                    ) : (
                      <IconButton
                        icon={<CloseIcon size={14} />}
                        tone="danger"
                        onClick={() =>
                          runAction(
                            () => apiPost(`/admin/courses/${getId(course)}/soft-delete`, { reason: "Removed from admin center" }, { token }),
                            "Course soft-deleted"
                          )
                        }
                      >
                        Remove
                      </IconButton>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </section>
        ) : null}

        {!loading && activeTab === "reports" ? (
          <section className="space-y-3">
            {reports.map((report) => (
              <article key={getId(report)} className="rounded-lg border border-[rgba(255,255,255,0.08)] bg-surface p-4">
                <div className="grid gap-4 lg:grid-cols-[1fr,auto] lg:items-center">
                  <div>
                    <div className="mb-2 flex flex-wrap gap-2">
                      <span className="rounded-md bg-[rgba(239,68,68,0.12)] px-2 py-1 text-[0.72rem] font-bold text-[#f87171]">{report.severity}</span>
                      <span className="rounded-md bg-[rgba(255,255,255,0.05)] px-2 py-1 text-[0.72rem] text-text-dim">{report.status}</span>
                      <span className="rounded-md bg-[rgba(255,255,255,0.05)] px-2 py-1 text-[0.72rem] text-text-dim">{report.targetType}</span>
                    </div>
                    <p className="font-semibold text-text-primary">{report.reason}</p>
                    <p className="mt-1 text-[0.84rem] leading-6 text-text-dim">{report.details || "No extra details."}</p>
                    <p className="mt-1 text-[0.76rem] text-text-faint">Reported by {report.reportedBy?.email || "Unknown"} - {formatDate(report.createdAt)}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 lg:justify-end">
                    <IconButton
                      icon={<ClockIcon size={14} />}
                      onClick={() => runAction(() => apiPatch(`/admin/reports/${getId(report)}`, { status: "reviewing" }, { token }), "Report marked reviewing")}
                    >
                      Review
                    </IconButton>
                    <IconButton
                      icon={<CheckIcon size={14} />}
                      tone="success"
                      onClick={() =>
                        runAction(
                          () => apiPatch(`/admin/reports/${getId(report)}`, { status: "resolved", resolutionNote: "Handled in admin center" }, { token }),
                          "Report resolved"
                        )
                      }
                    >
                      Resolve
                    </IconButton>
                    <IconButton
                      icon={<CloseIcon size={14} />}
                      tone="danger"
                      onClick={() =>
                        runAction(
                          () => apiPatch(`/admin/reports/${getId(report)}`, { status: "dismissed", resolutionNote: "Dismissed in admin center" }, { token }),
                          "Report dismissed"
                        )
                      }
                    >
                      Dismiss
                    </IconButton>
                  </div>
                </div>
              </article>
            ))}
            {reports.length === 0 ? <p className="rounded-lg border border-[rgba(255,255,255,0.08)] bg-surface p-6 text-text-dim">No reports yet.</p> : null}
          </section>
        ) : null}

        {!loading && activeTab === "support" ? (
          <section className="space-y-3">
            {supportTickets.map((ticket) => {
              const ticketId = getId(ticket);
              const replyBody = supportReplies[ticketId] || "";
              return (
                <article key={ticketId} className="rounded-lg border border-[rgba(255,255,255,0.08)] bg-surface p-4">
                  <div className="grid gap-4 lg:grid-cols-[1fr,420px]">
                    <div className="min-w-0">
                      <div className="mb-2 flex flex-wrap gap-2">
                        <span className="rounded-md bg-[rgba(217,119,6,0.14)] px-2 py-1 text-[0.72rem] font-bold text-brand">{ticket.status}</span>
                        <span className="rounded-md bg-[rgba(255,255,255,0.05)] px-2 py-1 text-[0.72rem] text-text-dim">{ticket.topic || "Other"}</span>
                      </div>
                      <p className="font-bold text-text-primary">{ticket.title}</p>
                      <p className="mt-1 break-words text-[0.84rem] text-text-dim">
                        From {ticket.requesterName || "Unknown"} - {ticket.requesterEmail}
                      </p>
                      <p className="mt-3 whitespace-pre-wrap break-words rounded-md border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.03)] p-3 text-[0.88rem] leading-6 text-text-secondary">
                        {ticket.description}
                      </p>
                      {ticket.adminReply ? (
                        <p className="mt-3 whitespace-pre-wrap break-words rounded-md border border-[rgba(52,211,153,0.25)] bg-[rgba(52,211,153,0.08)] p-3 text-[0.82rem] leading-6 text-[#bbf7d0]">
                          Last reply: {ticket.adminReply}
                        </p>
                      ) : null}
                    </div>
                    <div className="flex min-w-0 flex-col gap-2">
                      <label className="text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-text-faint">
                        Admin email reply
                      </label>
                      <textarea
                        value={replyBody}
                        onChange={(event) =>
                          setSupportReplies((prev) => ({ ...prev, [ticketId]: event.target.value }))
                        }
                        rows={6}
                        className="min-h-[140px] resize-y rounded-md border border-[rgba(255,255,255,0.12)] bg-base px-3 py-2 text-sm leading-6 text-text-primary outline-none placeholder:text-text-faint"
                        placeholder="Write the email body to send to this requester..."
                      />
                      <div className="flex flex-wrap gap-2">
                        <IconButton
                          icon={<ClockIcon size={14} />}
                          disabled={!replyBody.trim()}
                          onClick={() =>
                            runAction(
                              () => apiPost(`/admin/support-tickets/${ticketId}/reply`, { body: replyBody, status: "in-progress" }, { token }),
                              "Support reply sent"
                            )
                          }
                        >
                          Send Reply
                        </IconButton>
                        <IconButton
                          icon={<CheckIcon size={14} />}
                          tone="success"
                          disabled={!replyBody.trim()}
                          onClick={() =>
                            runAction(
                              () => apiPost(`/admin/support-tickets/${ticketId}/reply`, { body: replyBody, status: "resolved" }, { token }),
                              "Support reply sent and ticket resolved"
                            )
                          }
                        >
                          Send & Resolve
                        </IconButton>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
            {supportTickets.length === 0 ? <p className="rounded-lg border border-[rgba(255,255,255,0.08)] bg-surface p-6 text-text-dim">No support tickets yet.</p> : null}
          </section>
        ) : null}

        {!loading && activeTab === "audit" ? (
          <section className="space-y-2">
            {auditLogs.map((log) => (
              <article key={getId(log)} className="rounded-lg border border-[rgba(255,255,255,0.08)] bg-surface p-4">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <p className="font-semibold text-text-primary">{log.action}</p>
                  <time className="text-[0.76rem] text-text-faint">{formatDate(log.createdAt)}</time>
                </div>
                <p className="mt-1 text-[0.84rem] text-text-dim">{log.summary || "No summary"}</p>
                <p className="mt-1 break-words text-[0.76rem] text-text-faint">
                  Actor: {log.actorId?.email || log.actorEmail || "System"} - Target: {log.targetType}
                </p>
              </article>
            ))}
          </section>
        ) : null}
      </section>
    </main>
  );
}
