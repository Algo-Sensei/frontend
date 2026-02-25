import "./Hero.css";

function Hero() {
  return (
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
  );
}

export default Hero;