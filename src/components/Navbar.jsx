import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

export default function Navbar() {
  const { currentUser, setCurrentUser } = useAppContext();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    setCurrentUser(null);
    setMenuOpen(false);
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-zinc-950/95 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-5" aria-label="Main navigation">
        <Link to="/" className="flex items-center gap-2" aria-label="Home" onClick={() => setMenuOpen(false)}>
          <span className="text-amber-600">*</span>
          <span className="font-display text-lg font-bold text-stone-100">Courseware</span>
        </Link>

        <div className="hidden flex-1 items-center gap-1 sm:flex">
          <Link
            to="/"
            className={`rounded-md px-3 py-1.5 text-sm ${
              isActive("/") ? "bg-white/10 text-stone-100" : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Home
          </Link>
          <Link
            to="/courses"
            className={`rounded-md px-3 py-1.5 text-sm ${
              isActive("/courses") ? "bg-white/10 text-stone-100" : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Courses
          </Link>
          {currentUser && (
            <Link
              to="/dashboard"
              className={`rounded-md px-3 py-1.5 text-sm ${
                isActive("/dashboard") ? "bg-white/10 text-stone-100" : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Dashboard
            </Link>
          )}
        </div>

        <div className="hidden items-center gap-3 sm:flex">
          {currentUser ? (
            <>
              <span className="text-sm text-zinc-400">{currentUser.name.split(" ")[0]}</span>
              <button
                onClick={handleLogout}
                className="rounded-md border border-white/15 px-3 py-1.5 text-sm text-zinc-300 hover:border-white/25"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm text-zinc-400 hover:text-zinc-200">
                Sign in
              </Link>
              <Link to="/register" className="rounded-md bg-amber-600 px-3.5 py-1.5 text-sm font-bold text-zinc-950 hover:bg-amber-500">
                Get Started
              </Link>
            </>
          )}
        </div>

        <button
          className="ml-auto inline-flex items-center justify-center rounded-md p-2 text-zinc-100 sm:hidden"
          onClick={() => setMenuOpen((value) => !value)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
        >
          {menuOpen ? "Close" : "Menu"}
        </button>
      </nav>

      {menuOpen && (
        <div className="border-t border-white/10 bg-zinc-900 px-5 py-4 sm:hidden" role="navigation">
          <div className="flex flex-col gap-1">
            <Link to="/" className="rounded-md px-2 py-2 text-zinc-200 hover:bg-white/5" onClick={() => setMenuOpen(false)}>
              Home
            </Link>
            <Link to="/courses" className="rounded-md px-2 py-2 text-zinc-200 hover:bg-white/5" onClick={() => setMenuOpen(false)}>
              Courses
            </Link>
            {currentUser && (
              <Link to="/dashboard" className="rounded-md px-2 py-2 text-zinc-200 hover:bg-white/5" onClick={() => setMenuOpen(false)}>
                Dashboard
              </Link>
            )}
          </div>
          <div className="my-3 h-px bg-white/10" />
          {currentUser ? (
            <button onClick={handleLogout} className="rounded-md px-2 py-2 text-left text-zinc-300 hover:bg-white/5">
              Log out
            </button>
          ) : (
            <div className="flex flex-col gap-1">
              <Link to="/login" className="rounded-md px-2 py-2 text-zinc-200 hover:bg-white/5" onClick={() => setMenuOpen(false)}>
                Sign in
              </Link>
              <Link to="/register" className="rounded-md px-2 py-2 font-semibold text-amber-500 hover:bg-amber-500/10" onClick={() => setMenuOpen(false)}>
                Get Started
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
