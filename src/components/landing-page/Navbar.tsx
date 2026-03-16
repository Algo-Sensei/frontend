import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

import {
  wrapperStyle,
  navInnerStyle,
  linksContainer,
  rightContainer,
  logoText,
  divider,
  loginLink,
  linkStyle,
  underlineStyle
} from "./NavbarStyles";

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

const scrollToSection = (id: string) => {
  const element = document.getElementById(id);

  if (!element) return;

  const navbarOffset = 90;
  const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
  const offsetPosition = elementPosition - navbarOffset;

  window.scrollTo({
    top: offsetPosition,
    behavior: "smooth"
  });

}

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
    { label: "Home",        section: "home" },
    { label: "Our Project", section: "project" },
    { label: "About Us",    section: "about" },
    { label: "Contact Us",  section: "contact" },
  ];

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

      <div className="navbar-wrapper" style={wrapperStyle}>
        <nav className="navbar-inner" style={navInnerStyle(scrolled)}>
          {/* Links */}
          <div className="navbar-links" style={linksContainer}>
            {links.map(({ label, section }) => (
              <button
                key={section}
                onClick={() => scrollToSection(section)}
                onMouseEnter={() => setHoveredLink(section)}
                onMouseLeave={() => setHoveredLink(null)}
                style={{
                  ...linkStyle(label, section, hoveredLink),
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                {label}
                <span style={underlineStyle(hoveredLink === section, pathname === section)} />
              </button>
            ))}
          </div>

          {/* Right side */}
          <div className="navbar-right" style={rightContainer}>
            <ThemeSwitch checked={darkMode} onChange={() => setDarkMode(!darkMode)} />

            <span style={logoText}>
              AlgoSensei
            </span>

            <span style={divider}>|</span>

            <Link
              to="/login"
              onMouseEnter={() => setLoginHovered(true)}
              onMouseLeave={() => setLoginHovered(false)}
              style={loginLink(loginHovered)}
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