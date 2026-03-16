import React, { useState, } from "react";

const Hero = () => {
  const [btnHovered, setBtnHovered] = useState(false);
  const [cardHovered, setCardHovered] = useState(false);

	return (
		<>
			<div
          className="hero-wrapper"
          style={{ display: "flex", justifyContent: "center", width: "100%", backgroundColor: "#242424", minHeight: "calc(100vh - 65px)", padding: "0 2rem" }}
        >
          <svg
            viewBox="0 0 1651 1170" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice"
            style={{ position: "absolute", top: 120, left: "50%", transform: "translateX(-50%)", width: "min(calc(100% - 4rem), 1600px)", height: "800px", borderRadius: "20px", zIndex: 0 }}
          >
            <path d="M1650.99 935.278C1651.01 956.817 1633.55 974.288 1612.02 974.3L577.307 974.903C548.18 974.92 520.507 987.637 501.523 1009.73L409.291 1117.06C380.795 1150.22 339.25 1169.29 295.528 1169.29L39.0175 1169.29C17.4786 1169.29 0.0175649 1151.83 0.0172137 1130.29L-1.68418e-08 39.9175C-0.000346344 18.387 17.4468 0.929392 38.9773 0.916839L1611.45 6.41658e-06C1632.99 -0.012552 1650.46 17.4383 1650.48 38.9775L1650.99 935.278Z" fill="#1D1B1B" />
          </svg>

          <section
            className="hero"
            style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6rem 0 4rem", width: "100%", maxWidth: "1200px", gap: "2rem" }}
          >
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
                style={{ background: btnHovered ? "#c94030" : "#E24E40", color: "#ffffff", border: "none", padding: "0.9rem 2.2rem", fontSize: "14px", fontFamily: "'Inter', sans-serif", cursor: "pointer", borderRadius: "5px", transition: "background 0.2s ease" }}
              >
                Start chatting
              </button>
            </div>

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

		</>
	);
}

export default Hero;