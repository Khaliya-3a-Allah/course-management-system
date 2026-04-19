import { AuthProvider, useAuthContext } from "./AuthContext";
import { DataProvider, useDataContext } from "./DataContext";
import { UiProvider, useUiContext } from "./UiContext";

export function AppProvider({ children }) {
  return (
    <UiProvider>
      <AuthProvider>
        <DataProvider>
          {children}
        </DataProvider>
      </AuthProvider>
    </UiProvider>
  );
}

export function useAppContext() {
  const auth = useAuthContext();
  const data = useDataContext();
  const ui = useUiContext();

  return {
    ...auth,
    ...data,
    ...ui,
  };
}
