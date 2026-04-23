import { createContext, useContext, useMemo } from "react";
import { AuthProvider, useAuthContext } from "./AuthContext";
import { DataProvider, useDataContext } from "./DataContext";
import { UiProvider, useUiContext } from "./UiContext";

const AppContext = createContext(null);

function AppProviderInner({ children }) {
  const auth = useAuthContext();
  const data = useDataContext();
  const ui = useUiContext();

  const value = useMemo(
    () => ({
      ...auth,
      ...data,
      ...ui,
      addToast: (message, variant = "success", durationMs = 3000) =>
        ui.addToast(message, variant, durationMs),
    }),
    [auth, data, ui]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function AppProvider({ children }) {
  return (
    <UiProvider>
      <AuthProvider>
        <DataProvider>
          <AppProviderInner>{children}</AppProviderInner>
        </DataProvider>
      </AuthProvider>
    </UiProvider>
  );
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppContext must be used inside <AppProvider>");
  return ctx;
}