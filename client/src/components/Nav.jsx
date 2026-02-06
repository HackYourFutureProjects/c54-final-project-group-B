import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import TEST_ID from "./Nav.testid";

const Nav = () => {
  const { isAuthenticated, logout, user } = useAuth();

  return (
    <nav>
      <ul>
        <Link to="/" data-testid={TEST_ID.linkToHome}>
          <li>Home</li>
        </Link>
        <Link to="/user" data-testid={TEST_ID.linkToUsers}>
          <li>Users</li>
        </Link>
        {isAuthenticated ? (
          <>
            <li>Welcome, {user?.username}</li>
            <li onClick={logout} style={{ cursor: "pointer" }}>
              Logout
            </li>
          </>
        ) : (
          <>
            <Link to="/login" data-testid={TEST_ID.linkToLogin}>
              <li>Login</li>
            </Link>
            <Link to="/signup" data-testid={TEST_ID.linkToSignup}>
              <li>Signup</li>
            </Link>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Nav;
