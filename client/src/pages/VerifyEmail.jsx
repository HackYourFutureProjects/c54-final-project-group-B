
import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();


  const [status, setStatus] = useState(token ? "verifying" : "idle"); // idle, verifying, success, error
  const [message, setMessage] = useState(token ? "Verifying your email..." : "Please enter your verification token.");
  const [manualToken, setManualToken] = useState("");

  const handleManualverify = async (e) => {
    e.preventDefault();
    if (!manualToken) return;
    navigate(`/verify-email?token=${manualToken}`);
    // The useEffect below will trigger because navigate changes searchParams? 
    // Actually navigate usually pushes new history. 
    // To be safer, we'll force a reload or just let React Router handle the param update.
    // Ideally, navigate to same page with query param updates the component.
  };

  useEffect(() => {
    if (!token) {
      setStatus("idle");
      setMessage("Please enter your verification token.");
      return;
    }

    setStatus("verifying");
    setMessage("Verifying your email...");

    const verify = async () => {
      try {
        const res = await fetch(`/api/users/verify-email?token=${token}`);
        const data = await res.json();
        
        if (res.ok && data.success) {
          setStatus("success");
          setMessage(data.msg || "Email verified successfully!");
          setTimeout(() => navigate("/login"), 3000);
        } else {
          setStatus("error");
          setMessage(data.msg || "Verification failed.");
        }
      } catch (err) {
        setStatus("error");
        setMessage("An error occurred during verification.");
      }
    };

    verify();
  }, [token, navigate]);

  return (
    <div className="auth-form-container">
      <h2>Email Verification</h2>
      
      {status === "idle" && (
        <form onSubmit={handleManualverify}>
           <p>{message}</p>
           <input 
             type="text" 
             placeholder="Paste token here" 
             value={manualToken}
             onChange={(e) => setManualToken(e.target.value)}
             required
           />
           <button type="submit">Verify</button>
        </form>
      )}

      {status !== "idle" && (
        <div className={`verification-status ${status}`}>
          <p>{message}</p>
          {status === "success" && <p>Redirecting to login...</p>}
          {status === "error" && (
            <p>
              <a href="/login">Go to Login</a> or <a href="/verify-email">Try Again</a>
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default VerifyEmail;
