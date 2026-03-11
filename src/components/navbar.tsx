import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

// ── ThemeSwitch ──────────────────────────────────────────────────────────────
const ThemeSwitch = ({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: () => void;
}) => (
  <label
    style={{
      fontSize: "17px",
      position: "relative",
      display: "inline-block",
      width: "3.3em",
      height: "1.8em",
      borderRadius: "30px",
      boxShadow: "0 0 10px rgba(0,0,0,0.1)",
      cursor: "pointer",
      flexShrink: 0,
    }}
  >
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      style={{ opacity: 0, width: 0, height: 0 }}
    />
    <span
      style={{
        position: "absolute",
        cursor: "pointer",
        inset: 0,
        backgroundColor: checked ? "#00a6ff" : "#2a2a2a",
        transition: "background-color 0.4s",
        borderRadius: "30px",
        overflow: "hidden",
      }}
    >
      { /* Moon & Sun */ }
      <span
        style={{
          position: "absolute",
          height: "1.2em",
          width: "1.2em",
          borderRadius: "10px",
          bottom: "0.3em",
          transition: "transform 0.4s, box-shadow 0.4s",
          transitionTimingFunction: "cubic-bezier(0.81, -0.04, 0.38, 1.5)",
          boxShadow: checked
            ? "inset 15px -4px 0px 15px #ffcf48"
            : "inset 8px -4px 0px 0px #fff",
          transform: checked ? "translateX(1.8em)" : "translateX(0.3em)",
        }}
      />

      
    </span>
  </label>
);

// ── Navbar ───────────────────────────────────────────────────────────────────
const Navbar = () => {
  const { pathname } = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [loginHovered, setLoginHovered] = useState(false);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const links = [
    { label: "Home",        path: "/" },
    { label: "Our Project", path: "/project" },
    { label: "About Us",    path: "/about" },
    { label: "Contact Us",  path: "/contact" },
  ];

  const linkStyle = (path: string): React.CSSProperties => ({
    textDecoration: "none",
    fontSize: "0.9rem",
    fontFamily: "'Inter', sans-serif",
    letterSpacing: "0.02em",
    transition: "color 0.2s",
    color: pathname === path ? "#E24E40" : hoveredLink === path ? "#D9D9D9" : "#FFFFFF",
    position: "relative",
    paddingBottom: "3px",
  });

  const underlineStyle = (isHovered: boolean, isActive: boolean): React.CSSProperties => ({
    position: "absolute",
    bottom: 0,
    left: 0,
    width: isHovered || isActive ? "100%" : "0%",
    height: "2px",
    background: isActive ? "#E24E40" : "#D9D9D9",
    transition: "width 0.25s ease",
    borderRadius: "2px",
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        @media (max-width: 768px) {
          .navbar-wrapper { padding: 10px 1rem 0 !important; }
          .navbar-inner { padding: 0.8rem 1.2rem !important; border-radius: 14px !important; }
          .navbar-links { gap: 1.2rem !important; }
        }
      `}</style>

      <div
        className="navbar-wrapper"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          zIndex: 100,
          display: "flex",
          justifyContent: "center",
          padding: "15px 2rem 0",
          boxSizing: "border-box",
        }}
      >
        <nav
          className="navbar-inner"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "1rem 2rem",
            fontFamily: "'Inter', sans-serif",
            borderRadius: "10px",
            width: "100%",
            maxWidth: "1600px",
            transition: "all 0.3s ease",
            background: scrolled
              ? "rgba(255, 255, 255, 0.12)"
              : "rgba(255, 255, 255, 0.06)",
            backdropFilter: "blur(24px) saturate(180%)",
            WebkitBackdropFilter: "blur(24px) saturate(180%)",
            border: "1px solid rgba(255, 255, 255, 0.18)",
            boxShadow: scrolled
              ? "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.15)"
              : "0 4px 24px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.1)",
          }}
        >
          {/* Links */}
          <div className="navbar-links" style={{ display: "flex", gap: "3rem" }}>
            {links.map(({ label, path }) => (
              <Link
                key={path}
                to={path}
                onMouseEnter={() => setHoveredLink(path)}
                onMouseLeave={() => setHoveredLink(null)}
                style={linkStyle(path)}
              >
                {label}
                <span style={underlineStyle(hoveredLink === path, pathname === path)} />
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div
            className="navbar-right"
            style={{ display: "flex", alignItems: "center", gap: "1.2rem" }}
          >
            <ThemeSwitch checked={darkMode} onChange={() => setDarkMode(!darkMode)} />

            <span
              style={{
                fontSize: "1rem",
                fontWeight: 700,
                letterSpacing: "0.04em",
                color: "#FFFFFF",
                fontFamily: "'Inter', sans-serif",
              }}
            >
              AlgoSensei
            </span>

            <span style={{ fontSize: "20px", color: "#ffffff" }}>|</span>

            <Link
              to="/login"
              onMouseEnter={() => setLoginHovered(true)}
              onMouseLeave={() => setLoginHovered(false)}
              style={{
                textDecoration: "none",
                fontSize: "0.9rem",
                fontFamily: "'Inter', sans-serif",
                transition: "color 0.2s",
                color: loginHovered ? "#D9D9D9" : "#FFFFFF",
                position: "relative",
                paddingBottom: "3px",
              }}
            >
              Login
              <span style={underlineStyle(loginHovered, pathname === "/login")} />
            </Link>
          </div>
        </nav>
      </div>
    </>
  );
};

export default Navbar;