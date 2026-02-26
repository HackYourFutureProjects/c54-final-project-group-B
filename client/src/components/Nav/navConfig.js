/**
 * Navigation Configuration — Role Matrix
 *
 * rightZone: true     → desktop right zone only (Inbox/Settings)
 * desktopOnly: true   → excluded from mobile bottom bar
 * mobileOnly: true    → excluded from desktop center nav
 * noMobileTab: true   → excluded from mobile bottom bar (handled by top-bar profile button)
 * isCTA: true          → Sell button gets emerald circle CTA style on mobile
 * isAdmin: true        → violet color on desktop
 */

export const getNavLinks = (user) => {
  const role = user?.role || "guest";

  // ── Guest ──────────────────────────────────────────────────────────
  if (!user) {
    return [
      { path: "/", label: "Home", iconKey: "home" },
      { path: "/login", label: "Login", iconKey: "login" },
      { path: "/signup", label: "Sign Up", iconKey: "signup" },
    ];
  }

  // ── Admin ──────────────────────────────────────────────────────────
  if (role === "admin") {
    return [
      { path: "/", label: "Home", iconKey: "home" },
      {
        path: "/inbox",
        label: "Inbox",
        iconKey: "inbox",
        hasUnreadBadge: true,
        rightZone: true,
      },
      // Desktop-only admin sub-pages (center nav)
      {
        path: "/admin",
        label: "Dashboard",
        iconKey: "admin",
        desktopOnly: true,
        isAdmin: true,
      },
      {
        path: "/admin/users",
        label: "Users",
        iconKey: "users",
        desktopOnly: true,
        isAdmin: true,
      },
      {
        path: "/admin/listings",
        label: "Listings",
        iconKey: "adminListings",
        desktopOnly: true,
        isAdmin: true,
      },
      {
        path: "/admin/reports",
        label: "Reports",
        iconKey: "reports",
        desktopOnly: true,
        isAdmin: true,
      },
      // Settings → desktop right zone dropdown (NOT in mobile bottom bar)
      {
        path: "/account-settings",
        label: "Settings",
        iconKey: "settings",
        rightZone: true,
        noMobileTab: true,
      },
      // Mobile-only: single Admin Panel tab → /admin
      {
        path: "/admin",
        label: "Admin Panel",
        iconKey: "admin",
        mobileOnly: true,
      },
    ];
  }

  // ── Regular User ───────────────────────────────────────────────────
  return [
    // slot 1 — Home
    { path: "/", label: "Home", iconKey: "home" },
    // slot 2 — Favorites
    { path: "/favorites", label: "Favorites", iconKey: "favorites" },
    // slot 3 — Sell
    {
      path: "/listing/create",
      label: "Sell",
      iconKey: "sell",
      isCTA: true,
      testId: "linkToCreateListing",
    },
    // slot 4 — Inbox
    {
      path: "/inbox",
      label: "Inbox",
      iconKey: "inbox",
      hasUnreadBadge: true,
      rightZone: true,
    },
    // slot 5 — My Listings
    { path: "/my-listings", label: "My Listings", iconKey: "listings" },
    // Settings → desktop right zone dropdown (NOT in mobile bottom bar)
    {
      path: "/account-settings",
      label: "Settings",
      iconKey: "settings",
      rightZone: true,
      noMobileTab: true,
    },
  ];
};
