import { createContext, useContext, useState, useCallback, useEffect } from "react";

const UiContext = createContext(null);

const THEME_KEY = "courseApp_theme";

function loadThemeFromStorage() {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === "light" || stored === "dark") return stored;
  } catch {
    // Fall through to system preference
  }

  if (typeof window !== "undefined" && window.matchMedia?.("(prefers-color-scheme: light)").matches) {
    return "light";
  }

  return "dark";
}

export function UiProvider({ children }) {
  const [theme, setTheme] = useState(loadThemeFromStorage);
  const [toasts, setToasts] = useState([]);
  const [isBackendWaking, setIsBackendWaking] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.style.colorScheme = theme;
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      // Ignore persistence issues
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  function addToast(message, variant = "success", durationMs = 3000) {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, variant, durationMs }]);
  }

  function removeToast(id) {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }

  return (
    <UiContext.Provider
      value={{
        theme,
        setTheme,
        toggleTheme,
        toasts,
        addToast,
        removeToast,
        isBackendWaking,
        setIsBackendWaking,
      }}
    >
      {children}
    </UiContext.Provider>
  );
}

export function useUiContext() {
  const ctx = useContext(UiContext);
  if (!ctx) throw new Error("useUiContext must be used inside <UiProvider>");
  return ctx;
}
