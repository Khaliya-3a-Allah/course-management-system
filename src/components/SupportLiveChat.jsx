import { useEffect, useMemo, useState } from "react";
import { apiGet, apiPost } from "../utils/api";
import { useAppContext } from "../context/AppContext";
import {
  clearActiveSupportChat,
  readActiveSupportChat,
  SUPPORT_CHAT_CHANGED_EVENT,
  writeActiveSupportChat,
} from "../utils/supportChatStorage";
import { CheckIcon, CloseIcon } from "./Icons";

function ChatBubbleIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 12a8 8 0 0 1-8 8H7l-4 3v-6.2A8 8 0 1 1 21 12Z" />
      <path d="M8 11h8M8 15h5" />
    </svg>
  );
}

function userAnsweredYes(value) {
  return /^(yes|y|resolved|fixed|done|thank you|thanks)\b/i.test(String(value || "").trim());
}

export default function SupportLiveChat() {
  const { currentUser, addToast } = useAppContext();
  const [ticket, setTicket] = useState(() => readActiveSupportChat());
  const [messages, setMessages] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [sending, setSending] = useState(false);

  const canUseChat = ticket?.id && ticket?.requesterEmail && ticket?.supportMode === "live";
  const isResolved = ["resolved", "closed"].includes(ticket?.status);
  const hasResolutionPrompt = Boolean(ticket?.resolutionRequestedAt) && !isResolved;

  const requester = useMemo(
    () => ({
      requesterName: currentUser?.name || ticket?.requesterName || "",
      requesterEmail: currentUser?.email || ticket?.requesterEmail || "",
    }),
    [currentUser, ticket]
  );

  useEffect(() => {
    function syncTicket() {
      setTicket(readActiveSupportChat());
    }

    window.addEventListener(SUPPORT_CHAT_CHANGED_EVENT, syncTicket);
    window.addEventListener("storage", syncTicket);
    return () => {
      window.removeEventListener(SUPPORT_CHAT_CHANGED_EVENT, syncTicket);
      window.removeEventListener("storage", syncTicket);
    };
  }, []);

  async function fetchMessages({ quiet = true } = {}) {
    if (!canUseChat) return;
    try {
      const response = await apiGet(
        `/support-tickets/${ticket.id}/messages?email=${encodeURIComponent(ticket.requesterEmail)}`
      );
      const nextTicket = response?.data?.ticket;
      setMessages(response?.data?.messages || []);
      if (nextTicket) {
        const merged = { ...ticket, ...nextTicket };
        setTicket(merged);
        if (["resolved", "closed"].includes(merged.status)) {
          clearActiveSupportChat();
        } else {
          writeActiveSupportChat(merged);
        }
      }
    } catch (error) {
      if (!quiet) addToast(error.message || "Could not load support chat.", "error");
    }
  }

  useEffect(() => {
    if (!canUseChat) return undefined;
    fetchMessages();
    const timer = window.setInterval(() => fetchMessages(), 5000);
    return () => window.clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticket?.id]);

  async function sendMessage(body) {
    if (!body || !canUseChat || sending || isResolved) return;
    setSending(true);
    try {
      const response = await apiPost(`/support-tickets/${ticket.id}/messages`, {
        body,
        ...requester,
      });
      setMessages((prev) => [...prev, response?.data].filter(Boolean));
      setChatInput("");
      if (hasResolutionPrompt && userAnsweredYes(body)) {
        clearActiveSupportChat();
      }
      await fetchMessages({ quiet: false });
    } catch (error) {
      addToast(error.message || "Could not send chat message.", "error");
    } finally {
      setSending(false);
    }
  }

  if (!canUseChat) return null;

  return (
    <div className="pointer-events-none fixed bottom-3 left-3 z-[70] sm:bottom-5 sm:left-5">
      {isOpen ? (
        <section className="pointer-events-auto flex h-[min(580px,calc(100dvh-1.5rem))] w-[min(410px,calc(100vw-1.5rem))] flex-col overflow-hidden rounded-xl border border-[rgba(255,255,255,0.16)] bg-[#101113] text-[#f5f2ec] shadow-[0_26px_80px_rgba(0,0,0,0.56)] ring-1 ring-brand/10">
          <header className="flex items-center justify-between border-b border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.035)] px-4 py-3">
            <div className="min-w-0">
              <div className="mb-1 flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#34d399] shadow-[0_0_0_4px_rgba(52,211,153,0.12)]" />
                <p className="text-[0.68rem] uppercase tracking-[0.16em] text-brand">Support</p>
              </div>
              <h2 className="truncate text-sm font-bold">Live Chat</h2>
              <p className="truncate text-xs text-[#9ca3af]">{ticket.title || "Support ticket"}</p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="relative z-10 grid h-11 w-11 shrink-0 place-items-center rounded-lg border border-[rgba(255,255,255,0.16)] bg-[rgba(255,255,255,0.04)] text-[#f5f2ec] transition hover:bg-[rgba(255,255,255,0.1)]"
              aria-label="Close support chat"
            >
              <CloseIcon size={18} />
            </button>
          </header>

          <div className="flex-1 overflow-y-auto bg-[#0b0c0e] p-3">
            {messages.map((message, index) => {
              const isAdmin = message.senderRole === "admin";
              return (
                <div key={message.id || message._id || index} className={`mb-3 flex ${isAdmin ? "justify-start" : "justify-end"}`}>
                  <div
                    className={`max-w-[86%] whitespace-pre-wrap break-words rounded-lg px-3 py-2 text-[0.86rem] leading-5 ${
                      isAdmin
                        ? "border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.05)] text-[#e5e7eb]"
                        : "bg-brand text-base"
                    }`}
                  >
                    <p className="mb-1 text-[0.65rem] font-bold uppercase tracking-[0.1em] opacity-70">
                      {isAdmin ? "Admin" : "You"}
                    </p>
                    {message.body}
                  </div>
                </div>
              );
            })}
            {messages.length === 0 ? (
              <div className="rounded-lg border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] p-3 text-sm text-[#9ca3af]">
                No chat messages yet.
              </div>
            ) : null}
          </div>

          {hasResolutionPrompt ? (
            <div className="border-t border-[rgba(255,255,255,0.08)] bg-[rgba(217,119,6,0.08)] px-3 py-3">
              <p className="mb-2 text-xs leading-5 text-[#f6c56b]">Admin asked if this issue is resolved.</p>
              <button
                type="button"
                onClick={() => sendMessage("Yes, this is resolved.")}
                disabled={sending}
                className="inline-flex h-9 items-center gap-2 rounded-lg bg-brand px-3 text-sm font-bold text-base disabled:cursor-not-allowed disabled:opacity-50"
              >
                <CheckIcon size={14} />
                Resolved
              </button>
            </div>
          ) : null}

          <form
            onSubmit={(event) => {
              event.preventDefault();
              sendMessage(chatInput.trim());
            }}
            className="flex items-center gap-2 border-t border-[rgba(255,255,255,0.08)] bg-[#101113] p-2.5"
          >
            <input
              type="text"
              value={chatInput}
              onChange={(event) => setChatInput(event.target.value)}
              disabled={isResolved}
              className="h-10 min-w-0 flex-1 rounded-lg border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.04)] px-3 text-sm leading-5 text-[#f5f2ec] outline-none placeholder:text-[#8b8b8b] disabled:opacity-50"
              placeholder={isResolved ? "This ticket is resolved." : "Write a live chat message..."}
            />
            <button
              type="submit"
              disabled={!chatInput.trim() || sending || isResolved}
              className="h-10 rounded-lg bg-brand px-4 text-sm font-bold text-base disabled:cursor-not-allowed disabled:opacity-50"
            >
              Send
            </button>
          </form>
        </section>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="pointer-events-auto grid h-14 w-14 place-items-center rounded-xl bg-brand text-white shadow-[0_18px_44px_rgba(0,0,0,0.3)] transition hover:bg-brand-light"
          aria-label="Open support chat"
        >
          <ChatBubbleIcon size={22} />
        </button>
      )}
    </div>
  );
}
