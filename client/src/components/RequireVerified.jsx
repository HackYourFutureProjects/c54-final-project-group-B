import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const RequireVerified = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return null; // Should be wrapped in ProtectedRoute anyway
  }

  if (!user.isVerified) {
    return (
      <div
        className="verification-required"
        style={{ padding: "2rem", textAlign: "center" }}
      >
        <h2>Email Verification Required</h2>
        <p>Please verify your email address to access this feature.</p>
        <Link
          to="/verify-code"
          style={{
            display: "inline-block",
            marginTop: "1rem",
            padding: "0.5rem 1rem",
            background: "#007bff",
            color: "white",
            textDecoration: "none",
            borderRadius: "4px",
          }}
        >
          Verify Now
        </Link>
      </div>
    );
  }

  return children;
};

export default RequireVerified;
