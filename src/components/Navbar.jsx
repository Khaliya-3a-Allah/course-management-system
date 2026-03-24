import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import Modal from "./Modal";
import { CloseIcon, MenuIcon, MoonIcon, SunIcon } from "./Icons";

export default function Navbar() {
  const { currentUser, logout, theme, toggleTheme } = useAppContext();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [logoutModal, setLogoutModal] = useState(false);

  const isActive = (path) => location.pathname === path;
  const closeMenu = () => setMenuOpen(false);

  const confirmLogout = () => {
    logout();
    setLogoutModal(false);
    setMenuOpen(false);
    navigate("/");
  };

  return (
    <>
      <header
        className="sticky top-0 z-[100] border-b border-[rgba(255,255,255,0.07)] bg-sidebar/95"
        style={{ backdropFilter: "blur(12px)" }}
      >
        <nav
          className="max-w-[1200px] mx-auto px-5 h-[62px] flex items-center gap-8"
          aria-label="Main navigation"
        >
          <Link
            to="/"
            onClick={closeMenu}
            aria-label="Courseware home"
            className="flex items-center gap-2.5 no-underline shrink-0 leading-none"
          >
            <span className="inline-block w-2.5 h-2.5 bg-brand rotate-45 rounded-[1px]" aria-hidden="true" />
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
              <>
                <span className="text-[0.85rem] text-text-muted">{currentUser.name.split(" ")[0]}</span>
                <button
                  onClick={() => setLogoutModal(true)}
                  className="px-3.5 py-1.5 rounded-md text-[0.83rem] text-text-dim cursor-pointer border border-[rgba(255,255,255,0.1)] transition-colors hover:text-text-muted bg-transparent"
                >
                  Log out
                </button>
              </>
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
                    className="block py-3 px-2 no-underline text-[0.95rem] font-bold text-brand"
                  >
                    Get Started →
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
