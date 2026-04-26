import { useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import Modal from "./Modal";
import { CloseIcon, MenuIcon, MoonIcon, SunIcon, DiamondIcon, ArrowRightIcon } from "./Icons";
import useClickOutside from "../hooks/useClickOutside";

export default function Navbar() {
  const { currentUser, logout, theme, toggleTheme } = useAppContext();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [logoutModal, setLogoutModal] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);
  const enrolledCount = currentUser
    ? (currentUser.enrolledCourseIds || []).filter(
        (id) => !(currentUser.completedCourseIds || []).includes(id)
      ).length
    : 0;

  const isActive = (path) => location.pathname === path;
  const closeMenu = () => setMenuOpen(false);
  useClickOutside(profileMenuRef, () => setProfileMenuOpen(false));

  const confirmLogout = () => {
    logout();
    setLogoutModal(false);
    setMenuOpen(false);
    navigate("/");
  };

  return (
    <>
      <header
        className="sticky top-0 z-[100] border-b border-[rgba(255,255,255,0.07)] bg-sidebar/95 backdrop-blur-md"
      >
        <nav
          className="max-w-[1200px] mx-auto px-4 sm:px-5 h-[62px] flex items-center gap-4 sm:gap-8"
          aria-label="Main navigation"
        >
          <Link
            to="/"
            onClick={closeMenu}
            aria-label="Courseware home"
            className="flex items-center gap-2.5 no-underline shrink-0 leading-none"
          >
            <span className="text-brand leading-none" aria-hidden="true"><DiamondIcon size={20} /></span>
            <span className="font-heading text-[1.1rem] text-text-primary font-bold leading-none">
              Courseware
            </span>
          </Link>

          <ul
            className="hidden sm:flex gap-1 flex-1 list-none"
            role="list"
            aria-label="Site navigation"
          >
            {[
              { to: "/", label: "Home" },
              { to: "/courses", label: "Courses" },
              ...(currentUser ? [{ to: "/community", label: "Community" }] : []),
              ...(currentUser ? [{ to: "/dashboard", label: "Dashboard" }] : []),
            ].map(({ to, label }) => (
              <li key={to}>
                <Link
                  to={to}
                  aria-current={isActive(to) ? "page" : undefined}
                  className={`px-3 py-1.5 rounded-md no-underline text-[0.88rem] font-medium transition-colors ${
                    isActive(to)
                      ? "text-text-primary bg-[rgba(245,158,11,0.14)]"
                      : "text-text-dim bg-transparent hover:text-text-primary"
                  }`}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="hidden sm:flex items-center gap-3 shrink-0">
            <Link
              to="/support"
              className="px-3 py-1.5 rounded-md text-[0.83rem] font-medium no-underline text-text-dim border border-[rgba(255,255,255,0.1)] transition-colors hover:text-text-primary"
            >
              Support
            </Link>

            <button
              onClick={toggleTheme}
              className="w-9 h-9 rounded-md text-text-dim cursor-pointer border border-[rgba(255,255,255,0.1)] transition-colors hover:text-text-primary bg-transparent inline-flex items-center justify-center"
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
              title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark" ? <SunIcon size={16} /> : <MoonIcon size={16} />}
            </button>

            {currentUser ? (
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => setProfileMenuOpen((v) => !v)}
                  className="h-9 w-9 rounded-full border border-[rgba(255,255,255,0.14)] overflow-hidden cursor-pointer bg-surface-muted"
                  aria-label="Open profile menu"
                  aria-expanded={profileMenuOpen}
                  aria-haspopup="menu"
                >
                  {currentUser.profileImage ? (
                    <img
                      src={currentUser.profileImage}
                      alt={`${currentUser.name} profile`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="h-full w-full inline-flex items-center justify-center text-[0.78rem] font-bold text-brand">
                      {currentUser.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </button>

                {profileMenuOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 top-[calc(100%+8px)] w-64 rounded-xl border border-[rgba(255,255,255,0.1)] bg-surface shadow-[0_14px_34px_rgba(0,0,0,0.35)] p-2 z-[120]"
                  >
                    <div className="px-2.5 pt-2 pb-2 mb-1 border-b border-[rgba(255,255,255,0.08)]">
                      <p className="text-[0.82rem] font-semibold text-text-primary leading-tight">
                        {currentUser.name}
                      </p>
                      <p className="text-[0.74rem] text-text-dim truncate mt-1">
                        {currentUser.email}
                      </p>
                    </div>

                    <Link
                      to="/dashboard?tab=enrolled"
                      onClick={() => setProfileMenuOpen(false)}
                      role="menuitem"
                      className="flex items-center justify-between rounded-lg px-2.5 py-2 no-underline text-[0.84rem] text-text-secondary hover:bg-[rgba(255,255,255,0.04)]"
                    >
                      <span>My Enrolled Courses</span>
                      <span className="px-2 py-0.5 rounded-full text-[0.72rem] font-bold text-brand bg-[rgba(217,119,6,0.14)]">
                        {enrolledCount}
                      </span>
                    </Link>

                    <div className="my-1 h-px bg-[rgba(255,255,255,0.08)]" />

                    <Link
                      to="/dashboard"
                      onClick={() => setProfileMenuOpen(false)}
                      role="menuitem"
                      className="block rounded-lg px-2.5 py-2 no-underline text-[0.85rem] text-text-secondary hover:bg-[rgba(255,255,255,0.04)]"
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/community"
                      onClick={() => setProfileMenuOpen(false)}
                      role="menuitem"
                      className="block rounded-lg px-2.5 py-2 no-underline text-[0.85rem] text-text-secondary hover:bg-[rgba(255,255,255,0.04)]"
                    >
                      Community
                    </Link>
                    <Link
                      to="/certificates"
                      onClick={() => setProfileMenuOpen(false)}
                      role="menuitem"
                      className="block rounded-lg px-2.5 py-2 no-underline text-[0.85rem] text-text-secondary hover:bg-[rgba(255,255,255,0.04)]"
                    >
                      Certificates
                    </Link>
                    <button
                      onClick={() => {
                        setProfileMenuOpen(false);
                        setLogoutModal(true);
                      }}
                      role="menuitem"
                      className="w-full text-left rounded-lg px-2.5 py-2 text-[0.85rem] text-[#ef4444] hover:bg-[rgba(239,68,68,0.08)] border-none cursor-pointer"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="no-underline text-[0.88rem] font-medium text-text-muted hover:text-text-primary transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-1.5 rounded-md no-underline font-bold text-[0.83rem] bg-brand text-base"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          <button
            className="sm:hidden ml-auto border-none cursor-pointer p-1.5 flex items-center justify-center"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
          >
            <span className="text-text-secondary" aria-hidden="true">
              {menuOpen ? <CloseIcon size={20} /> : <MenuIcon size={20} />}
            </span>
          </button>
        </nav>

        {menuOpen && (
          <nav
            id="mobile-menu"
            className="sm:hidden border-t border-[rgba(255,255,255,0.07)] flex flex-col gap-1 px-5 py-4 bg-sidebar"
            aria-label="Mobile navigation"
          >
            <ul className="list-none flex flex-col" role="list">
              {[
                { to: "/", label: "Home" },
                { to: "/courses", label: "Courses" },
                ...(currentUser ? [{ to: "/community", label: "Community" }] : []),
                { to: "/support", label: "Support" },
                ...(currentUser ? [{ to: "/dashboard", label: "Dashboard" }] : []),
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link
                    to={to}
                    onClick={closeMenu}
                    aria-current={isActive(to) ? "page" : undefined}
                    className="block py-3 px-2 no-underline text-[0.95rem] font-medium text-text-secondary border-b border-[rgba(255,255,255,0.04)]"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>

            <hr className="my-2 border-[rgba(255,255,255,0.06)]" />

            <button
              onClick={toggleTheme}
              className="py-3 px-2 text-left border-none cursor-pointer text-[0.95rem] text-text-secondary bg-transparent inline-flex items-center gap-2"
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            >
              {theme === "dark" ? <SunIcon size={16} /> : <MoonIcon size={16} />}
              <span>{theme === "dark" ? "Light" : "Dark"} mode</span>
            </button>

            <hr className="my-2 border-[rgba(255,255,255,0.06)]" />

            {currentUser ? (
              <button
                onClick={() => {
                  setMenuOpen(false);
                  setLogoutModal(true);
                }}
                className="py-3 px-2 text-left border-none cursor-pointer text-[0.95rem] text-text-dim bg-transparent"
              >
                Log out
              </button>
            ) : (
              <ul className="list-none flex flex-col" role="list">
                <li>
                  <Link
                    to="/login"
                    onClick={closeMenu}
                    className="block py-3 px-2 no-underline text-[0.95rem] font-medium text-text-secondary border-b border-[rgba(255,255,255,0.04)]"
                  >
                    Sign in
                  </Link>
                </li>
                <li>
                  <Link
                    to="/register"
                    onClick={closeMenu}
                    className="flex items-center gap-1.5 py-3 px-2 no-underline text-[0.95rem] font-bold text-brand"
                  >
                    Get Started <ArrowRightIcon size={14} />
                  </Link>
                </li>
              </ul>
            )}
          </nav>
        )}
      </header>

      <Modal isOpen={logoutModal} onClose={() => setLogoutModal(false)} title="Log Out?">
        <p className="text-text-muted mb-6 text-[0.95rem] leading-relaxed">
          Are you sure you want to log out?
        </p>
        <div className="flex gap-3">
          <button
            onClick={confirmLogout}
            className="flex-1 py-3 rounded-lg font-bold text-[0.9rem] cursor-pointer border-none text-white bg-[#ef4444]"
          >
            Yes, Log Out
          </button>
          <button
            onClick={() => setLogoutModal(false)}
            className="flex-1 py-3 rounded-lg font-medium text-[0.9rem] cursor-pointer text-text-primary border border-[rgba(255,255,255,0.12)] bg-transparent"
          >
            Cancel
          </button>
        </div>
      </Modal>
    </>
  );
}
