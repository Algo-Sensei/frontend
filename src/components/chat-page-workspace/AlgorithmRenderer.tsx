import type { ExecutionFrame } from "./traceProgram";

type AlgorithmRendererProps = {
  frame?: ExecutionFrame;
  frameIndex: number;
  totalFrames: number;
};

const formatValue = (value: unknown) => {
  if (Array.isArray(value)) {
    return `[${value.join(", ")}]`;
  }

  return String(value ?? "-");
};

const extractScene = (frame?: ExecutionFrame) => {
  const arrayEntry = Object.entries(frame?.heap?.arrays ?? {})[0];
  const [arrayName, arrayValues] = arrayEntry ?? ["array", []];
  const safeValues = Array.isArray(arrayValues) ? arrayValues : [];

  const iterator = typeof frame?.variables?.i === "number" ? frame.variables.i : null;
  const foundIndex =
    typeof frame?.variables?.foundIndex === "number" ? frame.variables.foundIndex : null;
  const currentValue =
    typeof frame?.variables?.currentValue === "number" ? frame.variables.currentValue : null;
  const target =
    typeof frame?.variables?.target === "number"
      ? frame.variables.target
      : typeof frame?.variables?.value === "number"
        ? frame.variables.value
        : null;

  return {
    arrayName,
    arrayValues: safeValues,
    iterator,
    foundIndex,
    currentValue,
    target,
  };
};

const AlgorithmRenderer = ({ frame, frameIndex, totalFrames }: AlgorithmRendererProps) => {
  const scene = extractScene(frame);

  return (
    <div className="algo-renderer">
      <div className="algo-renderer-stage">
        <div className="algo-renderer-glow algo-renderer-glow-left" />
        <div className="algo-renderer-glow algo-renderer-glow-right" />

        <div className="algo-renderer-topbar">
          <div>
            <div className="algo-renderer-label">Algorithm Trace</div>
            <div className="algo-renderer-caption">{scene.arrayName}</div>
          </div>
          <div className="algo-renderer-frame-pill">
            Frame {Math.min(frameIndex + 1, Math.max(totalFrames, 1))}/{Math.max(totalFrames, 1)}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '32px', marginTop: '24px', alignItems: 'flex-start' }}>
            {/* Call Stack Panel */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="algo-renderer-label" style={{ color: '#fff', fontSize: '13px' }}>Call Stack</div>
                <div style={{ 
                    background: 'rgba(255,255,255,0.05)', 
                    border: '1px solid rgba(255,255,255,0.1)', 
                    borderRadius: '8px', 
                    padding: '8px',
                    minWidth: '120px',
                    minHeight: '150px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                }}>
                    <div className="algo-renderer-chip" style={{ width: '100%', padding: '8px 12px' }}>main</div>
                </div>
            </div>

            {/* Main Visuals: Variables + Array */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', flex: 1 }}>
                
                {/* Local Variables */}
                <div style={{ display: 'flex', gap: '24px' }}>
                    {scene.target !== null && (
                        <div className="algo-renderer-target-block">
                            <span className="algo-renderer-chip-label" style={{ color: '#fff' }}>target</span>
                            <div className="algo-renderer-chip">{formatValue(scene.target)}</div>
                        </div>
                    )}
                    {scene.iterator !== null && (
                        <div className="algo-renderer-target-block">
                            <span className="algo-renderer-chip-label" style={{ color: '#fff' }}>i</span>
                            <div className="algo-renderer-chip">{scene.iterator}</div>
                        </div>
                    )}
                </div>

                {/* Array Representation */}
                {scene.arrayValues.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div className="algo-renderer-label" style={{ color: '#fff', fontSize: '13px' }}>{scene.arrayName}</div>
                        <div className="algo-renderer-array-shell" style={{ padding: '0', minHeight: 'auto', gap: '12px', border: 'none' }}>
                            {scene.arrayValues.map((value, index) => {
                                const isActive = scene.iterator === index;
                                const isFound = scene.foundIndex === index;

                                return (
                                    <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                                        <span className="algo-renderer-index-tag" style={{ position: 'static' }}>{index}</span>
                                        <div className={`algo-renderer-array-item${isActive ? " active" : ""}${isFound ? " found" : ""}`}>
                                            {value}
                                        </div>
                                        <div style={{ height: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: isActive ? 1 : 0, transition: 'opacity 0.2s', marginTop: '4px' }}>
                                            <div style={{ width: '2px', height: '16px', background: '#f08f84' }} />
                                            <span style={{ color: '#f08f84', fontSize: '13px', fontWeight: 'bold', marginTop: '2px' }}>i</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
                {scene.arrayValues.length === 0 && (
                     <div className="algo-renderer-empty">No traceable structure yet</div>
                )}

            </div>
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
