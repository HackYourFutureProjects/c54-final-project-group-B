// ...existing code...
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Optional: Check verification status if you want to restrict routes even for logged-in but unverified users
  // However, our backend blocks login for unverified users, so isAuthenticated implies verified.
  // If we allowed login but restricted features, we would check user.isVerified here.

  return <Outlet />;
};

export default ProtectedRoute;
