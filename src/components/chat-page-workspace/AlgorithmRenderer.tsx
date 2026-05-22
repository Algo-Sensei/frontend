import type { ExecutionFrame } from "./dynamicTracer";

type AlgorithmRendererProps = {
  frame?: ExecutionFrame;
  previousFrame?: ExecutionFrame;
  frameIndex: number;
  totalFrames: number;
};

const formatValue = (value: unknown) => {
  if (Array.isArray(value)) {
    return `[${value.join(", ")}]`;
  }

  if (typeof value === "object" && value !== null) {
    return JSON.stringify(value);
  }

  return String(value ?? "-");
};

const valuesAreEqual = (left: unknown, right: unknown) => {
  return JSON.stringify(left) === JSON.stringify(right);
};

const extractScene = (frame?: ExecutionFrame, previousFrame?: ExecutionFrame) => {
  const arrayEntries = Object.entries(frame?.heap?.arrays ?? {}).filter(([, value]) =>
    Array.isArray(value)
  );
  const variableEntries = Object.entries(frame?.variables ?? {});
  const changedVariables = new Set(
    variableEntries
      .filter(([name, value]) => !valuesAreEqual(value, previousFrame?.variables?.[name]))
      .map(([name]) => name)
  );
  const changedArrays = new Set(
    arrayEntries
      .filter(([name, value]) => !valuesAreEqual(value, previousFrame?.heap?.arrays?.[name]))
      .map(([name]) => name)
  );

  const iterator = typeof frame?.variables?.i === "number" ? frame.variables.i : null;
  const foundIndex =
    typeof frame?.variables?.foundIndex === "number" ? frame.variables.foundIndex : null;

  return {
    arrayEntries,
    iterator,
    foundIndex,
    variableEntries,
    changedVariables,
    changedArrays,
  };
};

const AlgorithmRenderer = ({ frame, previousFrame, frameIndex, totalFrames }: AlgorithmRendererProps) => {
  const scene = extractScene(frame, previousFrame);
  const hasCanvasItems = scene.variableEntries.length > 0 || scene.arrayEntries.length > 0;
  const printOutput = (frame?.output?.length ?? 0) > (previousFrame?.output?.length ?? 0) 
    ? frame?.output?.[frame.output.length - 1] 
    : null;

  return (
    <div className="algo-renderer">
      <div className="algo-renderer-stage">
        <div className="algo-renderer-glow algo-renderer-glow-left" />
        <div className="algo-renderer-glow algo-renderer-glow-right" />

        <div className="algo-renderer-topbar">
          <div>
            <div className="algo-renderer-label">Algorithm Trace</div>
            <div className="algo-renderer-caption">Live canvas</div>
          </div>
          <div className="algo-renderer-frame-pill">
            Frame {Math.min(frameIndex + 1, Math.max(totalFrames, 1))}/{Math.max(totalFrames, 1)}
          </div>
        </div>

        <div className={`algo-renderer-canvas${hasCanvasItems ? "" : " blank"}`} style={{ position: "relative" }}>
          {printOutput && (
            <div className="algo-renderer-print-bubble" style={{
              position: "absolute",
              top: "20px",
              right: "20px",
              background: "#e24e40",
              color: "white",
              padding: "8px 16px",
              borderRadius: "20px",
              boxShadow: "0 4px 12px rgba(226, 78, 64, 0.4)",
              zIndex: 10,
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontWeight: 500,
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
              <span>{printOutput}</span>
            </div>
          )}

          {scene.variableEntries.map(([name, value]) => {
            const changed = scene.changedVariables.has(name);

            return (
              <div
                className={`algo-renderer-variable-card${changed ? " changed" : ""}`}
                key={name}
              >
                <span className="algo-renderer-chip-label">{name}</span>
                <div className="algo-renderer-chip algo-renderer-variable-value">
                  {formatValue(value)}
                </div>
              </div>
            );
          })}

          {scene.arrayEntries.map(([name, values]) => {
            const changed = scene.changedArrays.has(name);
            const previousValues = previousFrame?.heap?.arrays?.[name] ?? [];

            return (
              <div
                className={`algo-renderer-array-card${changed ? " changed" : ""}`}
                key={name}
              >
                <div className="algo-renderer-array-title">{name}</div>
                <div className="algo-renderer-array-shell">
                  {values.map((value, index) => {
                    const isActive = scene.iterator === index;
                    const isFound = scene.foundIndex === index;
                    const cellChanged = !valuesAreEqual(value, previousValues[index]);

                    return (
                      <div className="algo-renderer-array-cell" key={`${name}-${index}`}>
                        <span className="algo-renderer-index-tag">{index}</span>
                        <div
                          className={`algo-renderer-array-item${isActive ? " active" : ""}${isFound ? " found" : ""}${cellChanged ? " changed" : ""}`}
                        >
                          {formatValue(value)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="algo-renderer-dashboard">
        <div className="algo-renderer-note-card">
          <span className="algo-renderer-card-label">Trace note</span>
          <p>{frame?.note ?? "Waiting for execution frames."}</p>
        </div>

        <div className="algo-renderer-stats">
          <div className="algo-renderer-stat-card">
            <span className="algo-renderer-card-label">Line</span>
            <strong>{frame?.line ?? "-"}</strong>
          </div>
          <div className="algo-renderer-stat-card">
            <span className="algo-renderer-card-label">Iterator</span>
            <strong>{scene.iterator ?? "-"}</strong>
          </div>
          <div className="algo-renderer-stat-card">
            <span className="algo-renderer-card-label">Match</span>
            <strong>{scene.foundIndex ?? "-"}</strong>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlgorithmRenderer;
