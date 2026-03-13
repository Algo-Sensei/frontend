import React, { useState, useEffect, useRef } from "react";
import Navbar from "../components/navbar";
import AboutUs from "../components/landing-page/AboutUs";
import ContactUs from "../components/landing-page/ContactUs";

const FADE_MS = 600;

// Fires ONCE when element scrolls into view, then disconnects forever.
// Scrolling back up does nothing. Only a page refresh resets it.
const useInView = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect(); // one-shot, never fires again
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );
    const node = ref.current;
    if (node) observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return { ref, inView };
};

// Typewriter that starts typing once the element enters view.
// Because useInView is one-shot, scrolling up never clears or replays it.
const useTypewriter = (text: string, speed = 30, startDelay = 0) => {
  const { ref, inView } = useInView();
  const [displayed, setDisplayed] = useState("");
  const [visible, setVisible] = useState(false);
  const timers = useRef<{
    delay?: ReturnType<typeof setTimeout>;
    tick?: ReturnType<typeof setInterval>;
  }>({});

  useEffect(() => {
    if (!inView) return;
    // Fade in, then start typing
    setVisible(true);
    let i = 0;
    timers.current.delay = setTimeout(() => {
      timers.current.tick = setInterval(() => {
        i++;
        setDisplayed(text.slice(0, i));
        if (i >= text.length) clearInterval(timers.current.tick);
      }, speed);
    }, startDelay);

    return () => {
      clearTimeout(timers.current.delay);
      clearInterval(timers.current.tick);
    };
  }, [inView]); // eslint-disable-line react-hooks/exhaustive-deps

  return { ref, displayed, visible, inView };
};

const TypewriterHeading = ({
  text,
  style,
  speed = 30,
  startDelay = 0,
}: {
  text: string;
  style?: React.CSSProperties;
  speed?: number;
  startDelay?: number;
}) => {
  const { ref, displayed, visible, inView } = useTypewriter(text, speed, startDelay);
  const [cursorOn, setCursorOn] = useState(true);
  const done = displayed.length === text.length && text.length > 0;

  useEffect(() => {
    if (!inView || done) return;
    const id = setInterval(() => setCursorOn((v) => !v), 500);
    return () => clearInterval(id);
  }, [inView, done]);

  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0px)" : "translateY(20px)",
        transition: `opacity ${FADE_MS}ms cubic-bezier(0.25, 0.46, 0.45, 0.94),
                     transform ${FADE_MS}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`,
        willChange: "opacity, transform",
        ...style,
      }}
    >
      {displayed}
      {inView && !done && (
        <span
          style={{
            display: "inline-block",
            width: "2px",
            height: "0.82em",
            background: "#E24E40",
            marginLeft: "3px",
            verticalAlign: "middle",
            borderRadius: "1px",
            opacity: cursorOn ? 1 : 0,
            transition: "opacity 0.12s",
          }}
        />
      )}
    </div>
  );
};

const TypewriterParagraph = ({
  text,
  style,
  speed = 13,
  startDelay = 0,
}: {
  text: string;
  style?: React.CSSProperties;
  speed?: number;
  startDelay?: number;
}) => {
  const { ref, displayed, visible, inView } = useTypewriter(text, speed, startDelay);

  return (
    <p
      ref={ref as React.RefObject<HTMLParagraphElement>}
      style={{
        minHeight: "4em",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0px)" : "translateY(12px)",
        transition: `opacity ${FADE_MS}ms cubic-bezier(0.25, 0.46, 0.45, 0.94) 60ms,
                     transform ${FADE_MS}ms cubic-bezier(0.25, 0.46, 0.45, 0.94) 60ms`,
        willChange: "opacity, transform",
        ...style,
      }}
    >
      {displayed}
      {inView && displayed.length < text.length && (
        <span style={{ opacity: 0.3, marginLeft: "1px" }}>|</span>
      )}
    </p>
  );
};

// Simple one-shot fade-in for cards
const FadeReveal = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => {
  const { ref, inView } = useInView();
  return (
    <div
      ref={ref}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0px)" : "translateY(24px)",
        transition: `opacity ${FADE_MS}ms cubic-bezier(0.25, 0.46, 0.45, 0.94) ${delay}ms,
                     transform ${FADE_MS}ms cubic-bezier(0.25, 0.46, 0.45, 0.94) ${delay}ms`,
        willChange: "opacity, transform",
      }}
    >
      {children}
    </div>
  );
};

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

        {/* Hero */}
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

        {/* Features */}
        <div className="features-bg">
          <div className="features-content" style={{ display: "flex", justifyContent: "center", width: "100%", padding: "8rem 2rem 10rem" }}>
            <div style={{ width: "100%", maxWidth: "1200px", display: "flex", flexDirection: "column", gap: "16rem" }}>
              {features.map((f, i) => (
                <div
                  key={i}
                  className="feature-row"
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "15rem", flexDirection: f.align === "right" ? "row-reverse" : "row", position: "relative", zIndex: 2 }}
                >
                  <div style={{ maxWidth: "420px", textAlign: f.align === "right" ? "right" : "left" }}>
                    <TypewriterHeading
                      text={f.title}
                      speed={30}
                      startDelay={0}
                      style={{ fontFamily: "'Inter', sans-serif", fontSize: "clamp(1.6rem, 3vw, 2.2rem)", fontWeight: 800, color: "#ffffff", lineHeight: 1.2, marginBottom: "1.2rem", display: "block" }}
                    />
                    <TypewriterParagraph
                      text={f.desc}
                      speed={13}
                      startDelay={f.title.length * 30 + 60}
                      style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.95rem", color: "#a0a0a0", lineHeight: 1.7 }}
                    />
                  </div>

                  <FadeReveal delay={100}>
                    <div
                      className="feature-card"
                      style={{ width: "420px", height: "260px", borderRadius: "15px", background: "#1e1e1e", border: "1px solid rgba(255,255,255,0.1)", flexShrink: 0, position: "relative", zIndex: 3, boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }}
                    />
                  </FadeReveal>
                </div>
              ))}
            </div>
          </div>
        </div>

        <AboutUs />
        {/* Contact us tanginna*/}
        <ContactUs />
      </div>
    </>
  );
};

export default LandingPage;