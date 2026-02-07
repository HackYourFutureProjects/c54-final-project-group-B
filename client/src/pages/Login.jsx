import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate, Link } from "react-router-dom";

const Login = () => {
  const { login, isLoading } = useAuth();
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    const res = await login(emailOrUsername, password);
    if (res.success) {
      // If login successful, go to home
      navigate("/");
    } else {
      // Handle unverified user case
      if (res.msg === "Please verify your email to login") {
        setError(
          <span>
            Please verify your email. <Link to="/verify-code">Verify Code</Link>
          </span>,
        );
      } else {
        setError(res.msg || "Login failed");
      }
    }
  }

  return (
    <div className="auth-form-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="emailOrUsername">Email or Username</label>
        <input
          id="emailOrUsername"
          name="emailOrUsername"
          type="text"
          value={emailOrUsername}
          onChange={(e) => setEmailOrUsername(e.target.value)}
          required
          autoFocus
          autoComplete="username"
        />
        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />
        {error && <div className="error-msg">{error}</div>}
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Logging in..." : "Login"}
        </button>
      </form>
      <p>
        Don&apos;t have an account? <a href="/signup">Sign up</a>
      </p>
    </div>
  );
};

export default Login;
