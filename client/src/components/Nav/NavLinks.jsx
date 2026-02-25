import { NavLink } from "react-router-dom";
import PropTypes from "prop-types";
import TEST_ID from "../Nav.testid";

const NavLinks = ({ user, unreadCount, isMobile }) => {
  const getNavClass = ({ isActive }) => {
    const base = isMobile
      ? "block px-3 py-2 rounded-md text-base font-medium transition-colors "
      : "inline-block text-sm font-medium transition-colors border-b-2 py-5 px-1 ";

    const stateColor = isActive
      ? isMobile
        ? "text-[#10B981] bg-[#10B981]/10"
        : "text-[#10B981] border-[#10B981]"
      : isMobile
        ? "text-gray-400 hover:text-[#10B981] hover:bg-white/5"
        : "text-gray-400 border-transparent hover:text-[#10B981] hover:border-[#10B981]/30";

    return base + stateColor;
  };

  const containerClass = isMobile
    ? "flex flex-col space-y-1"
    : "flex space-x-6 h-full";

  return (
    <ul className={containerClass}>
      <li>
        <NavLink to="/" className={getNavClass}>
          Home
        </NavLink>
      </li>

      <li>
        <NavLink
          to="/listing/create"
          className={getNavClass}
          data-testid={TEST_ID.linkToCreateListing}
        >
          Sell a Bike
        </NavLink>
      </li>

      <li>
        <NavLink
          to="/user"
          className={getNavClass}
          data-testid={TEST_ID.linkToUsers}
        >
          Community
        </NavLink>
      </li>

      <li>
        <NavLink to="/favorites" className={getNavClass}>
          Favorites
        </NavLink>
      </li>

      {user && (
        <li>
          <NavLink to="/my-listings" className={getNavClass}>
            My Listings
          </NavLink>
        </li>
      )}

      {user && (
        <li>
          <NavLink to="/inbox" className={getNavClass}>
            <span className="flex items-center">
              Inbox
              {unreadCount > 0 && (
                <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold leading-none text-white bg-emerald-500 rounded-full">
                  {unreadCount}
                </span>
              )}
            </span>
          </NavLink>
        </li>
      )}
    </ul>
  );
};

NavLinks.propTypes = {
  user: PropTypes.object,
  unreadCount: PropTypes.number,
  isMobile: PropTypes.bool,
};

export default NavLinks;
