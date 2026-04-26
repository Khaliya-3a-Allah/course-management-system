import { Navigate, Outlet } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

/**
 * Route guard that redirects unauthenticated users to the login page.
 * Wrap protected <Route> elements with this component in AppRouter.
 */
export default function ProtectedRoute({ roles = [] }) {
  const { currentUser } = useAppContext();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (roles.length > 0 && !roles.includes(currentUser.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
