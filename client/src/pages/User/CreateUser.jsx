import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { GoogleOAuthProvider, useGoogleLogin } from "@react-oauth/google";
import InputField from "../../components/form/InputField";
import SubmitButton from "../../components/form/SubmitButton";
import PasswordStrengthMeter from "../../components/PasswordStrengthMeter";
import useApi from "../../hooks/useApi";
import { useAuth } from "../../hooks/useAuth";
import TEST_ID from "./CreateUser.testid";

const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  "placeholder-client-id.apps.googleusercontent.com";

const GoogleSignupButton = ({ onSuccess, onError }) => {
  const { execute: executeGoogleSignup, isLoading } = useApi();

  const handleGoogleSuccess = async (tokenResponse) => {
    try {
      const result = await executeGoogleSignup("/users/google", {
        method: "POST",
        body: { token: tokenResponse.access_token },
      });
      if (result.success) {
        onSuccess(result.user, true);
      }
    } catch (err) {
      onError(err.message || "Google signup failed.");
    }
  };

  const login = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: () => onError("Google signup was canceled or failed."),
  });

  return (
    <button
      type="button"
      className="btn-secondary w-full flex items-center justify-center gap-3"
      onClick={() => login()}
      disabled={isLoading}
    >
      <img
        src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
        alt="Google logo"
        className="w-5 h-5 bg-white p-0.5 rounded-full"
      />
      {isLoading ? "Signing up..." : "Continue with Google"}
    </button>
  );
};

const CreateUser = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [validationError, setValidationError] = useState("");

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSuccess = (userToLogin, isGoogle = false) => {
    setValidationError("");
    if (isGoogle) {
      login(userToLogin);
      navigate("/", { replace: true });
    } else {
      setUsername("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setAgreedToTerms(false);
      navigate("/verify-code", { state: { email } });
    }
  };

  const { execute: executeSignup, isLoading, error } = useApi();

  const validateForm = () => {
    if (!username.trim()) {
      setValidationError("Username is required");
      return false;
    }
    if (!email.trim()) {
      setValidationError("Email is required");
      return false;
    }
    if (!password) {
      setValidationError("Password is required");
      return false;
    }
    if (!confirmPassword) {
      setValidationError("Please confirm your password");
      return false;
    }

    const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
    if (!usernameRegex.test(username)) {
      setValidationError("Username must be 3-30 alphanumeric characters");
      return false;
    }

    const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/;
    if (!emailRegex.test(email)) {
      setValidationError("Please enter a valid email address");
      return false;
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      setValidationError(
        "Password must have min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 symbol",
      );
      return false;
    }

    if (password !== confirmPassword) {
      setValidationError("Passwords do not match");
      return false;
    }

    if (agreedToTerms !== true) {
      setValidationError("You must accept the Terms of Service");
      return false;
    }

    setValidationError("");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const data = await executeSignup("/users", {
      method: "POST",
      body: {
        user: {
          name: username,
          email,
          password,
          agreedToTerms,
        },
      },
    });

    if (data?.success) {
      handleSuccess(data.user, false);
    }
  };

  let statusComponents = null;
  if (validationError) {
    statusComponents = (
      <div
        data-testid={TEST_ID.validationErrorContainer}
        className="mt-4 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-sm text-red-600 dark:text-red-400 text-center flex items-center justify-center gap-2"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        {validationError}
      </div>
    );
  } else if (error != null) {
    statusComponents = (
      <div
        data-testid={TEST_ID.errorContainer}
        className="mt-4 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-sm text-red-600 dark:text-red-400 text-center flex items-center justify-center gap-2"
      >
        <svg
          className="w-5 h-5 flex-shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        {error.toString()}
      </div>
    );
  }

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div
        data-testid={TEST_ID.container}
        className="min-h-[calc(100vh-140px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-md w-full card-emerald p-8 sm:p-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-8 tracking-tight">
            Create an Account
          </h1>

          <GoogleSignupButton
            onSuccess={handleSuccess}
            onError={setValidationError}
          />

          <div className="flex items-center text-center text-sm text-gray-500 dark:text-gray-400 my-6 before:flex-1 before:border-t before:border-gray-200 dark:before:border-dark-border before:mr-4 after:flex-1 after:border-t after:border-gray-200 dark:after:border-dark-border after:ml-4">
            or sign up with email
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <InputField
              name="username"
              value={username}
              onChange={setUsername}
              placeholder="Username (3-30 alphanumeric)"
              dataTestId={TEST_ID.usernameInput}
              autoComplete="username"
            />
            <InputField
              name="email"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="Email"
              dataTestId={TEST_ID.emailInput}
              autoComplete="email"
            />
            <InputField
              name="password"
              type="password"
              value={password}
              onChange={setPassword}
              placeholder="Password (min 8 chars, mixed, number, symbol)"
              dataTestId={TEST_ID.passwordInput}
              autoComplete="new-password"
            />

            <div className="-mt-2 mb-2">
              <PasswordStrengthMeter password={password} />
            </div>

            <InputField
              name="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              placeholder="Confirm Password"
              dataTestId={TEST_ID.confirmPasswordInput}
              autoComplete="new-password"
            />

            <div className="flex items-start gap-3 mt-4 mb-2">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                data-testid={TEST_ID.agreedToTermsInput}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-emerald focus:ring-emerald dark:border-gray-600 dark:bg-dark-input dark:focus:ring-offset-dark-surface cursor-pointer"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400 leading-snug">
                I agree to the{" "}
                <Link
                  to="/terms"
                  className="text-emerald hover:text-emerald-hover transition-colors font-medium"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  to="/privacy"
                  className="text-emerald hover:text-emerald-hover transition-colors font-medium"
                >
                  Privacy Policy
                </Link>
              </span>
            </div>

            <div className="pt-2">
              <SubmitButton
                isLoading={isLoading}
                dataTestId={TEST_ID.submitButton}
                className="w-full"
              >
                {isLoading ? "Creating account..." : "Sign Up"}
              </SubmitButton>
            </div>
          </form>

          {statusComponents}

          <p className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-emerald hover:text-emerald-hover transition-colors"
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

export default CreateUser;
