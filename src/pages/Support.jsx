import { useEffect, useId, useMemo, useState } from "react";
import { useAppContext } from "../context/AppContext";
import EmailAutocompleteInput from "../components/EmailAutocompleteInput";
import { apiGet, apiPost } from "../utils/api";

const supportTopics = [
  "Account Access",
  "Billing",
  "Course Content",
  "Certificates",
  "Technical Issue",
  "Other",
];

const faqItems = [
  {
    question: "How can I reset my password?",
    answer:
      "Go to the login page and use the forgot-password flow. If you are still locked out, submit a support ticket below with your account email.",
  },
  {
    question: "Why is my certificate not showing?",
    answer:
      "Certificates appear after course completion is fully synced. Open the course once, refresh your progress, then check the Certificates page.",
  },
  {
    question: "Can I switch my enrolled course later?",
    answer:
      "Yes. You can unenroll from your dashboard and enroll in another course any time, depending on your plan and course availability.",
  },
  {
    question: "How quickly will support reply?",
    answer:
      "Most requests receive an initial response within 24 hours on business days.",
  },
];

export default function Support() {
  const { currentUser, addToast } = useAppContext();
  const formId = useId();

  const [form, setForm] = useState({
    name: currentUser?.name || "",
    email: currentUser?.email || "",
    topic: supportTopics[0],
    message: "",
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [supportMode, setSupportMode] = useState("email");
  const [activeTicket, setActiveTicket] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [sendingChat, setSendingChat] = useState(false);

  const channels = useMemo(
    () => [
      {
        title: "Email Support",
        detail: "support@courseware.com",
        helper: "Best for account and billing requests",
        href: "mailto:support@courseware.com",
      },
      {
        title: "Live Chat",
        detail: "Available 09:00 - 18:00",
        helper: "Fastest way for urgent issues",
        href: "#",
      },
      {
        title: "Knowledge Base",
        detail: "Guides and troubleshooting",
        helper: "Quick self-service solutions",
        href: "#",
      },
    ],
    []
  );

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: "" }));
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (submitting) return;

    const nextErrors = {
      name: form.name.trim() ? "" : "Name is required.",
      email: /\S+@\S+\.\S+/.test(form.email.trim()) ? "" : "Please enter a valid email address.",
      message:
        form.message.trim().length >= 15
          ? ""
          : "Please describe your issue in at least 15 characters.",
    };

    if (nextErrors.name || nextErrors.email || nextErrors.message) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setSubmitting(true);

    try {
      const response = await apiPost("/support-tickets", {
        title: `${form.topic} support request`,
        description: form.message.trim(),
        requesterName: form.name.trim(),
        requesterEmail: form.email.trim().toLowerCase(),
        topic: form.topic,
      });
      const ticket = response?.data;
      setSubmitting(false);
      addToast(
        supportMode === "live"
          ? "Live chat started. Admin support can now reply here."
          : "Email support request sent. Admin support will reply to your email.",
        "success"
      );
      if (supportMode === "live") {
        setActiveTicket(ticket);
        setChatMessages(ticket?.messages || []);
      } else {
        setActiveTicket(null);
        setChatMessages([]);
      }
      setForm((prev) => ({ ...prev, message: "" }));
    } catch (error) {
      setSubmitting(false);
      addToast(error.message || "Could not send support request.", "error");
    }
  }

  async function fetchChatMessages() {
    if (!activeTicket?.id || !activeTicket?.requesterEmail) return;
    try {
      const response = await apiGet(
        `/support-tickets/${activeTicket.id}/messages?email=${encodeURIComponent(activeTicket.requesterEmail)}`
      );
      setChatMessages(response?.data?.messages || []);
      if (response?.data?.ticket) {
        setActiveTicket((prev) => (prev ? { ...prev, ...response.data.ticket } : prev));
      }
    } catch {
      // Polling should stay quiet unless the user actively sends.
    }
  }

  useEffect(() => {
    if (!activeTicket?.id) return undefined;
    fetchChatMessages();
    const timer = window.setInterval(fetchChatMessages, 5000);
    return () => window.clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTicket?.id]);

  async function sendChatMessage(event) {
    event.preventDefault();
    const body = chatInput.trim();
    if (!body || !activeTicket?.id || sendingChat) return;

    setSendingChat(true);
    try {
      const response = await apiPost(`/support-tickets/${activeTicket.id}/messages`, {
        body,
        requesterName: activeTicket.requesterName || form.name,
        requesterEmail: activeTicket.requesterEmail || form.email,
      });
      setChatMessages((prev) => [...prev, response?.data].filter(Boolean));
      setChatInput("");
      await fetchChatMessages();
    } catch (error) {
      addToast(error.message || "Could not send chat message.", "error");
    } finally {
      setSendingChat(false);
    }
  }

  const nameInputId = `${formId}-name`;
  const emailInputId = `${formId}-email`;
  const topicInputId = `${formId}-topic`;
  const messageInputId = `${formId}-message`;
  const nameErrorId = `${formId}-name-error`;
  const emailErrorId = `${formId}-email-error`;
  const messageErrorId = `${formId}-message-error`;
  const formHelpId = `${formId}-help`;
  const topicHelpId = `${formId}-topic-help`;
  const faqHeadingId = `${formId}-faq-heading`;
  const channelsHeadingId = `${formId}-channels-heading`;
  const ticketHeadingId = `${formId}-ticket-heading`;

  return (
    <main className="min-h-screen bg-base text-text-secondary font-body px-6 md:px-8 py-12" aria-labelledby="support-page-title">
      <header className="max-w-[1200px] mx-auto mb-10">
        <p className="text-[0.75rem] tracking-[0.2em] uppercase text-brand mb-3">Support Center</p>
        <h1 id="support-page-title" className="font-heading text-[clamp(2rem,4vw,3rem)] text-text-primary leading-[1.15] mb-3">
          Need Help? We Have Your Back
        </h1>
        <p className="text-text-muted text-[1rem] max-w-[720px] leading-relaxed">
          Contact our team, report an issue, or browse common answers. We are here to help you keep learning without blockers.
        </p>
      </header>

      <section className="max-w-[1200px] mx-auto mb-10" aria-labelledby={channelsHeadingId}>
        <h2 id={channelsHeadingId} className="sr-only">Support channels</h2>
        <ul className="grid grid-cols-1 md:grid-cols-3 gap-4" role="list">
          {channels.map((channel) => (
            <li key={channel.title}>
              <article className="rounded-2xl border border-[rgba(255,255,255,0.08)] bg-surface px-5 py-5">
                <p className="text-[0.72rem] tracking-[0.18em] uppercase text-text-faint mb-2">Channel</p>
                <h3 className="font-heading text-[1.25rem] text-text-primary mb-1">{channel.title}</h3>
                {channel.href.startsWith("mailto:") ? (
                  <a
                    href={channel.href}
                    className="text-brand font-semibold text-[0.92rem] mb-2 inline-block underline decoration-[rgba(217,119,6,0.45)] underline-offset-4"
                  >
                    {channel.detail}
                  </a>
                ) : (
                  <p className="text-brand font-semibold text-[0.92rem] mb-2">{channel.detail}</p>
                )}
                <p className="text-text-dim text-[0.85rem]">{channel.helper}</p>
              </article>
            </li>
          ))}
        </ul>
      </section>

      <section className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-8 items-start">
        <article className="rounded-2xl border border-[rgba(255,255,255,0.08)] bg-surface px-6 py-6" aria-labelledby={ticketHeadingId}>
          <h2 id={ticketHeadingId} className="font-heading text-[1.5rem] text-text-primary mb-5">Submit A Ticket</h2>
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4"
            noValidate
            aria-describedby={formHelpId}
            aria-busy={submitting}
          >
            <p id={formHelpId} className="text-[0.82rem] text-text-dim">
              Choose email support for a reply by email, or live chat to open a chat box after submitting.
            </p>
            <fieldset className="rounded-xl border border-[rgba(255,255,255,0.08)] bg-surface-muted p-2">
              <legend className="sr-only">Support reply method</legend>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {[
                  { value: "email", label: "Email Reply", helper: "Admin replies to your inbox" },
                  { value: "live", label: "Live Chat", helper: "Opens a chat box here" },
                ].map((option) => (
                  <label
                    key={option.value}
                    className={`cursor-pointer rounded-lg border px-3 py-3 transition ${
                      supportMode === option.value
                        ? "border-brand bg-[rgba(217,119,6,0.12)]"
                        : "border-[rgba(255,255,255,0.08)] bg-transparent"
                    }`}
                  >
                    <input
                      type="radio"
                      name="supportMode"
                      value={option.value}
                      checked={supportMode === option.value}
                      onChange={() => setSupportMode(option.value)}
                      className="sr-only"
                    />
                    <span className="block text-[0.9rem] font-bold text-text-primary">{option.label}</span>
                    <span className="mt-1 block text-[0.78rem] leading-5 text-text-dim">{option.helper}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label htmlFor={nameInputId} className="flex flex-col gap-1.5">
                <span className="text-[0.8rem] text-text-muted font-semibold">Name</span>
                <input
                  id={nameInputId}
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  autoComplete="name"
                  required
                  aria-required="true"
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={errors.name ? nameErrorId : undefined}
                  className="h-11 px-3 rounded-lg border border-[rgba(255,255,255,0.12)] bg-surface-muted text-text-secondary"
                  placeholder="Your name"
                />
                {errors.name && (
                  <span id={nameErrorId} role="alert" className="text-[0.76rem] text-[#ef4444]">
                    {errors.name}
                  </span>
                )}
              </label>

              <label htmlFor={emailInputId} className="flex flex-col gap-1.5">
                <span className="text-[0.8rem] text-text-muted font-semibold">Email</span>
                <EmailAutocompleteInput
                  id={emailInputId}
                  name="email"
                  value={form.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  autoComplete="email"
                  inputMode="email"
                  required
                  ariaRequired="true"
                  ariaInvalid={Boolean(errors.email)}
                  ariaDescribedby={errors.email ? emailErrorId : undefined}
                  className="h-11 px-3 rounded-lg border border-[rgba(255,255,255,0.12)] bg-surface-muted text-text-secondary"
                  placeholder="you@example.com"
                />
                {errors.email && (
                  <span id={emailErrorId} role="alert" className="text-[0.76rem] text-[#ef4444]">
                    {errors.email}
                  </span>
                )}
              </label>
            </div>

            <label htmlFor={topicInputId} className="flex flex-col gap-1.5">
              <span className="text-[0.8rem] text-text-muted font-semibold">Topic</span>
              <select
                id={topicInputId}
                name="topic"
                value={form.topic}
                onChange={(e) => updateField("topic", e.target.value)}
                required
                aria-required="true"
                aria-describedby={topicHelpId}
                className="h-11 px-3 rounded-lg border border-[rgba(255,255,255,0.12)] bg-surface-muted text-text-secondary"
              >
                {supportTopics.map((topic) => (
                  <option key={topic} value={topic}>
                    {topic}
                  </option>
                ))}
              </select>
              <span id={topicHelpId} className="text-[0.76rem] text-text-dim">
                Select the option that best matches your request.
              </span>
            </label>

            <label htmlFor={messageInputId} className="flex flex-col gap-1.5">
              <span className="text-[0.8rem] text-text-muted font-semibold">Message</span>
              <textarea
                id={messageInputId}
                name="message"
                value={form.message}
                onChange={(e) => updateField("message", e.target.value)}
                rows={6}
                required
                aria-required="true"
                aria-invalid={Boolean(errors.message)}
                aria-describedby={errors.message ? messageErrorId : undefined}
                className="px-3 py-2.5 rounded-lg border border-[rgba(255,255,255,0.12)] bg-surface-muted text-text-secondary resize-y"
                placeholder="Describe your issue with as much detail as possible..."
              />
              {errors.message && (
                <span id={messageErrorId} role="alert" className="text-[0.76rem] text-[#ef4444]">
                  {errors.message}
                </span>
              )}
            </label>

            <button
              type="submit"
              disabled={submitting}
              aria-live="polite"
              className="self-start mt-1 px-6 h-11 rounded-lg bg-brand text-base font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Sending..." : supportMode === "live" ? "Start Live Chat" : "Send Email Request"}
            </button>
          </form>
        </article>

        {activeTicket ? (
          <article className="rounded-2xl border border-[rgba(217,119,6,0.28)] bg-surface px-6 py-6" aria-label="Live support chat">
            <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[0.72rem] uppercase tracking-[0.18em] text-brand">Live Chat</p>
                <h2 className="font-heading text-[1.35rem] text-text-primary">Ticket Chat</h2>
              </div>
              <span className="self-start rounded-md border border-[rgba(255,255,255,0.1)] px-2 py-1 text-[0.75rem] text-text-dim sm:self-auto">
                {activeTicket.status || "open"}
              </span>
            </div>

            <div className="mb-4 h-[340px] overflow-y-auto rounded-xl border border-[rgba(255,255,255,0.08)] bg-base p-3">
              {chatMessages.map((message, index) => {
                const isAdmin = message.senderRole === "admin";
                return (
                  <div key={message.id || message._id || index} className={`mb-3 flex ${isAdmin ? "justify-start" : "justify-end"}`}>
                    <div
                      className={`max-w-[86%] whitespace-pre-wrap break-words rounded-lg px-3 py-2 text-[0.88rem] leading-6 ${
                        isAdmin
                          ? "border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] text-text-secondary"
                          : "bg-brand text-base"
                      }`}
                    >
                      <p className="mb-1 text-[0.68rem] font-bold uppercase tracking-[0.1em] opacity-70">
                        {isAdmin ? "Admin" : "You"}
                      </p>
                      {message.body}
                    </div>
                  </div>
                );
              })}
              {chatMessages.length === 0 ? (
                <p className="text-sm text-text-dim">No chat messages yet.</p>
              ) : null}
            </div>

            <form onSubmit={sendChatMessage} className="flex items-end gap-2">
              <textarea
                value={chatInput}
                onChange={(event) => setChatInput(event.target.value)}
                rows={2}
                className="min-h-[52px] flex-1 resize-none rounded-lg border border-[rgba(255,255,255,0.12)] bg-surface-muted px-3 py-2 text-sm leading-5 text-text-primary outline-none placeholder:text-text-faint"
                placeholder="Write a live chat message..."
              />
              <button
                type="submit"
                disabled={!chatInput.trim() || sendingChat}
                className="h-[52px] rounded-lg bg-brand px-4 text-sm font-bold text-base disabled:cursor-not-allowed disabled:opacity-50"
              >
                Send
              </button>
            </form>
          </article>
        ) : (
          <article className="rounded-2xl border border-[rgba(255,255,255,0.08)] bg-surface px-6 py-6" aria-labelledby={faqHeadingId}>
          <h2 id={faqHeadingId} className="font-heading text-[1.45rem] text-text-primary mb-5">Frequently Asked Questions</h2>
          <ul className="flex flex-col gap-3" role="list">
            {faqItems.map((item) => (
              <li key={item.question}>
                <details className="rounded-xl border border-[rgba(255,255,255,0.08)] bg-surface-muted px-4 py-3">
                  <summary className="cursor-pointer font-semibold text-[0.92rem] text-text-secondary">{item.question}</summary>
                  <p className="mt-2 text-[0.86rem] text-text-dim leading-relaxed">{item.answer}</p>
                </details>
              </li>
            ))}
          </ul>
        </article>
        )}
      </section>
    </main>
  );
}
