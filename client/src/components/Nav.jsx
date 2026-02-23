import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import TEST_ID from "./Nav.testid";
import NavLinks from "./Nav/NavLinks";
import NavProfile from "./Nav/NavProfile";
import "../styles/Nav.css";

const Nav = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  // Close menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      if (!user) return;
      try {
        const res = await fetch("/api/messages/unread-total");
        if (!res.ok) {
          if (res.status === 401) return; // Silent for unauthorized
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        if (data.success) {
          setUnreadCount(data.result);
        }
      } catch (err) {
        // Only log serious unexpected errors
        if (err.name !== "AbortError") {
          console.error("Failed to fetch unread count:", err);
        }
      }
    };

    fetchUnreadCount();
    // Poll every 30 seconds as a fallback
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="navbar" data-testid={TEST_ID.container}>
      {/* LEFT: Brand Logo */}
      <div className="navbar-brand-container">
        <Link to="/" className="navbar-brand" data-testid={TEST_ID.linkToHome}>
          🚲 BiCycleL
        </Link>

        <button
          className={`hamburger-menu ${isOpen ? "open" : ""}`}
          onClick={toggleMenu}
          aria-label="Toggle navigation"
        >
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </button>
      </div>

      {/* MIDDLE & RIGHT: Collapsible Content */}
      <div className={`navbar-collapse ${isOpen ? "show" : ""}`}>
        <NavLinks user={user} unreadCount={unreadCount} />
        <NavProfile user={user} onLogout={handleLogout} />
      </div>
    </nav>
  );
};

export default Nav;
