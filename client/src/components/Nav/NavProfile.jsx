import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import TEST_ID from "../Nav.testid";

const NavProfile = ({ user, onLogout }) => {
  return (
    <div className="navbar-actions">
      {user ? (
        <>
          <span className="user-greeting">Hi, {user.name || "User"}</span>
          <button
            type="button"
            onClick={onLogout}
            className="btn-nav btn-logout"
            data-testid={TEST_ID.linkToLogout}
          >
            Logout
          </button>
        </>
      ) : (
        <>
          <Link
            to="/login"
            className="btn-nav btn-secondary"
            data-testid={TEST_ID.linkToLogin}
          >
            Login
          </Link>
          <Link
            to="/signup"
            className="btn-nav btn-primary"
            data-testid={TEST_ID.linkToSignUp}
          >
            Sign Up
          </Link>
        </>
      )}
    </div>
  );
};

NavProfile.propTypes = {
  user: PropTypes.object,
  onLogout: PropTypes.func.isRequired,
};

export default NavProfile;
