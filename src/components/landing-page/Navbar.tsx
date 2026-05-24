import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { fetchLoginSession } from "../../api";

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
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [loginHovered, setLoginHovered] = useState(false);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
  const [loginChecking, setLoginChecking] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLoginClick = async () => {
    if (loginChecking) return;

    setLoginChecking(true);
    try {
      const isLoggedIn = await fetchLoginSession();
      navigate(isLoggedIn ? "/chat" : "/login");
    } catch {
      navigate("/login");
    } finally {
      setLoginChecking(false);
    }
  };

  const links = [
    { label: "Home",        section: "home" },
    { label: "Our Project", section: "project" },
    { label: "About Us",    section: "about" },
    { label: "Contact Us",  section: "contact" },
  ];

  return (
    <>
      <style>{`
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
            <span style={logoText}>
              AlgoSensei
            </span>

            <span style={divider}>|</span>

            <button
              type="button"
              onClick={handleLoginClick}
              onMouseEnter={() => setLoginHovered(true)}
              onMouseLeave={() => setLoginHovered(false)}
              style={loginLink(loginHovered)}
            >
              {loginChecking ? "Loading..." : "Login"}
              <span style={underlineStyle(loginHovered, pathname === "/login")} />
            </button>
          </div>
        </nav>
      </div>
    </>
  );
};

export default Navbar;
