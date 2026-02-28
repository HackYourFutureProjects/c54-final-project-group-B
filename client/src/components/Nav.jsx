import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../hooks/useAuth";
import useNotifications from "../hooks/useNotifications";
import ThemeToggle from "./ui/ThemeToggle";
import {
  HeartIcon,
  ChatIcon,
  NotificationIcon,
  PlusIcon,
} from "./Nav/NavIcons";

const Nav = () => {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { name: "Explore", path: "/" },
    { name: "About", path: "/about" },
  ];

  const authLinks = user
    ? [
        { name: "My Listings", path: "/my-listings" },
        { name: "Favorites", path: "/favorites" },
        { name: "Inbox", path: "/inbox" },
      ]
    : [];

  if (user?.role === "admin") {
    authLinks.unshift({ name: "Dashboard", path: "/admin" });
  }

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-500 ${
        isScrolled
          ? "h-16 bg-white/90 dark:bg-[#121212]/90 backdrop-blur-xl border-b border-gray-200 dark:border-white/5 shadow-sm"
          : "h-20 bg-white/50 dark:bg-[#121212]/30 backdrop-blur-md border-b border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex items-center justify-between h-full">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-glow group-hover:scale-110 transition-transform duration-500">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="3"
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
            <span className="text-xl font-black text-gray-900 dark:text-white tracking-tighter">
              BiCycle
              <span className="text-emerald-500 text-2xl leading-none">L</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <div className="flex items-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-sm font-bold uppercase tracking-widest transition-all duration-300 ${
                    location.pathname === link.path
                      ? "text-emerald-500"
                      : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            <div className="h-6 w-px bg-gray-200 dark:bg-white/10" />

            <div className="flex items-center gap-5">
              <ThemeToggle />

              {user ? (
                <>
                  <Link
                    to="/favorites"
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors relative group"
                    title="Favorites"
                  >
                    <HeartIcon />
                    <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                      Favorites
                    </span>
                  </Link>

                  <Link
                    to="/inbox"
                    className="p-2 text-gray-400 hover:text-emerald-500 transition-colors relative group"
                    title="Messages"
                  >
                    <ChatIcon />
                    <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                      Messages
                    </span>
                  </Link>

                  <div className="relative group">
                    <NotificationIcon hasUnread={unreadCount > 0} />
                  </div>

                  <Link
                    to="/create-listing"
                    className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-glow active:scale-95"
                  >
                    <PlusIcon />
                    Post Ads
                  </Link>

                  <button
                    onClick={logout}
                    className="text-xs font-black text-gray-400 hover:text-red-500 uppercase tracking-widest transition-colors ml-2"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <div className="flex items-center gap-4">
                  <Link
                    to="/login"
                    className="text-xs font-black text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white uppercase tracking-widest transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-glow active:scale-95"
                  >
                    Join Now
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-4">
            <ThemeToggle />
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-gray-500 dark:text-gray-400"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {isMobileMenuOpen ? (
                  <>
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </>
                ) : (
                  <>
                    <line x1="3" y1="12" x2="21" y2="12" />
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <line x1="3" y1="18" x2="21" y2="18" />
                  </>
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white dark:bg-[#121212] border-b border-gray-100 dark:border-white/5 overflow-hidden"
          >
            <div className="px-4 py-6 space-y-4">
              {[...navLinks, ...authLinks].map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="block text-sm font-bold uppercase tracking-widest text-gray-600 dark:text-gray-400 hover:text-emerald-500 transition-colors"
                >
                  {link.name}
                </Link>
              ))}
              {user ? (
                <button
                  onClick={logout}
                  className="block w-full text-left text-sm font-bold uppercase tracking-widest text-red-500 pt-4 border-t border-gray-100 dark:border-white/5"
                >
                  Sign Out
                </button>
              ) : (
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100 dark:border-white/5">
                  <Link
                    to="/login"
                    className="flex items-center justify-center p-3 text-xs font-black uppercase tracking-widest bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-400 rounded-xl"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="flex items-center justify-center p-3 text-xs font-black uppercase tracking-widest bg-emerald-500 text-white rounded-xl shadow-glow"
                  >
                    Join
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Nav;
