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
    navigate("/");
    setMenuOpen(false);
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <header style={styles.navbar}>
      <style>{`
        @media (max-width: 600px) {
          .nav-links-desktop { display: none !important; }
          .nav-auth-desktop { display: none !important; }
          .nav-hamburger { display: flex !important; }
        }
        @media (min-width: 601px) {
          .nav-mobile-menu { display: none !important; }
          .nav-hamburger { display: none !important; }
        }
      `}</style>

      <nav style={styles.inner} aria-label="Main navigation">
        <Link to="/" style={styles.logo} aria-label="Home" onClick={closeMenu}>
          <span style={styles.logoMark}>◈</span>
          <span style={styles.logoText}>Courseware</span>
        </Link>

        {/* Desktop links */}
        <div className="nav-links-desktop" style={styles.links}>
          <Link to="/" style={isActive("/") ? { ...styles.link, ...styles.linkActive } : styles.link}>Home</Link>
          <Link to="/courses" style={isActive("/courses") ? { ...styles.link, ...styles.linkActive } : styles.link}>Courses</Link>
          {currentUser && (
            <Link to="/dashboard" style={isActive("/dashboard") ? { ...styles.link, ...styles.linkActive } : styles.link}>Dashboard</Link>
          )}
        </div>

        {/* Desktop auth */}
        <div className="nav-auth-desktop" style={styles.authArea}>
          {currentUser ? (
            <>
              <span style={styles.userName}>{currentUser.name.split(" ")[0]}</span>
              <button onClick={handleLogout} style={styles.logoutBtn}>Log out</button>
            </>
          ) : (
            <>
              <Link to="/login" style={styles.loginLink}>Sign in</Link>
              <Link to="/register" style={styles.registerBtn}>Get Started</Link>
            </>
          )}
        </div>

        {/* Hamburger */}
        <button
          className="nav-hamburger"
          onClick={() => setMenuOpen((v) => !v)}
          style={styles.hamburger}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
        >
          <span style={{ fontSize: "1.3rem", color: "#e8e6e0" }}>{menuOpen ? "✕" : "☰"}</span>
        </button>
      </nav>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="nav-mobile-menu" style={styles.mobileMenu} role="navigation">
          <Link to="/" style={styles.mobileLink} onClick={closeMenu}>Home</Link>
          <Link to="/courses" style={styles.mobileLink} onClick={closeMenu}>Courses</Link>
          {currentUser && <Link to="/dashboard" style={styles.mobileLink} onClick={closeMenu}>Dashboard</Link>}
          <div style={styles.mobileDivider} />
          {currentUser ? (
            <button onClick={handleLogout} style={styles.mobileLogout}>Log out</button>
          ) : (
            <>
              <Link to="/login" style={styles.mobileLink} onClick={closeMenu}>Sign in</Link>
              <Link to="/register" style={{ ...styles.mobileLink, color: "#d97706", fontWeight: 700 }} onClick={closeMenu}>Get Started →</Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}

const styles = {
  navbar: { position: "sticky", top: 0, zIndex: 100, backgroundColor: "rgba(12,12,14,0.96)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,0.07)" },
  inner: { maxWidth: "1200px", margin: "0 auto", padding: "0 1.25rem", height: "62px", display: "flex", alignItems: "center", gap: "2rem" },
  logo: { display: "flex", alignItems: "center", gap: "0.5rem", textDecoration: "none", flexShrink: 0 },
  logoMark: { color: "#d97706", fontSize: "1.2rem" },
  logoText: { fontFamily: "'Playfair Display', serif", fontSize: "1.1rem", color: "#f5f2ec", fontWeight: 700 },
  links: { display: "flex", gap: "0.25rem", flex: 1 },
  link: { padding: "0.4rem 0.75rem", borderRadius: "6px", textDecoration: "none", color: "#6b7280", fontSize: "0.88rem", fontWeight: 500, fontFamily: "'DM Sans', sans-serif", transition: "color 0.15s" },
  linkActive: { color: "#f5f2ec", backgroundColor: "rgba(255,255,255,0.05)" },
  authArea: { display: "flex", alignItems: "center", gap: "0.75rem", flexShrink: 0 },
  userName: { fontSize: "0.85rem", color: "#9ca3af", fontFamily: "'DM Sans', sans-serif" },
  logoutBtn: { padding: "0.4rem 0.9rem", backgroundColor: "transparent", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", color: "#6b7280", fontFamily: "'DM Sans', sans-serif", fontSize: "0.83rem", cursor: "pointer" },
  loginLink: { textDecoration: "none", color: "#9ca3af", fontSize: "0.88rem", fontFamily: "'DM Sans', sans-serif", fontWeight: 500 },
  registerBtn: { padding: "0.45rem 1rem", backgroundColor: "#d97706", color: "#0c0c0e", borderRadius: "6px", textDecoration: "none", fontWeight: 700, fontSize: "0.83rem", fontFamily: "'DM Sans', sans-serif" },
  hamburger: { display: "none", marginLeft: "auto", background: "none", border: "none", cursor: "pointer", padding: "0.4rem", alignItems: "center", justifyContent: "center" },
  mobileMenu: { borderTop: "1px solid rgba(255,255,255,0.07)", backgroundColor: "#111114", padding: "1rem 1.25rem", display: "flex", flexDirection: "column", gap: "0.25rem" },
  mobileLink: { display: "block", padding: "0.75rem 0.5rem", textDecoration: "none", color: "#d1cfc8", fontSize: "0.95rem", fontFamily: "'DM Sans', sans-serif", fontWeight: 500, borderBottom: "1px solid rgba(255,255,255,0.04)" },
  mobileDivider: { height: "1px", backgroundColor: "rgba(255,255,255,0.06)", margin: "0.5rem 0" },
  mobileLogout: { padding: "0.75rem 0.5rem", background: "none", border: "none", color: "#6b7280", fontFamily: "'DM Sans', sans-serif", fontSize: "0.95rem", cursor: "pointer", textAlign: "left" },
};
