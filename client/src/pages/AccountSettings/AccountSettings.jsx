import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useFetch from "../../hooks/useFetch";
import { useAuth } from "../../hooks/useAuth";

const AccountSettings = () => {
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();

  // Change Password State
  const [passwordCode, setPasswordCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isPasswordCodeSent, setIsPasswordCodeSent] = useState(false);

  // Change Email State
  const [newEmail, setNewEmail] = useState("");
  const [emailCode, setEmailCode] = useState("");
  const [isEmailCodeSent, setIsEmailCodeSent] = useState(false);

  // Delete Account State
  const [deleteCode, setDeleteCode] = useState("");
  const [isDeleteCodeSent, setIsDeleteCodeSent] = useState(false);
  const [success, setSuccess] = useState("");

  // --- Handlers for Success ---
  const onPasswordChanged = () => {
    setPasswordCode("");
    setNewPassword("");
    setIsPasswordCodeSent(false);
    setSuccess("Password updated successfully!");
    setTimeout(() => setSuccess(""), 5000);
  };

  const onEmailVerified = (data) => {
    if (data?.user) {
      login(data.user);
    }
    setNewEmail("");
    setEmailCode("");
    setIsEmailCodeSent(false);
    setSuccess("Email updated successfully!");
    setTimeout(() => setSuccess(""), 5000);
  };

  const onDeleted = async () => {
    await logout();
    navigate("/login");
  };

  // --- useFetch Hooks for actions ---
  const {
    isLoading: isChangingPassword,
    error: passwordError,
    performFetch: performPasswordChange,
  } = useFetch("/users/password", onPasswordChanged);

  const {
    isLoading: isVerifyingEmail,
    error: emailVerifyError,
    performFetch: performEmailVerify,
  } = useFetch("/users/verify-email-change", onEmailVerified);

  const {
    isLoading: isDeleting,
    error: deleteError,
    performFetch: performDelete,
  } = useFetch("/users/account", onDeleted);

  // --- Generic Security Code Requests ---
  const {
    isLoading: isRequestingPassCode,
    error: passReqError,
    performFetch: performPassCodeReq,
  } = useFetch("/users/request-security-code", () =>
    setIsPasswordCodeSent(true),
  );

  const {
    isLoading: isRequestingDeleteCode,
    error: deleteReqError,
    performFetch: performDeleteCodeReq,
  } = useFetch("/users/request-security-code", () => setIsDeleteCodeSent(true));

  const {
    isLoading: isRequestingEmail,
    error: emailReqError,
    performFetch: performEmailReq,
  } = useFetch("/users/request-email-change", () => setIsEmailCodeSent(true));

  // --- Form Submissions ---
  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (!passwordCode || !newPassword) return;
    performPasswordChange({
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ code: passwordCode, newPassword }),
    });
  };

  const handleEmailRequest = (e) => {
    e.preventDefault();
    if (!newEmail || newEmail === user.email) return;
    performEmailReq({
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ newEmail }),
    });
  };

  const handleEmailVerify = (e) => {
    e.preventDefault();
    if (!emailCode || emailCode.length !== 6) return;
    performEmailVerify({
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ code: emailCode }),
    });
  };

  const handleDeleteAccount = (e) => {
    e.preventDefault();
    if (!deleteCode) return;
    if (
      window.confirm(
        "Are you absolutely sure you want to delete your account? This action cannot be undone.",
      )
    ) {
      performDelete({
        method: "DELETE",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ code: deleteCode }),
      });
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#1a1a1a] w-full flex items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-3xl bg-[#222222] rounded-2xl p-6 sm:p-10 border border-[#10B981] shadow-[0_0_80px_rgba(16,185,129,0.15)] relative">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 pb-4 border-b border-gray-800">
          <h1 className="text-3xl font-bold text-white mb-4 sm:mb-0">
            Account Settings
          </h1>

          <div className="flex items-center gap-3 bg-black/40 px-4 py-2 rounded-full border border-gray-800">
            <span className="text-sm font-medium text-gray-400 flex items-center gap-2">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </svg>
              Switch to Light Mode
            </span>
            <div className="w-10 h-6 bg-gray-700 rounded-full relative cursor-not-allowed opacity-60">
              <div className="w-4 h-4 bg-gray-400 rounded-full absolute left-1 top-1"></div>
            </div>
          </div>
        </div>

        {/* Status Messages */}
        {success && (
          <div className="bg-emerald/20 border border-emerald text-emerald px-4 py-3 rounded-xl mb-6 text-sm font-medium">
            {success}
          </div>
        )}
        {(passwordError ||
          emailVerifyError ||
          deleteError ||
          passReqError ||
          emailReqError ||
          deleteReqError) && (
          <div className="bg-red-500/20 border border-red-500 text-red-500 px-4 py-3 rounded-xl mb-6 text-sm font-medium">
            {passwordError?.toString() ||
              emailVerifyError?.toString() ||
              deleteError?.toString() ||
              passReqError?.toString() ||
              emailReqError?.toString() ||
              deleteReqError?.toString()}
          </div>
        )}

        {/* Personal Information */}
        <div className="mb-10">
          <h2 className="text-lg font-semibold text-white mb-4">
            Personal Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-sm text-gray-300">Full Name</label>
              <input
                type="text"
                defaultValue={user?.name || ""}
                className="bg-transparent border border-[#10B981] shadow-[0_0_10px_rgba(16,185,129,0.2)] text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#10B981] transition-all"
                placeholder="Full Name"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm text-gray-300">Email Address</label>
              <input
                type="email"
                value={newEmail || user?.email || ""}
                onChange={(e) => setNewEmail(e.target.value)}
                className="bg-transparent border border-gray-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-[#10B981] transition-all"
                placeholder="Email Address"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm text-gray-300">Phone Number</label>
              <input
                type="tel"
                defaultValue=""
                className="bg-transparent border border-gray-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-[#10B981] transition-all"
                placeholder="(555) 123-4567"
              />
            </div>
          </div>
        </div>

        {/* Security Section */}
        <div className="mb-10">
          <h2 className="text-lg font-semibold text-white mb-4">Security</h2>
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            <button
              type="button"
              disabled={isRequestingPassCode}
              className="px-6 py-2.5 bg-[#10B981] text-white text-sm font-semibold rounded-full hover:bg-[#059669] transition-colors shadow-lg shadow-[#10B981]/20 w-fit disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => performPassCodeReq({ method: "POST" })}
            >
              {isRequestingPassCode ? "Sending Code..." : "Change Password"}
            </button>

            <div className="flex items-center gap-3">
              <div className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  defaultChecked
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#10B981]"></div>
              </div>
              <span className="text-sm text-gray-300">
                Two-Factor Authentication
              </span>
            </div>
          </div>

          {/* Inline Password Change Block (only shows if triggered) */}
          {isPasswordCodeSent && (
            <form
              onSubmit={handlePasswordChange}
              className="mt-6 bg-black/30 p-5 rounded-xl border border-gray-800"
            >
              <p className="text-sm text-gray-400 mb-4">
                A 6-digit code has been sent to {user?.email}.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <input
                  type="text"
                  value={passwordCode}
                  onChange={(e) => setPasswordCode(e.target.value)}
                  className="flex-1 bg-transparent border border-gray-700 text-white px-4 py-3 rounded-xl focus:border-[#10B981] outline-none"
                  placeholder="Enter 6-digit Security Code"
                />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="flex-1 bg-transparent border border-gray-700 text-white px-4 py-3 rounded-xl focus:border-[#10B981] outline-none"
                  placeholder="New Password"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsPasswordCodeSent(false)}
                  className="px-5 py-2 text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#10B981] text-white text-sm font-semibold rounded-full hover:bg-[#059669] transition-colors"
                >
                  {isChangingPassword ? "Updating..." : "Update Password"}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Notifications Section */}
        <div className="mb-10">
          <h2 className="text-lg font-semibold text-white mb-4">
            Notifications
          </h2>
          <div className="flex items-center gap-8 mb-6">
            <div className="flex items-center gap-3">
              <div className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  defaultChecked
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#10B981]"></div>
              </div>
              <span className="text-sm text-gray-300">Email Alerts</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  defaultChecked
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#10B981]"></div>
              </div>
              <span className="text-sm text-gray-300">SMS Alerts</span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-300">
              Notification Radius (km)
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="0"
                max="50"
                defaultValue="15"
                className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#10B981]"
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0 km</span>
              <span className="text-gray-300">15 km</span>
              <span>50 km</span>
            </div>
          </div>
        </div>

        {/* Global Save Button */}
        <button
          type="button"
          onClick={handleEmailRequest}
          className="w-full py-4 bg-[#10B981] text-white text-base font-bold rounded-full hover:bg-emerald-hover transition-colors shadow-lg shadow-[#10B981]/20 mt-4 mb-6"
        >
          {isRequestingEmail ? "Saving..." : "Save Changes"}
        </button>

        {isEmailCodeSent && (
          <form
            onSubmit={handleEmailVerify}
            className="mb-6 bg-black/30 p-5 rounded-xl border border-gray-800"
          >
            <p className="text-sm text-gray-400 mb-4">
              A 6-digit code has been sent to {newEmail}.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <input
                type="text"
                value={emailCode}
                onChange={(e) => setEmailCode(e.target.value)}
                className="flex-1 bg-transparent border border-gray-700 text-white px-4 py-3 rounded-xl focus:border-[#10B981] outline-none"
                placeholder="Enter 6-digit Verification Code"
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsEmailCodeSent(false)}
                className="px-5 py-2 text-sm text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-[#10B981] text-white text-sm font-semibold rounded-full hover:bg-[#059669] transition-colors"
              >
                {isVerifyingEmail ? "Verifying..." : "Verify New Email"}
              </button>
            </div>
          </form>
        )}

        {/* Delete Account */}
        <div className="flex flex-col items-center justify-center mt-2 border-t border-gray-800 pt-6">
          {!isDeleteCodeSent ? (
            <button
              type="button"
              disabled={isRequestingDeleteCode}
              onClick={() => performDeleteCodeReq({ method: "POST" })}
              className="text-red-500 hover:text-red-400 font-medium text-sm transition-colors cursor-pointer border-b border-transparent hover:border-red-400 pb-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRequestingDeleteCode ? "Requesting..." : "Delete Account"}
            </button>
          ) : (
            <form
              onSubmit={handleDeleteAccount}
              className="w-full bg-red-500/10 p-5 rounded-xl border border-red-500/30"
            >
              <p className="text-sm text-red-400 mb-4 text-center">
                A code has been sent to your email. Enter it below to
                irrevocably delete your account.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <input
                  type="text"
                  value={deleteCode}
                  onChange={(e) => setDeleteCode(e.target.value)}
                  className="flex-1 bg-transparent border border-red-500/50 text-white px-4 py-3 rounded-xl focus:border-red-500 outline-none"
                  placeholder="Enter 6-digit Security Code"
                />
              </div>
              <div className="flex justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsDeleteCodeSent(false)}
                  className="px-5 py-2 text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-red-600 text-white text-sm font-semibold rounded-full hover:bg-red-700 transition-colors"
                >
                  {isDeleting ? "Deleting..." : "Confirm Deletion"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;
