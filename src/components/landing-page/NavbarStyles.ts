import React from "react";

export const wrapperStyle: React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  zIndex: 100,
  display: "flex",
  justifyContent: "center",
  padding: "15px 2rem 0",
  boxSizing: "border-box",
};

export const navInnerStyle = (scrolled: boolean): React.CSSProperties => ({
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
});

export const linksContainer: React.CSSProperties = {
  display: "flex",
  gap: "3rem",
};

export const rightContainer: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "1.2rem",
};

export const logoText: React.CSSProperties = {
  fontSize: "1rem",
  fontWeight: "bold",
  letterSpacing: "0.04em",
  color: "white",
  fontFamily: "'Inter', sans-serif",
};

export const divider: React.CSSProperties = {
  fontSize: "20px",
  color: "white",
};

export const loginLink = (hovered: boolean): React.CSSProperties => ({
  textDecoration: "none",
  fontSize: "0.9rem",
  fontFamily: "'Inter', sans-serif",
  transition: "color 0.2s",
  color: hovered ? "#D9D9D9" : "white",
  position: "relative",
  paddingBottom: "2px",
});

export const linkStyle = (
  pathName: string,
  path: string,
  hoveredLink: string | null
): React.CSSProperties => ({
  textDecoration: "none",
  fontSize: "1rem",
  fontFamily: "'Inter', sans-serif",
  letterSpacing: "0.02em",
  transition: "color 0.2s",
  color:
    pathName === path
      ? "#E24E40"
      : hoveredLink === path
      ? "#D9D9D9"
      : "white",
  position: "relative",
  paddingBottom: "3px",
});

export const underlineStyle = (
  isHovered: boolean,
  isActive: boolean
): React.CSSProperties => ({
  position: "absolute",
  bottom: 0,
  left: "0%",
  width: isHovered || isActive ? "100%" : "0%",
  height: "2px",
  background: isActive ? "#E24e40" : "#D9D9D9",
  transition: "width 0.25s ease",
  borderRadius: "2px",
});