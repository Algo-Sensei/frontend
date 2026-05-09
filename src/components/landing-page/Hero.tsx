import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const navigate = useNavigate();
  const [btnHovered, setBtnHovered] = useState(false);
  const [cardHovered, setCardHovered] = useState(false);
  const [isLaunching, setIsLaunching] = useState(false);

  const handleStartChatting = () => {
    if (isLaunching) return;
    setIsLaunching(true);
    window.setTimeout(() => {
      navigate("/chat", { state: { fromHero: true } });
    }, 560);
  };

	return (
		<>
			<div
          className="hero-wrapper"
          style={{ position: "relative", display: "flex", justifyContent: "center", width: "100%", backgroundColor: "#242424", minHeight: "calc(100vh - 65px)", padding: "0 2rem", overflow: "hidden" }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              transformOrigin: "50% 50%",
              transition: "transform 0.56s cubic-bezier(0.16, 0.84, 0.18, 1), opacity 0.5s ease, filter 0.5s ease",
              transform: isLaunching ? "scale(1.82)" : "scale(1)",
              opacity: isLaunching ? 0.04 : 1,
              filter: isLaunching ? "blur(16px)" : "blur(0)",
            }}
          >
          <div
            style={{
              position: "absolute",
              top: "12%",
              left: "8%",
              width: "26rem",
              height: "26rem",
              borderRadius: "999px",
              background: "radial-gradient(circle, rgba(226, 78, 64, 0.26) 0%, rgba(226, 78, 64, 0.08) 42%, rgba(226, 78, 64, 0) 72%)",
              filter: "blur(18px)",
              animation: "heroGlowDrift 8s ease-in-out infinite",
              pointerEvents: "none",
              zIndex: 0,
            }}
          />
          <div
            style={{
              position: "absolute",
              right: "10%",
              bottom: "8%",
              width: "32rem",
              height: "32rem",
              borderRadius: "999px",
              background: "radial-gradient(circle, rgba(255, 255, 255, 0.08) 0%, rgba(226, 78, 64, 0.05) 32%, rgba(255, 255, 255, 0) 68%)",
              filter: "blur(22px)",
              animation: "heroGlowPulse 10s ease-in-out infinite",
              pointerEvents: "none",
              zIndex: 0,
            }}
          />

          <svg
            viewBox="0 0 1651 1170" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice"
            style={{ position: "absolute", top: 120, left: "50%", transform: "translateX(-50%)", width: "min(calc(100% - 4rem), 1600px)", height: "800px", borderRadius: "20px", zIndex: 0 }}
          >
            <path d="M1650.99 935.278C1651.01 956.817 1633.55 974.288 1612.02 974.3L577.307 974.903C548.18 974.92 520.507 987.637 501.523 1009.73L409.291 1117.06C380.795 1150.22 339.25 1169.29 295.528 1169.29L39.0175 1169.29C17.4786 1169.29 0.0175649 1151.83 0.0172137 1130.29L-1.68418e-08 39.9175C-0.000346344 18.387 17.4468 0.929392 38.9773 0.916839L1611.45 6.41658e-06C1632.99 -0.012552 1650.46 17.4383 1650.48 38.9775L1650.99 935.278Z" fill="#1D1B1B" />
          </svg>
          </div>

          <style>{`
            @keyframes heroGlowDrift {
              0%, 100% { transform: translate3d(0, 0, 0) scale(1); opacity: 0.82; }
              50% { transform: translate3d(32px, -18px, 0) scale(1.08); opacity: 1; }
            }

            @keyframes heroGlowPulse {
              0%, 100% { transform: scale(1); opacity: 0.5; }
              50% { transform: scale(1.1); opacity: 0.82; }
            }

          `}</style>

          <section
            className="hero"
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "clamp(4rem, 8vw, 6rem) 0 4rem",
              width: "100%",
              maxWidth: "1200px",
              gap: "clamp(2rem, 4vw, 3.5rem)",
              zIndex: 1,
              transformOrigin: "50% 50%",
              transition: "transform 0.56s cubic-bezier(0.16, 0.84, 0.18, 1), opacity 0.5s ease, filter 0.5s ease",
              transform: isLaunching
                ? "translate3d(0, 0, 0) scale(1.82)"
                : "translate3d(0, 0, 0) scale(1)",
              opacity: isLaunching ? 0.04 : 1,
              filter: isLaunching ? "blur(16px)" : "blur(0)",
            }}
          >
            <div style={{ maxWidth: "520px", animation: "fadeUp 0.8s ease both" }}>
              <h1 style={{ fontFamily: "'Inter', sans-serif", fontSize: "clamp(3.25rem, 6vw, 5.5rem)", fontWeight: 800, lineHeight: 0.98, letterSpacing: "-0.04em", color: "#ffffff", marginBottom: "1.25rem" }}>
                Think.<br />Visualize.<br />Code.
              </h1>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "clamp(1rem, 1.6vw, 1.1rem)", color: "rgba(255, 255, 255, 0.88)", lineHeight: 1.65, marginBottom: "2rem", maxWidth: "460px" }}>
                Your AI guide to understanding DSA one animation at a time.
              </p>
              <button
                onClick={handleStartChatting}
                onMouseEnter={() => setBtnHovered(true)}
                onMouseLeave={() => setBtnHovered(false)}
                disabled={isLaunching}
                style={{
                  background: isLaunching ? "#f06b5d" : btnHovered ? "#c94030" : "#E24E40",
                  color: "#ffffff",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  padding: "0.95rem 1.5rem",
                  minHeight: "52px",
                  minWidth: "190px",
                  fontSize: "0.95rem",
                  fontWeight: 600,
                  letterSpacing: "-0.01em",
                  fontFamily: "'Inter', sans-serif",
                  cursor: isLaunching ? "progress" : "pointer",
                  borderRadius: "12px",
                  boxShadow: isLaunching
                    ? "0 0 0 10px rgba(226, 78, 64, 0.14), 0 0 34px rgba(226, 78, 64, 0.28), 0 16px 28px rgba(0, 0, 0, 0.24)"
                    : btnHovered
                      ? "0 14px 30px rgba(201, 64, 48, 0.28)"
                      : "0 10px 24px rgba(226, 78, 64, 0.2)",
                  transition: "background 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease",
                  transform: isLaunching
                    ? "translate3d(0, 0, 0) scale(1.06)"
                    : btnHovered
                      ? "translateY(-1px)"
                      : "translateY(0)",
                }}
              >
                {isLaunching ? "Opening chat..." : "Start chatting"}
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
