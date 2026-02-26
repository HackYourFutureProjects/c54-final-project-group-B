import { useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import TEST_ID from "./Nav.testid";

import useUnreadCount from "../hooks/useUnreadCount";
import useNotifications from "../hooks/useNotifications";
import useKeyboardFocus from "../hooks/useKeyboardFocus";
import { DesktopNavLinks, MobileNavLinks } from "./Nav/NavLinks";
import NavNotifications from "./Nav/NavNotifications";
import { ThemeToggle } from "./ui";

/* ─── Inline SVG helpers ─────────────────────────────────────────────── */
const LogoutIcon = () => (
  <svg
    width="17"
    height="17"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const SettingsIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

const InboxIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  </svg>
);

const ProfileIcon = () => (
  <svg
    width="17"
    height="17"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const UserAvatarIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
  </svg>
);

const Nav = () => {
  const { user, logout } = useAuth();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMobileSettingsOpen, setIsMobileSettingsOpen] = useState(false);

  const isKeyboardOpen = useKeyboardFocus();
  const unreadMessagesCount = useUnreadCount(user);
  useNotifications();

  const navigate = useNavigate();
  const location = useLocation();
  const settingsRef = useRef(null);

  const isChatRoute = location.pathname.startsWith("/chat");
  const isMinimalNav = isChatRoute;

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    setIsNotifOpen(false);
    setIsSettingsOpen(false);
    setIsMobileSettingsOpen(false);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [location.pathname]);

  useEffect(() => {
    const handler = (e) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target)) {
        setIsSettingsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = async () => {
    setIsSettingsOpen(false);
    setIsMobileSettingsOpen(false);
    await logout();
    navigate("/login");
  };

  const profileHref = user
    ? `/profile/${encodeURIComponent(user.name || user._id || user.id)}`
    : "/login";

  const isSettingsActive = location.pathname === "/account-settings";

  return (
    <>
      <nav
        className="sticky top-0 left-0 right-0 z-50 w-full bg-white/90 dark:bg-[#121212]/90 backdrop-blur-xl border-b border-gray-200 dark:border-[#1e1e1e] transition-all duration-300"
        data-testid={TEST_ID.container}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-14 gap-4">
            {/* LEFT: Logo */}
            <div className="flex-shrink-0">
              <Link
                to="/"
                className="flex items-center gap-2 text-xl font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
              >
                <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white flex-shrink-0">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5.5 17a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
                    <path d="M18.5 17a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
                    <path d="M15 6H9c-1.5 0-3 1-3 3l.5 3.5" />
                    <path d="M15 6c1.5 0 3 1 3 3l-.5 3.5" />
                    <path d="M12 6V3" />
                  </svg>
                </div>
                <span className="hidden sm:inline tracking-tight">
                  BiCycleL
                </span>
              </Link>
            </div>

            {/* CENTER: Desktop link centering */}
            {!isMinimalNav && (
              <div className="hidden md:flex flex-1 items-center justify-center h-full">
                <div className="flex items-center gap-8">
                  <DesktopNavLinks
                    user={user}
                    unreadCount={unreadMessagesCount}
                  />
                </div>
              </div>
            )}

            {/* RIGHT: Actions */}
            <div className="flex items-center gap-1.5 ml-auto">
              {/* Theme Toggle */}
              <ThemeToggle />

              {/* Mobile: Notifications Top-Bar */}
              {!isMinimalNav && user && (
                <div className="md:hidden">
                  <NavNotifications
                    user={user}
                    isOpen={isNotifOpen}
                    setIsOpen={setIsNotifOpen}
                  />
                </div>
              )}

              {/* Mobile: Profile Picture / Settings Top-Bar (REPLACES HOME) */}
              {!isMinimalNav && user && (
                <button
                  onClick={() => setIsMobileSettingsOpen(true)}
                  className="md:hidden flex items-center justify-center w-9 h-9 rounded-xl transition-all"
                >
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt="profile"
                      className="w-7 h-7 rounded-full object-cover ring-2 ring-emerald-500/20"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                      {(user.name || "U").charAt(0).toUpperCase()}
                    </div>
                  )}
                </button>
              )}

              {/* Desktop Only Actions */}
              {!isMinimalNav && user && (
                <div className="hidden md:flex items-center gap-1.5 pl-3 border-l border-gray-200 dark:border-white/10">
                  {/* Inbox with Unread Badge */}
                  <NavLink
                    to="/inbox"
                    className={({ isActive }) =>
                      "relative flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200 " +
                      (isActive
                        ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10"
                        : "text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-gray-100 dark:hover:bg-white/5")
                    }
                  >
                    <InboxIcon />
                    {unreadMessagesCount > 0 && (
                      <span className="absolute -top-1 -right-1 inline-flex items-center justify-center min-w-[16px] h-[16px] text-[9px] font-bold text-white bg-red-500 border-[1.5px] border-white dark:border-[#121212] rounded-full px-0.5">
                        {unreadMessagesCount > 99 ? "99+" : unreadMessagesCount}
                      </span>
                    )}
                  </NavLink>

                  {/* Notifications */}
                  <NavNotifications
                    user={user}
                    isOpen={isNotifOpen}
                    setIsOpen={setIsNotifOpen}
                  />

                  {/* Settings Dropdown */}
                  <div className="relative" ref={settingsRef}>
                    <button
                      onClick={() => setIsSettingsOpen((p) => !p)}
                      className={
                        "flex items-center justify-center w-9 h-9 rounded-xl transition-all " +
                        (isSettingsActive || isSettingsOpen
                          ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10"
                          : "text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-gray-100 dark:hover:bg-white/5")
                      }
                    >
                      <SettingsIcon />
                    </button>
                    {isSettingsOpen && (
                      <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-[#1a1a1a] rounded-2xl border border-gray-200 dark:border-white/10 shadow-xl py-1.5 z-[100]">
                        <Link
                          to="/account-settings"
                          onClick={() => setIsSettingsOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 mx-1 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl transition-colors"
                        >
                          <SettingsIcon />
                          Account Settings
                        </Link>
                        <div className="my-1 mx-3 border-t border-gray-100 dark:border-white/5" />
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 px-4 py-2.5 mx-1 text-sm font-medium text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors w-[calc(100%-8px)]"
                        >
                          <LogoutIcon />
                          Log Out
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Desktop: Profile Far Right */}
                  <Link
                    to={profileHref}
                    className="flex items-center justify-center w-9 h-9 rounded-full ring-2 ring-transparent hover:ring-emerald-500/40 transition-all ml-1"
                    aria-label="Your profile"
                  >
                    {user.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt="profile"
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center text-gray-500 dark:text-gray-400">
                        <UserAvatarIcon />
                      </div>
                    )}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* MOBILE BOTTOM TAB BAR */}
      {!isMinimalNav && !isKeyboardOpen && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 h-14 bg-white/95 dark:bg-[#121212]/95 backdrop-blur-xl border-t border-gray-200 dark:border-[#1e1e1e] shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
          <MobileNavLinks user={user} unreadCount={unreadMessagesCount} />
        </div>
      )}

      {/* MOBILE SETTINGS BOTTOM SHEET */}
      {isMobileSettingsOpen && user && (
        <>
          <div
            className="md:hidden fixed inset-0 z-[70] bg-black/40 backdrop-blur-sm"
            onClick={() => setIsMobileSettingsOpen(false)}
          />
          <div className="md:hidden fixed bottom-0 left-0 right-0 z-[80] bg-white dark:bg-[#1a1a1a] rounded-t-3xl border-t border-gray-200 dark:border-white/10 shadow-2xl pb-safe">
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
            </div>
            <div className="px-4 py-3">
              <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3 px-1">
                Menu
              </p>
              <div className="flex items-center gap-3 p-3 mb-3 bg-gray-50 dark:bg-white/5 rounded-2xl">
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt="avatar"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <UserAvatarIcon />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-bold truncate">
                    {user.name || "User"}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    {user.email || ""}
                  </p>
                </div>
              </div>
              <Link
                to={profileHref}
                onClick={() => setIsMobileSettingsOpen(false)}
                className="flex items-center gap-3 px-4 py-3 mb-1 text-sm font-medium hover:bg-gray-50 dark:hover:bg-white/5 rounded-2xl transition-colors"
              >
                <span className="w-9 h-9 flex items-center justify-center bg-gray-100 dark:bg-white/10 rounded-xl">
                  <ProfileIcon />
                </span>
                <span>View Profile</span>
              </Link>
              <Link
                to="/account-settings"
                onClick={() => setIsMobileSettingsOpen(false)}
                className="flex items-center gap-3 px-4 py-3 mb-1 text-sm font-medium hover:bg-gray-50 dark:hover:bg-white/5 rounded-2xl transition-colors"
              >
                <span className="w-9 h-9 flex items-center justify-center bg-gray-100 dark:bg-white/10 rounded-xl">
                  <SettingsIcon />
                </span>
                <span>Account Settings</span>
              </Link>
              <div className="my-2 border-t border-gray-100 dark:border-white/5" />
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-2xl transition-colors"
              >
                <span className="w-9 h-9 flex items-center justify-center bg-red-50 dark:hover:bg-red-500/10 rounded-xl">
                  <LogoutIcon />
                </span>
                <span>Log Out</span>
              </button>
              <div className="h-4" />
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Nav;
