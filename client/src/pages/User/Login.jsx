import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { GoogleOAuthProvider, useGoogleLogin } from "@react-oauth/google";
import useApi from "../../hooks/useApi";
import InputField from "../../components/form/InputField";
import SubmitButton from "../../components/form/SubmitButton";
import { useAuth } from "../../hooks/useAuth";

const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  "placeholder-client-id.apps.googleusercontent.com";

const GoogleLoginButton = ({ onSuccess, onError }) => {
  const { execute: executeGoogleLogin, isLoading } = useApi();

  const handleGoogleSuccess = async (tokenResponse) => {
    try {
      const result = await executeGoogleLogin("/users/google", {
        method: "POST",
        body: { token: tokenResponse.access_token },
      });
      if (result.success) {
        onSuccess(result.user);
      }
    } catch (err) {
      onError(err.message || "Google login failed.");
    }
  };

  const login = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: () => onError("Google login was canceled or failed."),
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
        className="w-5 h-5 bg-white rounded-full p-0.5"
      />
      {isLoading ? "Signing in..." : "Continue with Google"}
    </button>
  );
};

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [validationError, setValidationError] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const from = location.state?.from || "/";

  const onSuccess = (data) => {
    const userToLogin = data.user || data;
    login(userToLogin);
    setEmail("");
    setPassword("");
    setValidationError("");
    navigate(from, { replace: true });
  };

  const { execute: executeLogin, isLoading, error } = useApi();

  const validateForm = () => {
    if (!email.trim()) {
      setValidationError("Email is required");
      return false;
    }
    if (!password) {
      setValidationError("Password is required");
      return false;
    }
    setValidationError("");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const data = await executeLogin("/users/login", {
      method: "POST",
      body: {
        email,
        password,
        rememberMe,
      },
    });

    if (data?.success) {
      onSuccess(data);
    }
  };

  let statusComponents = null;
  if (validationError) {
    statusComponents = (
      <div className="mt-4 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-sm text-red-600 dark:text-red-400 text-center flex items-center justify-center gap-2">
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
      <div className="mt-4 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-sm text-red-600 dark:text-red-400 text-center">
        {error.toString()}
      </div>
    );
  } else if (isLoading) {
    statusComponents = (
      <div className="mt-4 text-center text-sm text-primary flex items-center justify-center gap-2">
        <svg
          className="animate-spin -ml-1 mr-3 h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        Logging in...
      </div>
    );
  }

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div className="min-h-[calc(100vh-140px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full card-emerald p-8 sm:p-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h1 className="text-3xl font-bold text-center mb-8 tracking-tight">
            Welcome Back
          </h1>

          <GoogleLoginButton
            onSuccess={onSuccess}
            onError={setValidationError}
          />

          <div className="flex items-center text-center text-sm text-gray-500 dark:text-gray-400 my-6 before:flex-1 before:border-t before:border-gray-200 dark:before:border-dark-border before:mr-4 after:flex-1 after:border-t after:border-gray-200 dark:after:border-dark-border after:ml-4">
            or
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <InputField
              name="email"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="Email"
              autoComplete="username"
            />
            <InputField
              name="password"
              type="password"
              value={password}
              onChange={setPassword}
              placeholder="Password"
              autoComplete="current-password"
            />

            <div className="flex items-center justify-between text-sm mt-2">
              <label className="flex items-center gap-2 block text-gray-600 dark:text-gray-400 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-gray-300 text-primary focus:ring-primary dark:border-gray-600 dark:bg-dark-input dark:focus:ring-offset-dark-surface"
                />
                Remember Me
              </label>
              <Link
                to="/forgot-password"
                className="font-medium text-primary hover:text-primary-dark transition-colors"
              >
                Forgot Password?
              </Link>
            </div>

            <div className="pt-2">
              <SubmitButton isLoading={isLoading} className="w-full">
                Log in
              </SubmitButton>
            </div>
          </form>

          {statusComponents}

          <p className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
            Don&apos;t have an account?{" "}
            <Link
              to="/signup"
              className="font-medium text-primary hover:text-primary-dark transition-colors"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

export default Login;
