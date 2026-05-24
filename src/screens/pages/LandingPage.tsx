import Navbar from "../../components/landing-page/Navbar";
import Hero from "../../components/landing-page/Hero";
import OurProject from "../../components/landing-page/OurProject";
import AboutUs from "../../components/landing-page/AboutUs";
import ContactUs from "../../components/landing-page/ContactUs";

const LandingPage = () => {

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Sora:wght@500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --landing-bg: #242424;
          --landing-surface: #1e1e1e;
          --landing-panel: #232323;
          --landing-text: #ffffff;
          --landing-muted: #a7a7a7;
          --landing-soft: #d9d9d9;
          --landing-accent: #e24e40;
          --landing-accent-hover: #c94030;
          --landing-border: rgba(255,255,255,0.1);
          --font-display: 'Sora', 'Inter', sans-serif;
          --font-body: 'Inter', sans-serif;
        }
        html, body, #root { height: 100%; width: 100%; background-color: var(--landing-bg); font-family: var(--font-body); }
        html { scroll-behavior: smooth; }
        ::selection { background: rgba(226, 78, 64, 0.35); color: #fff; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .features-bg {
          position: relative; width: 100%; background-color: transparent; z-index: 1; overflow: hidden;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='25%25' stop-color='%23242424'/%3E%3Cstop offset='100%25' stop-color='%238A8A8A'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect x='6' y='6' width='108' height='108' rx='10' ry='10' fill='url(%23g)' fill-opacity='0.1' stroke='rgba(255,255,255,0.05)' stroke-width='1'/%3E%3C/svg%3E");
          background-size: 300px 300px; background-repeat: repeat;
        }
        .features-bg::before,
        .features-bg::after {
          content: "";
          position: absolute;
          top: 0;
          bottom: 0;
          width: min(28vw, 360px);
          pointer-events: none;
          z-index: 1;
          filter: blur(18px);
        }
        .features-bg::before {
          left: -32px;
          background: linear-gradient(90deg, #242424 0%, rgba(36, 36, 36, 0.88) 34%, rgba(36, 36, 36, 0) 100%);
        }
        .features-bg::after {
          right: -32px;
          background: linear-gradient(270deg, #242424 0%, rgba(36, 36, 36, 0.88) 34%, rgba(36, 36, 36, 0) 100%);
        }
        .features-edge {
          position: absolute;
          left: 0;
          right: 0;
          height: min(18vw, 220px);
          pointer-events: none;
          z-index: 1;
          filter: blur(18px);
        }
        .features-edge-top {
          top: -32px;
          background: linear-gradient(180deg, #242424 0%, rgba(36, 36, 36, 0.9) 36%, rgba(36, 36, 36, 0) 100%);
        }
        .features-edge-bottom {
          bottom: -32px;
          background: linear-gradient(0deg, #242424 0%, rgba(36, 36, 36, 0.9) 36%, rgba(36, 36, 36, 0) 100%);
        }
        .features-content { position: relative; z-index: 2; }
        .hero-wrapper { position: relative; overflow: visible; z-index: 2; }
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
