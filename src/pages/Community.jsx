import { useEffect, useMemo, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { apiGet, apiPost } from "../utils/api";
import { readToken } from "../utils/authStorage";

function formatTime(value) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function ThreadItem({ thread, isActive, onOpen, onUpvote, currentUserId }) {
  const upvotedByMe = (thread.upvoteUserIds || []).some((id) => String(id) === String(currentUserId));

  return (
    <button
      type="button"
      onClick={onOpen}
      className={`w-full text-left rounded-xl border p-4 transition-colors ${
        isActive
          ? "border-[#f59e0b] bg-[rgba(245,158,11,0.08)]"
          : "border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.05)]"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-text-primary text-[0.98rem] font-semibold leading-snug">{thread.title}</p>
          <p className="text-text-dim text-[0.82rem] mt-1 line-clamp-2">{thread.body}</p>
        </div>
        <span className={`text-[0.7rem] uppercase tracking-[0.12em] px-2 py-1 rounded-full ${
          thread.status === "published"
            ? "bg-[rgba(16,185,129,0.12)] text-[#34d399]"
            : thread.status === "pending"
              ? "bg-[rgba(245,158,11,0.12)] text-[#f59e0b]"
              : "bg-[rgba(239,68,68,0.14)] text-[#f87171]"
        }`}>
          {thread.status}
        </span>
      </div>

      <div className="mt-3 flex items-center justify-between text-[0.76rem] text-text-faint">
        <span>
          by {thread.createdBy?.name || "Unknown"} • {formatTime(thread.createdAt)}
        </span>
        <div className="flex items-center gap-2">
          <span>{thread.commentCount || 0} comments</span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onUpvote(thread.id || thread._id);
            }}
            className={`px-2.5 py-1 rounded-md border text-[0.74rem] ${
              upvotedByMe
                ? "border-[#f59e0b] text-[#f59e0b]"
                : "border-[rgba(255,255,255,0.12)] text-text-secondary"
            }`}
          >
            ▲ {thread.upvotesCount || 0}
          </button>
        </div>
      </div>
    </button>
  );
}

function ModerationQueue({ queue, onModerateThread, onModerateComment }) {
  return (
    <section className="rounded-2xl border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] p-5">
      <h3 className="font-heading text-[1.15rem] text-text-primary mb-4">Moderation Queue</h3>

      <div className="grid lg:grid-cols-2 gap-4">
        <div>
          <p className="text-[0.78rem] uppercase tracking-[0.14em] text-[#f59e0b] mb-2">Pending Threads</p>
          <div className="space-y-2 max-h-[260px] overflow-auto pr-1">
            {queue.threads.length === 0 ? (
              <p className="text-text-faint text-[0.84rem]">No pending threads.</p>
            ) : (
              queue.threads.map((thread) => (
                <article key={thread.id || thread._id} className="rounded-lg border border-[rgba(255,255,255,0.08)] p-3">
                  <p className="text-text-secondary text-[0.88rem] font-semibold">{thread.title}</p>
                  <p className="text-text-faint text-[0.78rem] mt-1 line-clamp-2">{thread.body}</p>
                  <div className="mt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => onModerateThread(thread.id || thread._id, "approve")}
                      className="px-2.5 py-1 rounded-md text-[0.75rem] bg-[rgba(16,185,129,0.18)] text-[#34d399]"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => onModerateThread(thread.id || thread._id, "reject")}
                      className="px-2.5 py-1 rounded-md text-[0.75rem] bg-[rgba(239,68,68,0.18)] text-[#f87171]"
                    >
                      Reject
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>

        <div>
          <p className="text-[0.78rem] uppercase tracking-[0.14em] text-[#f59e0b] mb-2">Pending Comments</p>
          <div className="space-y-2 max-h-[260px] overflow-auto pr-1">
            {queue.comments.length === 0 ? (
              <p className="text-text-faint text-[0.84rem]">No pending comments.</p>
            ) : (
              queue.comments.map((comment) => (
                <article key={comment.id || comment._id} className="rounded-lg border border-[rgba(255,255,255,0.08)] p-3">
                  <p className="text-text-faint text-[0.74rem] mb-1">Thread: {comment.threadId?.title || "Unknown"}</p>
                  <p className="text-text-secondary text-[0.84rem] line-clamp-2">{comment.body}</p>
                  <div className="mt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => onModerateComment(comment.id || comment._id, "approve")}
                      className="px-2.5 py-1 rounded-md text-[0.75rem] bg-[rgba(16,185,129,0.18)] text-[#34d399]"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => onModerateComment(comment.id || comment._id, "reject")}
                      className="px-2.5 py-1 rounded-md text-[0.75rem] bg-[rgba(239,68,68,0.18)] text-[#f87171]"
                    >
                      Reject
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Community() {
  const { currentUser, courses, addToast } = useAppContext();
  const token = readToken();

  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [threads, setThreads] = useState([]);
  const [selectedThreadId, setSelectedThreadId] = useState("");
  const [selectedThreadData, setSelectedThreadData] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);

  const [threadTitle, setThreadTitle] = useState("");
  const [threadBody, setThreadBody] = useState("");
  const [commentBody, setCommentBody] = useState("");

  const [moderationQueue, setModerationQueue] = useState({ threads: [], comments: [] });

  const canModerate = ["admin", "instructor"].includes(currentUser?.role);

  const selectedThread = useMemo(
    () => threads.find((thread) => String(thread.id || thread._id) === String(selectedThreadId)) || null,
    [threads, selectedThreadId]
  );

  async function fetchThreads() {
    if (!token) return;
    setLoading(true);
    try {
      const query = selectedCourseId ? `?courseId=${selectedCourseId}` : "";
      const response = await apiGet(`/community/threads${query}`, { token });
      const data = response?.data || [];
      setThreads(data);
      if (data.length > 0 && !selectedThreadId) {
        setSelectedThreadId(String(data[0].id || data[0]._id));
      }
    } catch (error) {
      addToast(error.message || "Failed to load community threads", "error");
    } finally {
      setLoading(false);
    }
  }

  async function fetchThreadDetail(threadId) {
    if (!token || !threadId) return;
    try {
      const response = await apiGet(`/community/threads/${threadId}`, { token });
      setSelectedThreadData(response?.data?.thread || null);
      setComments(response?.data?.comments || []);
    } catch (error) {
      setSelectedThreadData(null);
      setComments([]);
      addToast(error.message || "Failed to load thread details", "error");
    }
  }

  async function fetchModerationQueue() {
    if (!token || !canModerate) return;
    try {
      const response = await apiGet("/community/moderation/queue", { token });
      setModerationQueue(response?.data || { threads: [], comments: [] });
    } catch {
      // Non-critical UI path.
    }
  }

  useEffect(() => {
    fetchThreads();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCourseId]);

  useEffect(() => {
    if (selectedThreadId) {
      fetchThreadDetail(selectedThreadId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedThreadId]);

  useEffect(() => {
    fetchModerationQueue();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canModerate]);

  async function handleCreateThread(e) {
    e.preventDefault();
    if (!threadTitle.trim() || !threadBody.trim() || !selectedCourseId) {
      addToast("Select a course and provide title/body", "warning");
      return;
    }
    try {
      await apiPost(
        "/community/threads",
        {
          courseId: selectedCourseId,
          title: threadTitle.trim(),
          body: threadBody.trim(),
        },
        { token }
      );
      setThreadTitle("");
      setThreadBody("");
      const created = response?.data;
      const isPending = created?.status === "pending";
      addToast(
        isPending
          ? "Thread submitted for review — it will appear once approved"
          : "Thread posted",
        isPending ? "warning" : "success"
      );
      fetchThreads();
      fetchModerationQueue();
    } catch (error) {
      addToast(error.message || "Could not create thread", "error");
    }
  }

  async function handleAddComment(e) {
    e.preventDefault();
    if (!selectedThreadId || !commentBody.trim()) return;
    try {
      await apiPost(
        `/community/threads/${selectedThreadId}/comments`,
        { body: commentBody.trim() },
        { token }
      );
      setCommentBody("");
      fetchThreadDetail(selectedThreadId);
      fetchThreads();
      fetchModerationQueue();
    } catch (error) {
      addToast(error.message || "Could not add comment", "error");
    }
  }

  async function handleThreadUpvote(threadId) {
    try {
      await apiPost(`/community/threads/${threadId}/upvote`, {}, { token });
      fetchThreads();
      if (selectedThreadId === String(threadId)) {
        fetchThreadDetail(threadId);
      }
    } catch (error) {
      addToast(error.message || "Upvote failed", "error");
    }
  }

  async function handleCommentUpvote(commentId) {
    try {
      await apiPost(`/community/comments/${commentId}/upvote`, {}, { token });
      fetchThreadDetail(selectedThreadId);
    } catch (error) {
      addToast(error.message || "Upvote failed", "error");
    }
  }

  async function handleAcceptAnswer(commentId) {
    try {
      await apiPost(`/community/comments/${commentId}/accept`, {}, { token });
      addToast("Accepted answer updated", "success");
      fetchThreadDetail(selectedThreadId);
      fetchThreads();
    } catch (error) {
      addToast(error.message || "Could not accept answer", "error");
    }
  }

  async function handleModerateThread(threadId, action) {
    try {
      await apiPost(`/community/moderation/threads/${threadId}`, { action }, { token });
      addToast(`Thread ${action}d`, "success");
      fetchThreads();
      fetchModerationQueue();
    } catch (error) {
      addToast(error.message || "Moderation action failed", "error");
    }
  }

  async function handleModerateComment(commentId, action) {
    try {
      await apiPost(`/community/moderation/comments/${commentId}`, { action }, { token });
      addToast(`Comment ${action}d`, "success");
      fetchThreadDetail(selectedThreadId);
      fetchModerationQueue();
    } catch (error) {
      addToast(error.message || "Moderation action failed", "error");
    }
  }

  return (
    <main className="min-h-screen bg-base text-[#e8e6e0] px-6 md:px-8 py-10">
      <section className="max-w-[1200px] mx-auto">
        <header className="mb-6">
          <p className="text-[0.72rem] uppercase tracking-[0.2em] text-[#f59e0b] mb-2">Community</p>
          <h1 className="font-heading text-[2rem] md:text-[2.3rem] text-text-primary mb-2">Course Q&A</h1>
          <p className="text-text-dim text-[0.95rem] max-w-[760px]">
            Ask questions per course, discuss lesson content, upvote useful answers, and mark the best solution.
          </p>
        </header>

        <div className="grid lg:grid-cols-[360px,1fr] gap-6 mb-6">
          <aside className="rounded-2xl border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] p-4 h-fit">
            <div className="mb-3">
              <label htmlFor="course-filter" className="text-[0.78rem] uppercase tracking-[0.12em] text-text-faint">
                Course Filter
              </label>
              <select
                id="course-filter"
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="mt-2 w-full rounded-lg bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.12)] px-3 py-2 text-[0.86rem] text-text-secondary"
              >
                <option value="">All courses</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>{course.title}</option>
                ))}
              </select>
            </div>

            <form onSubmit={handleCreateThread} className="space-y-2 mb-4">
              <p className="text-[0.78rem] uppercase tracking-[0.12em] text-[#f59e0b]">Start A Thread</p>
              <input
                value={threadTitle}
                onChange={(e) => setThreadTitle(e.target.value)}
                placeholder="Question title"
                className="w-full rounded-lg bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.12)] px-3 py-2 text-[0.86rem] text-text-secondary"
              />
              <textarea
                value={threadBody}
                onChange={(e) => setThreadBody(e.target.value)}
                placeholder="Describe your question"
                rows={4}
                className="w-full rounded-lg bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.12)] px-3 py-2 text-[0.86rem] text-text-secondary"
              />
              <button
                type="submit"
                className="w-full py-2 rounded-lg bg-brand text-base font-semibold"
              >
                Post Question
              </button>
            </form>

            <div className="space-y-2 max-h-[560px] overflow-auto pr-1">
              {loading ? (
                <p className="text-text-faint text-[0.84rem]">Loading threads...</p>
              ) : threads.length === 0 ? (
                <p className="text-text-faint text-[0.84rem]">No threads yet. Start one.</p>
              ) : (
                threads.map((thread) => (
                  <ThreadItem
                    key={thread.id || thread._id}
                    thread={thread}
                    isActive={String(thread.id || thread._id) === String(selectedThreadId)}
                    onOpen={() => setSelectedThreadId(String(thread.id || thread._id))}
                    onUpvote={handleThreadUpvote}
                    currentUserId={currentUser?.id}
                  />
                ))
              )}
            </div>
          </aside>

          <section className="rounded-2xl border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] p-5">
            {!selectedThread ? (
              <p className="text-text-faint">Select a thread to see answers.</p>
            ) : (
              <>
                <header className="mb-4 pb-4 border-b border-[rgba(255,255,255,0.08)]">
                  <h2 className="font-heading text-[1.45rem] text-text-primary">{selectedThread.title}</h2>
                  <p className="text-text-dim mt-2 text-[0.9rem]">{selectedThreadData?.body || selectedThread.body}</p>
                </header>

                <div className="space-y-3 mb-5 max-h-[380px] overflow-auto pr-1">
                  {comments.length === 0 ? (
                    <p className="text-text-faint text-[0.84rem]">No answers yet. Be the first to help.</p>
                  ) : (
                    comments.map((comment) => {
                      const isOwner = String(selectedThreadData?.createdBy?.id || selectedThreadData?.createdBy?._id) === String(currentUser?.id);
                      const canAccept = isOwner || canModerate;
                      const commentId = comment.id || comment._id;
                      const upvotedByMe = (comment.upvoteUserIds || []).some((id) => String(id) === String(currentUser?.id));

                      return (
                        <article
                          key={commentId}
                          className={`rounded-xl border p-3 ${
                            comment.isAccepted
                              ? "border-[rgba(16,185,129,0.45)] bg-[rgba(16,185,129,0.08)]"
                              : "border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)]"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <p className="text-[0.9rem] text-text-secondary leading-relaxed">{comment.body}</p>
                            {comment.isAccepted ? (
                              <span className="text-[0.72rem] px-2 py-1 rounded-full bg-[rgba(16,185,129,0.18)] text-[#34d399] uppercase tracking-[0.08em]">
                                Accepted
                              </span>
                            ) : null}
                          </div>
                          <div className="mt-2 flex items-center justify-between text-[0.74rem] text-text-faint">
                            <span>
                              {comment.createdBy?.name || "Unknown"} • {formatTime(comment.createdAt)}
                            </span>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleCommentUpvote(commentId)}
                                className={`px-2 py-1 rounded-md border ${
                                  upvotedByMe
                                    ? "border-[#f59e0b] text-[#f59e0b]"
                                    : "border-[rgba(255,255,255,0.12)] text-text-secondary"
                                }`}
                              >
                                ▲ {comment.upvotesCount || 0}
                              </button>
                              {!comment.isAccepted && canAccept ? (
                                <button
                                  type="button"
                                  onClick={() => handleAcceptAnswer(commentId)}
                                  className="px-2 py-1 rounded-md border border-[rgba(16,185,129,0.45)] text-[#34d399]"
                                >
                                  Accept
                                </button>
                              ) : null}
                            </div>
                          </div>
                        </article>
                      );
                    })
                  )}
                </div>

                <form onSubmit={handleAddComment} className="space-y-2">
                  <label className="text-[0.78rem] uppercase tracking-[0.12em] text-[#f59e0b]">Add Answer</label>
                  <textarea
                    rows={4}
                    value={commentBody}
                    onChange={(e) => setCommentBody(e.target.value)}
                    placeholder="Share your answer..."
                    className="w-full rounded-lg bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.12)] px-3 py-2 text-[0.9rem] text-text-secondary"
                  />
                  <button type="submit" className="px-4 py-2 rounded-lg bg-brand text-base font-semibold">
                    Post Answer
                  </button>
                </form>
              </>
            )}
          </section>
        </div>

        {canModerate ? (
          <ModerationQueue
            queue={moderationQueue}
            onModerateThread={handleModerateThread}
            onModerateComment={handleModerateComment}
          />
        ) : null}
      </section>
    </main>
  );
}
