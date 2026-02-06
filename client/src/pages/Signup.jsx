import React, { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const { signup, isLoading } = useAuth();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [successToken, setSuccessToken] = useState(null);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    const res = await signup(username, email, password);
    if (res.success) {
      // Show success UI with token
      setSuccessToken(res.token);
      setError("");
    } else {
      setError(res.msg || "Signup failed");
    }
  }

  if (successToken) {
    return (
      <div className="auth-form-container">
        <h2>Account Created!</h2>
        <p>For MVP testing, here is your verification token:</p>
        <div className="token-display" style={{ background: "#f0f0f0", padding: "10px", wordBreak: "break-all", margin: "10px 0" }}>
          {successToken}
        </div>
        <p>
          <a href={`/verify-email?token=${successToken}`}>Click here to verify</a>
          <br />or copy the token and <a href="/verify-email">enter it manually</a>.
        </p>
      </div>
    );
  }

  return (
    <div className="auth-form-container">
      <h2>Sign Up</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Username
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            minLength={3}
            maxLength={30}
            pattern="[a-zA-Z0-9]+"
            title="3-30 alphanumeric characters"
          />
        </label>
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
          />
        </label>
        {error && <div className="error-msg">{error}</div>}
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Signing up..." : "Sign Up"}
        </button>
      </form>
      <p>
        Already have an account? <a href="/login">Login</a>
      </p>
    </div>
  );
};

export default Signup;
