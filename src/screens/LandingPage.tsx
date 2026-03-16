import React, { useState, useEffect, useRef } from "react";
import Navbar from "../components/landing-page/Navbar";
import Hero from "../components/landing-page/Hero";
import OurProject from "../components/landing-page/OurProject";
import AboutUs from "../components/landing-page/AboutUs";
import ContactUs from "../components/landing-page/ContactUs";

const LandingPage = () => {

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body, #root { height: 100%; width: 100%; background-color: #242424; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .features-bg {
          position: relative; width: 100%; background-color: transparent;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='25%25' stop-color='%23242424'/%3E%3Cstop offset='100%25' stop-color='%238A8A8A'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect x='6' y='6' width='108' height='108' rx='10' ry='10' fill='url(%23g)' fill-opacity='0.1' stroke='rgba(255,255,255,0.05)' stroke-width='1'/%3E%3C/svg%3E");
          background-size: 300px 300px; background-repeat: repeat;
        }
        .features-bg::before {
          content: ''; position: absolute; inset: 0; pointer-events: none; z-index: 1;
          background: linear-gradient(to bottom, #242424 2%, transparent 30%, transparent 90%, #242424 100%);
        }
        .features-bg::after {
          content: ''; position: absolute; inset: 0; pointer-events: none; z-index: 1;
          background: linear-gradient(to right, #242424 2%, transparent 30%, transparent 92%, #242424 100%);
        }
        .features-content { position: relative; z-index: 2; }
        .hero-wrapper { position: relative; overflow: hidden; }
        .hero-wrapper > * { position: relative; z-index: 1; }
        .hero-wrapper svg { z-index: 0 !important; position: absolute !important; }

        @media (max-width: 768px) {
          .hero { flex-direction: column !important; padding: 5rem 0 3rem !important; text-align: center; }
          .hero-right { width: 280px !important; height: 320px !important; }
          .hero-wrapper { padding: 0 1rem !important; }
          .feature-row { flex-direction: column !important; }
          .feature-card { width: 100% !important; height: 220px !important; }
        }
      `}</style>

      <div style={{ minHeight: "100vh", width: "100%", backgroundColor: "#242424", overflow: "hidden" }}>
        <Navbar />

        <div id="home">
          <Hero />
        </div>

        <div id="project">
          <OurProject />
        </div>

        <div id="about">
          <AboutUs />
        </div>

        <div id="contact">
          <ContactUs />
        </div>
      </div>
    </>
  );
};

export default LandingPage;