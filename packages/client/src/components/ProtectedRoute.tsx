import { useAuth } from "@hooks/useAuth";
import react from "react";
import { Navigate } from "react-router";

interface ProtectedRouteProps {
  element: react.ReactElement;
  roles: string[];
}

const ProtectedRoute: react.FC<ProtectedRouteProps> = ({ element, roles }) => {
  const { isLoggedIn, user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  if (!user || !roles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return element;
};

export default ProtectedRoute;
