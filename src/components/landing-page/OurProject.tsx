import React, { useState, useEffect, useRef } from "react";

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

const OurProject = () => {
  return (
    <>
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
    </>
  );
};

export default OurProject;