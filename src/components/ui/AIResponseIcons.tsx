import React from "react";

const cardStyle: React.CSSProperties = {
  flex: 1,
  minWidth: 0,
  background: "#0e0e12",
  borderRadius: 18,
  border: "1px solid rgba(255, 255, 255, 0.08)",
  padding: "24px 18px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: 14,
};

const labelStyle: React.CSSProperties = {
  fontSize: 13,
  color: "#8b8b95",
  letterSpacing: "0.02em",
};

const iconBoxStyle: React.CSSProperties = {
  width: 72,
  height: 72,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#ffffff",
};

export default function AIResponseIcons() {
  return (
    <>
      <style>{`
        @keyframes aiResponseSearchPulse {
          0%, 100% {
            transform: scale(0.88);
            opacity: 0.25;
          }
          50% {
            transform: scale(1.08);
            opacity: 1;
          }
        }

        @keyframes aiResponseFileShake {
          0%, 50%, 100% { transform: rotate(0deg); }
          10% { transform: rotate(-12deg); }
          20% { transform: rotate(12deg); }
          30% { transform: rotate(-8deg); }
          40% { transform: rotate(8deg); }
        }

        @keyframes aiResponseTextShine {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        .ai-response-icons-search {
          animation: aiResponseSearchPulse 1.4s ease-in-out infinite;
          transform-origin: center;
        }

        .ai-response-icons-file {
          animation: aiResponseFileShake 2.2s ease-in-out infinite;
          transform-origin: center;
        }

        .ai-response-icons-text {
          font-size: 30px;
          font-weight: 800;
          line-height: 1;
          background-image: linear-gradient(105deg, #555 30%, #fff 48%, #aaa 52%, #555 70%);
          background-size: 250% 100%;
          background-position: 200% 0;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: aiResponseTextShine 2.2s ease-in-out infinite;
        }
      `}</style>

      <div
        style={{
          display: "flex",
          gap: 16,
          width: "100%",
          alignItems: "stretch",
        }}
      >
        <div style={cardStyle}>
          <div className="ai-response-icons-search" style={iconBoxStyle}>
            <svg xmlns="http://www.w3.org/2000/svg" width="42" height="42" viewBox="0 0 24 24" fill="none">
              <path d="M0 0h24v24H0z" fill="none" />
              <path
                fill="currentColor"
                d="m19.6 21l-6.3-6.3q-.75.6-1.725.95T9.5 16q-2.725 0-4.612-1.888T3 9.5t1.888-4.612T9.5 3t4.613 1.888T16 9.5q0 1.1-.35 2.075T14.7 13.3l6.3 6.3zM9.5 14q1.875 0 3.188-1.312T14 9.5t-1.312-3.187T9.5 5T6.313 6.313T5 9.5t1.313 3.188T9.5 14"
              />
            </svg>
          </div>
          <div style={labelStyle}>searching…</div>
        </div>

        <div style={cardStyle}>
          <div className="ai-response-icons-file" style={iconBoxStyle}>
            <svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 256 256" fill="none">
              <path d="M0 0h256v256H0z" fill="none" />
              <path
                fill="currentColor"
                d="m212.24 67.76l-40-40A6 6 0 0 0 168 26H88a14 14 0 0 0-14 14v18H56a14 14 0 0 0-14 14v144a14 14 0 0 0 14 14h112a14 14 0 0 0 14-14v-18h18a14 14 0 0 0 14-14V72a6 6 0 0 0-1.76-4.24M170 216a2 2 0 0 1-2 2H56a2 2 0 0 1-2-2V72a2 2 0 0 1 2-2h77.51L170 106.49Zm32-32a2 2 0 0 1-2 2h-18v-82a6 6 0 0 0-1.76-4.24l-40-40A6 6 0 0 0 136 58H86V40a2 2 0 0 1 2-2h77.51L202 74.49Zm-60-32a6 6 0 0 1-6 6H88a6 6 0 0 1 0-12h48a6 6 0 0 1 6 6m0 32a6 6 0 0 1-6 6H88a6 6 0 0 1 0-12h48a6 6 0 0 1 6 6"
              />
            </svg>
          </div>
          <div style={labelStyle}>error</div>
        </div>

        <div style={cardStyle}>
          <div style={iconBoxStyle}>
            <div className="ai-response-icons-text">AI</div>
          </div>
          <div style={labelStyle}>thinking…</div>
        </div>
      </div>
    </>
  );
}
