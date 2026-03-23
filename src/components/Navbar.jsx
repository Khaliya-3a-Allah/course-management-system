import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import Modal from "./Modal";

export default function Navbar() {
  const { currentUser, logout } = useAppContext();
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
        className="sticky top-0 z-[100] border-b border-[rgba(255,255,255,0.07)] bg-[rgba(12,12,14,0.96)]"
        style={{ backdropFilter: "blur(12px)" }}
      >
        <nav
          className="max-w-[1200px] mx-auto px-5 h-[62px] flex items-center gap-8"
          aria-label="Main navigation"
        >
          {/* Logo */}
          <Link
            to="/"
            onClick={closeMenu}
            aria-label="Courseware home"
            className="flex items-center gap-2 no-underline shrink-0"
          >
            <span className="text-brand text-xl" aria-hidden="true">◈</span>
            <span className="font-heading text-[1.1rem] text-text-primary font-bold">
              Courseware
            </span>
          </Link>

          {/* Desktop nav links */}
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
                      ? "text-text-primary bg-[rgba(255,255,255,0.05)]"
                      : "text-text-dim bg-transparent"
                  }`}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Desktop auth */}
          <div className="hidden sm:flex items-center gap-3 shrink-0">
            {currentUser ? (
              <>
                <span className="text-[0.85rem] text-text-muted">
                  {currentUser.name.split(" ")[0]}
                </span>
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

          {/* Hamburger — mobile only */}
          <button
            className="sm:hidden ml-auto border-none cursor-pointer p-1.5 flex items-center justify-center"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
          >
            <span className="text-[1.3rem] text-text-secondary" aria-hidden="true">
              {menuOpen ? "✕" : "☰"}
            </span>
          </button>
        </nav>

        {/* Mobile menu */}
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

            {currentUser ? (
              <button
                onClick={() => { setMenuOpen(false); setLogoutModal(true); }}
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

      {/* Logout modal */}
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