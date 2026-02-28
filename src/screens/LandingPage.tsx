import React, { useState } from "react";
import Navbar from "../components/navbar";

const LandingPage = () => {
  const [btnHovered, setBtnHovered] = useState(false);
  const [cardHovered, setCardHovered] = useState(false);

  const features = [
    {
      title: "Confused how data structures work?",
      desc: "With visualization and AI powered explanations tailored to your understanding level, you can understand how they work!",
      align: "left",
    },
    {
      title: "Not sure what algorithm to use?",
      desc: "Building an app and not sure what algorithm to use? Just ask AlgoSensei and it will give you suggestions right away!",
      align: "right",
    },
    {
      title: "Want to see how data are updated for each line of code?",
      desc: "Understand the happenings of your code through visualization! Understand how x's value become y's, and how numbers within increase or decrease!",
      align: "left",
    },
  ];

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
          position: relative;
          width: 100%;
          --color: rgba(114, 114, 114, 0.3);
          background-color: #191a1a;
          background-image:
            linear-gradient(0deg, transparent 24%, var(--color) 25%, var(--color) 26%, transparent 27%, transparent 74%, var(--color) 75%, var(--color) 76%, transparent 77%, transparent),
            linear-gradient(90deg, transparent 24%, var(--color) 25%, var(--color) 26%, transparent 27%, transparent 74%, var(--color) 75%, var(--color) 76%, transparent 77%, transparent);
          background-size: 55px 55px;
        }

        .features-bg::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to bottom,
            #242424 0%,
            transparent 8%,
            transparent 92%,
            #242424 100%
          );
          pointer-events: none;
          z-index: 1;
        }

        .features-bg::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to right,
            #242424 0%,
            transparent 8%,
            transparent 92%,
            #242424 100%
          );
          pointer-events: none;
          z-index: 1;
        }

        .features-content {
          position: relative;
          z-index: 2;
        }

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

        {/* Hero Wrapper */}
        <div
          className="hero-wrapper"
          style={{
            display: "flex",
            justifyContent: "center",
            width: "100%",
            backgroundColor: "#242424",
            minHeight: "calc(100vh - 65px)",
            padding: "0 2rem",
          }}
        >
          <section
            className="hero"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "6rem 0 4rem",
              width: "100%",
              maxWidth: "1200px",
              gap: "2rem",
            }}
          >
            {/* Left */}
            <div style={{ maxWidth: "520px", animation: "fadeUp 0.8s ease both" }}>
              <h1 style={{ fontFamily: "'Inter', sans-serif", fontSize: "clamp(3rem, 6vw, 5.5rem)", fontWeight: 800, lineHeight: 1.05, letterSpacing: "-0.03em", color: "#ffffff", marginBottom: "1.5rem" }}>
                Think.<br />Visualize.<br />Code.
              </h1>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.95rem", color: "#ffffff", lineHeight: 1.7, marginBottom: "2.5rem" }}>
                Your AI guide to understanding DSA one animation at a time.
              </p>
              <button
                onMouseEnter={() => setBtnHovered(true)}
                onMouseLeave={() => setBtnHovered(false)}
                style={{
                  background: btnHovered ? "#c94030" : "#E24E40",
                  color: "#ffffff",
                  border: "none",
                  padding: "0.9rem 2.2rem",
                  fontSize: "14px",
                  fontWeight: 600,
                  fontFamily: "'Inter', sans-serif",
                  cursor: "pointer",
                  borderRadius: "5px",
                  transition: "transform 0.2s, box-shadow 0.2s, background 0.2s",
                  transform: btnHovered ? "translateY(-2px)" : "translateY(0)",
                  boxShadow: btnHovered ? "0 8px 30px rgba(226, 78, 64, 0.35)" : "none",
                }}
              >
                Start chatting
              </button>
            </div>

            {/* Right / Cards */}
            <div
              className="hero-right"
              onMouseEnter={() => setCardHovered(true)}
              onMouseLeave={() => setCardHovered(false)}
              style={{ position: "relative", width: "450px", height: "520px", flexShrink: 0, display: "flex", justifyContent: "center", alignItems: "center", animation: "fadeUp 0.8s 0.2s ease both" }}
            >
              <div style={{ position: "absolute", width: "100%", height: "100%", borderRadius: "20px", background: "#E24E40", opacity: 0.6, transition: "transform 0.4s ease", transform: cardHovered ? "rotate(8deg) translate(30px, 20px)" : "rotate(5deg) translate(20px, 20px)" }} />
              <div style={{ position: "absolute", width: "100%", height: "100%", borderRadius: "20px", background: "#E24E40", transition: "transform 0.4s ease", transform: "rotate(0deg)" }} />
            </div>
          </section>
        </div>

        {/* Features Section — grid background with fade overlay */}
        <div className="features-bg">
          <div className="features-content" style={{ display: "flex", justifyContent: "center", width: "100%", padding: "4rem 2rem 6rem" }}>
            <div style={{ width: "100%", maxWidth: "1200px", display: "flex", flexDirection: "column", gap: "6rem" }}>
              {features.map((f, i) => (
                <div
                  key={i}
                  className="feature-row"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "4rem",
                    flexDirection: f.align === "right" ? "row-reverse" : "row",
                  }}
                >
                  {/* Text */}
                  <div style={{ maxWidth: "420px", textAlign: f.align === "right" ? "right" : "left" }}>
                    <h2 style={{ fontFamily: "'Inter', sans-serif", fontSize: "clamp(1.6rem, 3vw, 2.2rem)", fontWeight: 800, color: "#ffffff", lineHeight: 1.2, marginBottom: "1.2rem" }}>
                      {f.title}
                    </h2>
                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.95rem", color: "#a0a0a0", lineHeight: 1.7 }}>
                      {f.desc}
                    </p>
                  </div>

                  {/* Card placeholder */}
                  <div
                    className="feature-card"
                    style={{
                      width: "420px",
                      height: "260px",
                      borderRadius: "15px",
                      background: "#1e1e1e",
                      border: "1px solid rgba(255,255,255,0.1)",
                      flexShrink: 0,
                      position: "relative",
                      zIndex: 3,
                      boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
                    }}
                  />
                </div>
              ))}

            </div>
          </div>
        </div>

      </div>
    </>
  );
};

export default LandingPage;