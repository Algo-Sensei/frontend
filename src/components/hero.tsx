const styles = `
  .hero {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 6rem 3rem 4rem;
    min-height: calc(100vh - 65px);
    background-color: #0a0a0f;
    gap: 2rem;
  }

  /* ── Left ── */
  .hero-left {
    max-width: 520px;
    animation: fadeUp 0.8s ease both;
  }

  .hero-left h1 {
    font-family: 'Syne', sans-serif;
    font-size: clamp(3rem, 6vw, 5.5rem);
    font-weight: 800;
    line-height: 1.05;
    letter-spacing: -0.03em;
    color: #f0ede8;
    margin-bottom: 1.5rem;
  }

  .hero-left p {
    font-family: 'Space Mono', monospace;
    font-size: 0.95rem;
    color: #7a7a90;
    line-height: 1.7;
    margin-bottom: 2.5rem;
  }

  .hero-left button {
    background: #7bffc4;
    color: #0a0a0f;
    border: none;
    padding: 0.9rem 2.2rem;
    font-size: 0.95rem;
    font-weight: 700;
    font-family: 'Syne', sans-serif;
    letter-spacing: 0.04em;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
    clip-path: polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px));
  }

  .hero-left button:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 30px rgba(123, 255, 196, 0.25);
  }

  /* ── Right / Cards ── */
  .hero-right {
    position: relative;
    width: 360px;
    height: 420px;
    flex-shrink: 0;
    animation: fadeUp 0.8s 0.2s ease both;
  }

  .card {
    position: absolute;
    width: 300px;
    height: 360px;
    border-radius: 4px;
    transition: transform 0.4s ease;
  }

  .card.back {
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
    border: 1px solid rgba(123, 255, 196, 0.15);
    top: 30px;
    left: 30px;
    transform: rotate(5deg);
  }

  .card.front {
    background: linear-gradient(135deg, #1e1e30 0%, #252540 100%);
    border: 1px solid rgba(123, 255, 196, 0.3);
    top: 0;
    left: 0;
  }

  .card.front::before {
    content: '';
    position: absolute;
    top: 20px;
    left: 20px;
    right: 20px;
    height: 2px;
    background: linear-gradient(90deg, #7bffc4, transparent);
    border-radius: 2px;
  }

  .card.front::after {
    content: '{ }';
    position: absolute;
    bottom: 30px;
    right: 30px;
    font-family: 'Space Mono', monospace;
    font-size: 2.5rem;
    color: rgba(123, 255, 196, 0.15);
    font-weight: 700;
  }

  .hero-right:hover .card.back {
    transform: rotate(8deg) translateX(10px);
  }

  /* ── Animation ── */
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* ── Responsive ── */
  @media (max-width: 768px) {
    .hero {
      flex-direction: column;
      padding: 3rem 1.5rem;
      text-align: center;
    }
    .hero-right {
      width: 280px;
      height: 320px;
    }
    .card {
      width: 240px;
      height: 280px;
    }
  }
`;

function Hero() {
  return (
    <>
      <style>{styles}</style>
      <section className="hero">
        <div className="hero-left">
          <h1>
            Think.<br />
            Visualize.<br />
            Code.
          </h1>
          <p>Your AI guide to understanding DSA—one animation at a time</p>
          <button>Start chatting</button>
        </div>

        <div className="hero-right">
          <div className="card back"></div>
          <div className="card front"></div>
        </div>
      </section>
    </>
  );
}

export default Hero;