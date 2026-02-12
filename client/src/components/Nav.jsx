import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

import TEST_ID from "./Nav.testid";

const Nav = () => {
  const { user, logout } = useAuth();

  const handleLogout = async (e) => {
    e.preventDefault();
    await logout();
    window.location.href = "/login";
  };

  return (
    <ul>
      <Link to="/" data-testid={TEST_ID.linkToHome}>
        <li>Home</li>
      </Link>
      <Link to="/user" data-testid={TEST_ID.linkToUsers}>
        <li>Users</li>
      </Link>
      {user ? (
        <li>
          <a href="/logout" onClick={handleLogout}>
            Logout
          </a>
        </li>
      ) : (
        <>
          <Link to="/signup" data-testid={TEST_ID.linkToSignUp}>
            <li>Sign Up</li>
          </Link>
          <Link to="/login">
            <li>Login</li>
          </Link>
        </>
      )}
    </ul>
  );
};

export default Nav;
