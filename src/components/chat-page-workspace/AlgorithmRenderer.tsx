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

        <div className={`algo-renderer-canvas${hasCanvasItems ? "" : " blank"}`}>
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
