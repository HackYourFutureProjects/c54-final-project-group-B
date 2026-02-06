import { Link } from "react-router-dom";

import TEST_ID from "./Nav.testid";

const Nav = () => {
  return (
    <ul>
      <Link to="/" data-testid={TEST_ID.linkToHome}>
        <li>Home</li>
      </Link>
      <Link to="/user" data-testid={TEST_ID.linkToUsers}>
        <li>Users</li>
      </Link>
      <Link to="/login" data-testid={TEST_ID.linkToLogin}>
        <li>Login</li>
      </Link>
      <Link to="/signup" data-testid={TEST_ID.linkToSignup}>
        <li>Signup</li>
      </Link>
    </ul>
  );
};

export default Nav;
