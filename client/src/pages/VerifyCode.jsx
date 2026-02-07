import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const VerifyCode = () => {
  const navigate = useNavigate(); // Keep this line as it is used
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0); // seconds
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    // Try to get email from navigation state or query param
    if (location.state && location.state.email) {
      setEmail(location.state.email);
    }
  }, [location]);

  // 1. Fetch Status on Mount to Sync Countdown
  useEffect(() => {
    if (email) {
      fetch("/api/users/verification-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.expiresAt) {
            const expires = new Date(data.expiresAt).getTime();
            const now = Date.now();
            const diff = Math.ceil((expires - now) / 1000);
            if (diff > 0) {
              setCountdown(diff);
              setCanResend(false);
            } else {
              setCountdown(0);
              setCanResend(true);
            }
          }
        })
        .catch((err) => console.error(err));
    }
  }, [email]);

  // 2. Countdown Interval
  useEffect(() => {
    if (countdown <= 0) {
      setCanResend(true);
      return;
    }
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const handleResend = async () => {
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/users/resend-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(data.msg);
        if (data.verificationCode)
          console.log("Your Code:", data.verificationCode);
        // Reset countdown to 15 mins (900s)
        setCountdown(900);
        setCanResend(false);
      } else {
        setError(data.msg);
      }
    } catch {
      setError("Resend failed");
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true); // Removed e.preventDefault() as it is not needed
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/users/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setSuccess(data.msg);
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        setError(data.msg || "Verification failed");
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-form-container">
      <h2>Verify Code</h2>
      <p>Enter the 5-digit code sent to the server console.</p>
      <form onSubmit={handleSubmit}>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="Enter your email"
          autoComplete="email"
        />

        <label htmlFor="code">Verification Code</label>
        <input
          id="code"
          name="code"
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          required
          maxLength={5}
          minLength={5}
          placeholder="12345"
          pattern="\d{5}"
          title="5-digit numeric code"
          autoComplete="one-time-code"
        />
        {error && <div className="error-msg">{error}</div>}
        {success && <div className="success-msg">{success}</div>}
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Verifying..." : "Verify Code"}
        </button>
      </form>

      <div style={{ marginTop: "1rem", textAlign: "center" }}>
        {countdown > 0 ? (
          <p style={{ color: "#666" }}>
            Resend available in: {formatTime(countdown)}
          </p>
        ) : (
          <button
            onClick={handleResend}
            disabled={!canResend}
            style={{
              backgroundColor: "#f0f0f0",
              color: "#333",
              border: "1px solid #ccc",
              marginTop: "10px",
            }}
          >
            Resend Code
          </button>
        )}
      </div>
    </div>
  );
};

export default VerifyCode;
