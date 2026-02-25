import { Link, useLocation } from "react-router-dom";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@400;600;800&display=swap');

  .navbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.4rem 3rem;
    border-bottom: 1px solid rgba(255,255,255,0.07);
    position: sticky;
    top: 0;
    z-index: 100;
    background: rgba(10, 10, 15, 0.85);
    backdrop-filter: blur(12px);
  }

  .nav-left {
    display: flex;
    gap: 2rem;
  }

  .nav-left a,
  .nav-right a {
    text-decoration: none;
    color: #a0a0b0;
    font-size: 0.9rem;
    font-family: 'Space Mono', monospace;
    letter-spacing: 0.02em;
    transition: color 0.2s;
    cursor: pointer;
  }

  .nav-left a:hover,
  .nav-right a:hover {
    color: #f0ede8;
  }

  .nav-left a.active {
    color: #7bffc4;
  }

  .nav-right {
    display: flex;
    align-items: center;
    gap: 1.2rem;
  }

  .logo {
    font-size: 1rem;
    font-weight: 800;
    letter-spacing: 0.04em;
    color: #f0ede8;
    font-family: 'Syne', sans-serif;
  }

  .login {
    border: 1px solid rgba(123, 255, 196, 0.4);
    padding: 0.4rem 1rem;
    color: #7bffc4 !important;
    border-radius: 2px;
    transition: background 0.2s !important;
  }

  .login:hover {
    background: rgba(123, 255, 196, 0.1);
  }

  @media (max-width: 768px) {
    .navbar {
      padding: 1rem 1.5rem;
      flex-wrap: wrap;
      gap: 0.75rem;
    }
    .nav-left {
      gap: 1rem;
    }
  }
`;

function Navbar() {
  const { pathname } = useLocation();

  return (
    <>
      <style>{styles}</style>
      <nav className="navbar">
        <div className="nav-left">
          <Link to="/"         className={pathname === "/"         ? "active" : ""}>Home</Link>
          <Link to="/project"  className={pathname === "/project"  ? "active" : ""}>Our Project</Link>
          <Link to="/about"    className={pathname === "/about"    ? "active" : ""}>About Us</Link>
          <Link to="/contact"  className={pathname === "/contact"  ? "active" : ""}>Contact Us</Link>
        </div>
        <div className="nav-right">
          <span className="logo">AlgoSensei</span>
          <Link to="/login" className="login">Login</Link>
        </div>
      </nav>
    </>
  );
}

export default Navbar;