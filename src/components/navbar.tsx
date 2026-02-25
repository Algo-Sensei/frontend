import "./Navbar.css";

function Navbar() {
  return (
    <nav className="navbar">
      <div className="nav-left">
        <a className="active">Home</a>
        <a>Our Project</a>
        <a>About Us</a>
        <a>Contact Us</a>
      </div>
    
      <div className="nav-right">
        <span className="logo">AlgoSensei</span>
        <a className="login">Login</a>
      </div>
    </nav>
  );
}

export default Navbar;