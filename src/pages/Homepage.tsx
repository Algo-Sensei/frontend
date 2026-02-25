import React from 'react';
import logo from './logo.svg';
import './Homepage.css';

function Homepage() {
  return (
    <div className="app">
      <nav className="navbar">
        <div className="nav-left">
          <a>Home</a>
          <a>Our Project</a>
          <a>About Us</a>
          <a>Contact Us</a>
        </div>

        <div className="nav-right">
          <span>AlgoSensei </span>
          <a>| Login</a>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-left">
          <h1>
            Think.<br />
            Visualize.<br />
            Code.
          </h1>

          <p>
            Your AI guide to understanding DSA—one animation at a time
          </p>

          <button>Start chatting</button>
        </div>

        <div className="hero-right">
          <div className="card back"></div>
          <div className="card front"></div>
        </div>
      </section>
    </div>
  );
}

export default Homepage;

