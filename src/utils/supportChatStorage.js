const ACTIVE_SUPPORT_CHAT_KEY = "courseApp_activeSupportChat";

export const SUPPORT_CHAT_CHANGED_EVENT = "courseware:support-chat-changed";

function emitSupportChatChanged() {
  try {
    window.dispatchEvent(new Event(SUPPORT_CHAT_CHANGED_EVENT));
  } catch {
    // Non-browser contexts can ignore the UI notification.
  }
}

export function readActiveSupportChat() {
  try {
    const stored = localStorage.getItem(ACTIVE_SUPPORT_CHAT_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

export function writeActiveSupportChat(ticket) {
  if (!ticket?.id || ticket.supportMode !== "live") return;
  try {
    localStorage.setItem(ACTIVE_SUPPORT_CHAT_KEY, JSON.stringify(ticket));
    emitSupportChatChanged();
  } catch {
    // The chat still works on the support page even if storage is unavailable.
  }
}

export function clearActiveSupportChat() {
  try {
    localStorage.removeItem(ACTIVE_SUPPORT_CHAT_KEY);
    emitSupportChatChanged();
  } catch {
    // Ignore storage failures.
  }
}
