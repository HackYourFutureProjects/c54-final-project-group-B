import { NavLink } from "react-router-dom";
import PropTypes from "prop-types";
import TEST_ID from "../Nav.testid";

const NavLinks = ({ user, unreadCount }) => {
  return (
    <ul className="navbar-links">
      <li>
        <NavLink
          to="/"
          className={({ isActive }) =>
            isActive ? "nav-item active" : "nav-item"
          }
        >
          Home
        </NavLink>
      </li>

      <li>
        <NavLink
          to="/listing/create"
          className={({ isActive }) =>
            isActive ? "nav-item active" : "nav-item"
          }
          data-testid={TEST_ID.linkToCreateListing}
        >
          Sell a Bike
        </NavLink>
      </li>

      <li>
        <NavLink
          to="/user"
          className={({ isActive }) =>
            isActive ? "nav-item active" : "nav-item"
          }
          data-testid={TEST_ID.linkToUsers}
        >
          Community
        </NavLink>
      </li>

      <li>
        <NavLink
          to="/favorites"
          className={({ isActive }) =>
            isActive ? "nav-item active" : "nav-item"
          }
        >
          Favorites
        </NavLink>
      </li>
      {user && (
        <li>
          <NavLink
            to="/my-listings"
            className={({ isActive }) =>
              isActive ? "nav-item active" : "nav-item"
            }
          >
            My Listings
          </NavLink>
        </li>
      )}
      {user && (
        <li>
          <NavLink
            to="/inbox"
            className={({ isActive }) =>
              isActive ? "nav-item active" : "nav-item"
            }
          >
            Inbox
            {unreadCount > 0 && (
              <span className="unread-badge">{unreadCount}</span>
            )}
          </NavLink>
        </li>
      )}
    </ul>
  );
};

NavLinks.propTypes = {
  user: PropTypes.object,
  unreadCount: PropTypes.number,
};

export default NavLinks;
