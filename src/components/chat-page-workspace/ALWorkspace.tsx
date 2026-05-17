import { useState } from "react";
import "./ALWorkspace.css";
import Visualizer from "./Visualizer";
import type { ExecutionFrame } from "./traceProgram";

const ALWorkspace = ({ code, showVisualizer, onVisualize, onClose }: any) => {
  const [activeLine, setActiveLine] = useState<number | null>(null);
  const [currentFrame, setCurrentFrame] = useState<ExecutionFrame | undefined>(undefined);

  const codeLines = code.code.split("\n");
  const fileName = code.filename || "BruteForceSearch.java";
  const outputText = currentFrame?.output?.length
    ? currentFrame.output[currentFrame.output.length - 1]
    : code.output || "";

  return (
    <div
      className="workspace-panel"
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "#1e1e1e",
        color: "#fff",
        overflow: "hidden",
      }}
    >
      <div
        className="workspace-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "16px",
          padding: "20px 24px",
          flexShrink: 0,
          borderBottom: "1px solid #2f2f2f",
          background: "#252525",
          zIndex: 10,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <h2 style={{ margin: 0, fontSize: "24px", fontWeight: "bold" }}>AlgoSensei&apos;s Workspace</h2>
          <span style={{ fontSize: "14px", opacity: 0.75 }}>
            Brute-force linear search in Java
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
          <button
            onClick={onVisualize}
            style={{
              background: "linear-gradient(135deg, rgba(229, 77, 66, 0.85) 0%, rgba(112, 36, 30, 0.95) 100%)",
              color: "#fff",
              border: "1px solid rgba(229, 77, 66, 0.5)",
              padding: "10px 16px",
              borderRadius: "10px",
              cursor: "pointer",
              fontWeight: "bold",
              boxShadow: "0 10px 26px rgba(229, 77, 66, 0.18)",
            }}
            >
            Visualize
          </button>
          <button
            onClick={onClose}
            aria-label="Close workspace"
            style={{
              background: "#2a2a2a",
              border: "1px solid #3a3a3a",
              color: "#fff",
              width: "38px",
              height: "38px",
              borderRadius: "8px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      <div
        className="workspace-content"
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          padding: "24px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "24px",
        }}
      >
        {showVisualizer && (
          <section
            className="workspace-section"
            style={{
              display: "flex",
              flexDirection: "column",
              width: "100%",
              maxWidth: "700px",
              border: "1px solid #323232",
              borderRadius: "14px",
              overflow: "hidden",
              background: "#232323",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                padding: "14px 16px",
                borderBottom: "1px solid #343434",
                fontWeight: "bold",
                fontSize: "14px",
              }}
            >
              Visualize
            </div>

            <div style={{ padding: "14px" }}>
              <Visualizer
                code={code.code}
                onActiveLineChange={setActiveLine}
                onFrameChange={setCurrentFrame}
              />
            </div>
          </section>
        )}

        <section
          className="workspace-section"
          style={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            maxWidth: "700px",
            border: "1px solid #323232",
            borderRadius: "14px",
            overflow: "hidden",
            background: "#232323",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              padding: "14px 16px",
              borderBottom: "1px solid #343434",
              fontWeight: "bold",
              fontSize: "14px",
            }}
          >
            Code Trace
          </div>

          <div
            style={{
              background: "#121212",
              borderBottom: "1px solid #333",
              padding: "10px 16px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: "12px",
            }}
          >
            <span>{fileName}</span>
            <div style={{ display: "flex", gap: "8px" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 3 21 3 21 9"></polyline>
                <polyline points="9 21 3 21 3 15"></polyline>
                <line x1="21" y1="3" x2="14" y2="10"></line>
                <line x1="3" y1="21" x2="10" y2="14"></line>
              </svg>
            </div>
          </div>

          <div
            style={{
              padding: "10px 0",
              overflow: "auto",
              fontSize: "13px",
              lineHeight: "1.65",
              color: "#d4d4d4",
              fontFamily: 'Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace',
              background: "#161616",
            }}
          >
            {codeLines.map((lineText: string, idx: number) => {
              const lineNumber = idx + 1;
              const isHighlighted = showVisualizer && activeLine === lineNumber;

              return (
                <div
                  key={lineNumber}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "52px 1fr",
                    alignItems: "start",
                    backgroundColor: isHighlighted ? "rgba(229, 77, 66, 0.16)" : "transparent",
                    borderLeft: isHighlighted ? "3px solid #e54d42" : "3px solid transparent",
                  }}
                >
                  <div
                    style={{
                      padding: "0 12px 0 16px",
                      color: isHighlighted ? "#f1a197" : "#666",
                      textAlign: "right",
                      userSelect: "none",
                    }}
                  >
                    {lineNumber}
                  </div>
                  <div style={{ padding: "0 16px 0 0", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                    {lineText || " "}
                  </div>
                </div>
              );
            })}
          </div>

          <div
            style={{
              borderTop: "1px solid #333",
              padding: "14px 16px",
              background: "#1a1a1a",
            }}
          >
            <div style={{ fontWeight: "bold", marginBottom: "8px", fontSize: "13px" }}>Trace note</div>
            <div style={{ color: "#cfc3bf", fontSize: "13px", lineHeight: "1.5" }}>
              {currentFrame?.note ?? "Play the visualization to trace the active line and algorithm state."}
            </div>
          </div>
        </section>

        <section
          className="workspace-section"
          style={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            maxWidth: "700px",
            border: "1px solid #323232",
            borderRadius: "14px",
            overflow: "hidden",
            background: "#232323",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              padding: "14px 16px",
              borderBottom: "1px solid #343434",
              fontWeight: "bold",
              fontSize: "14px",
            }}
          >
            Output
          </div>
          <div
            style={{
              background: "#121212",
              padding: "16px",
              fontSize: "13px",
              color: "#fff",
              minHeight: "74px",
              fontFamily: 'Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace',
            }}
          >
            <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>{outputText || "No output yet."}</pre>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ALWorkspace;
