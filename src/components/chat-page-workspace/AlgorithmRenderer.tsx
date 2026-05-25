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

const collectionEntries = (collections?: Record<string, any[]>) =>
  Object.entries(collections ?? {}).filter(([, value]) => Array.isArray(value));

const extractScene = (frame?: ExecutionFrame, previousFrame?: ExecutionFrame) => {
  const arrayEntries = collectionEntries(frame?.heap?.arrays);
  const stackEntries = collectionEntries(frame?.heap?.stack);
  const queueEntries = collectionEntries(frame?.heap?.queues);
  const variableEntries = Object.entries(frame?.variables ?? {});
  const changedVariables = new Set<string>();
  const changedArrays = new Set<string>();
  const changedStacks = new Set<string>();
  const changedQueues = new Set<string>();
  const swappedIndices = new Map<string, [number, number]>();
  const changedIndices = new Map<string, Set<number>>();

  if (frame?.operations && frame.operations.length > 0) {
    frame.operations.forEach(op => {
      if (op.type === 'assign') changedVariables.add(op.target);
      if (op.type === 'array_update') {
        changedArrays.add(op.target);
        if (!changedIndices.has(op.target)) changedIndices.set(op.target, new Set());
        changedIndices.get(op.target)!.add(op.index);
      }
      if (op.type === 'swap') {
        changedArrays.add(op.target);
        swappedIndices.set(op.target, op.indices);
        if (!changedIndices.has(op.target)) changedIndices.set(op.target, new Set());
        changedIndices.get(op.target)!.add(op.indices[0]);
        changedIndices.get(op.target)!.add(op.indices[1]);
      }
      if (op.type === 'method') {
        if (frame?.heap?.stack?.[op.target]) changedStacks.add(op.target);
        if (frame?.heap?.queues?.[op.target]) changedQueues.add(op.target);
        if (frame?.heap?.arrays?.[op.target]) changedArrays.add(op.target);
      }
    });
  } else {
    variableEntries.filter(([name, value]) => !valuesAreEqual(value, previousFrame?.variables?.[name])).forEach(([name]) => changedVariables.add(name));
    arrayEntries.filter(([name, value]) => !valuesAreEqual(value, previousFrame?.heap?.arrays?.[name])).forEach(([name]) => changedArrays.add(name));
    stackEntries.filter(([name, value]) => !valuesAreEqual(value, previousFrame?.heap?.stack?.[name])).forEach(([name]) => changedStacks.add(name));
    queueEntries.filter(([name, value]) => !valuesAreEqual(value, previousFrame?.heap?.queues?.[name])).forEach(([name]) => changedQueues.add(name));
  }

  const iterator = typeof frame?.variables?.i === "number" ? frame.variables.i : null;
  const foundIndex =
    typeof frame?.variables?.foundIndex === "number" ? frame.variables.foundIndex : null;

  return {
    arrayEntries,
    stackEntries,
    queueEntries,
    iterator,
    foundIndex,
    variableEntries,
    changedVariables,
    changedArrays,
    changedStacks,
    changedQueues,
    swappedIndices,
    changedIndices,
  };
};

const AlgorithmRenderer = ({ frame, previousFrame, frameIndex, totalFrames }: AlgorithmRendererProps) => {
  const scene = extractScene(frame, previousFrame);
  const hasCanvasItems = scene.variableEntries.length > 0 || scene.arrayEntries.length > 0 || scene.stackEntries.length > 0 || scene.queueEntries.length > 0;
  const printOutput = (frame?.output?.length ?? 0) > (previousFrame?.output?.length ?? 0) 
    ? frame?.output?.[frame.output.length - 1] 
    : null;
  const currentLine = frame?.line ?? "-";
  const outputLines = frame?.output ?? [];

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

        <div className="algo-renderer-legend" aria-label="Visualization legend">
          <span><i className="legend-swatch active" />Current</span>
          <span><i className="legend-swatch changed" />Changed</span>
          <span><i className="legend-swatch found" />Final</span>
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
                className={`algo-renderer-variable-card${changed ? " changed algo-animate-pulse" : ""}`}
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
            const isNumericArray = values.length > 0 && values.every((v) => typeof v === "number");
            const maxValue = isNumericArray ? Math.max(...(values as number[]), 1) : 1;

            return (
              <div
                className={`algo-renderer-array-card${changed ? " changed algo-animate-glow" : ""}`}
                key={name}
              >
                <div className="algo-renderer-array-title">{name}</div>
                {isNumericArray ? (
                  <div className="algo-renderer-bar-chart">
                    {values.map((value, index) => {
                      const jVar = frame?.variables?.j;
                      const isActive = index === scene.iterator || index === scene.foundIndex || index === jVar || (typeof jVar === "number" && index === jVar + 1);
                      const isFound = index === scene.foundIndex;
                      
                      let cellChanged = false;
                      let isSwapped = false;
                      if (frame?.operations && frame.operations.length > 0) {
                          cellChanged = scene.changedIndices.get(name)?.has(index) ?? false;
                          isSwapped = scene.swappedIndices.get(name)?.includes(index) ?? false;
                      } else {
                          cellChanged = !valuesAreEqual(value, previousValues[index]) || index >= previousValues.length;
                      }

                      const heightPercent = Math.max((value / maxValue) * 100, 5);

                      let swapStyle = {};
                      let swapClass = "";
                      if (isSwapped) {
                         const [idx1, idx2] = scene.swappedIndices.get(name)!;
                         const fromIndex = index === idx1 ? idx2 : idx1;
                         const diff = fromIndex - index;
                         // The bar width is approx 30px (24px + 6px gap).
                         swapStyle = { "--swap-offset": `${diff * 30}px` };
                         swapClass = " algo-animate-swap";
                      }

                      return (
                        <div 
                          className={`algo-renderer-bar-container${swapClass}`} 
                          key={`${name}-${index}`}
                          style={swapStyle as React.CSSProperties}
                        >
                          <div 
                            className={`algo-renderer-bar${isActive ? " active" : ""}${isFound ? " found" : ""}${cellChanged ? " changed" : ""}`}
                            style={{ height: `${heightPercent}%` }}
                          />
                          <span className="algo-renderer-bar-label">{formatValue(value)}</span>
                          <span className="algo-renderer-bar-index">{index}</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="algo-renderer-array-shell">
                    {values.map((value, index) => {
                      const isActive = index === scene.iterator || index === scene.foundIndex || index === frame?.variables?.j;
                      const isFound = index === scene.foundIndex;
                      
                      let cellChanged = false;
                      if (frame?.operations && frame.operations.length > 0) {
                          cellChanged = scene.changedIndices.get(name)?.has(index) ?? false;
                      } else {
                          cellChanged = !valuesAreEqual(value, previousValues[index]) || index >= previousValues.length;
                      }

                      return (
                        <div className="algo-renderer-array-cell" key={`${name}-${index}`}>
                          <span className="algo-renderer-index-tag">{index}</span>
                          <div
                            className={`algo-renderer-array-item${isActive ? " active" : ""}${isFound ? " found" : ""}${cellChanged ? " changed algo-animate-scale" : ""}`}
                          >
                            {formatValue(value)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          {scene.stackEntries.map(([name, values]) => {
            const changed = scene.changedStacks.has(name);
            const previousValues = previousFrame?.heap?.stack?.[name] ?? [];

            return (
              <div
                className={`algo-renderer-stack-card${changed ? " algo-animate-glow" : ""}`}
                key={name}
              >
                <div className="algo-renderer-array-title">{name}</div>
                <div className="algo-renderer-stack-shell">
                  {values.map((value, index) => {
                    const isTop = index === values.length - 1;
                    const cellChanged = !valuesAreEqual(value, previousValues[index]) || index >= previousValues.length;
                    return (
                      <div className="algo-renderer-stack-row" key={`${name}-${index}`}>
                        <div className={`algo-renderer-stack-item${cellChanged ? " algo-animate-scale" : ""}`}>
                          {formatValue(value)}
                        </div>
                        {isTop && <span className="algo-renderer-stack-top-indicator">&lt;- top</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {scene.queueEntries.map(([name, values]) => {
            const changed = scene.changedQueues.has(name);
            const previousValues = previousFrame?.heap?.queues?.[name] ?? [];

            return (
              <div
                className={`algo-renderer-queue-card${changed ? " algo-animate-glow" : ""}`}
                key={name}
              >
                <div className="algo-renderer-array-title">{name}</div>
                <div className="algo-renderer-queue-shell">
                  <span className="algo-renderer-queue-indicator">Front -&gt;</span>
                  {values.map((value, index) => {
                    const cellChanged = !valuesAreEqual(value, previousValues[index]) || index >= previousValues.length;
                    return (
                      <div
                        className={`algo-renderer-queue-item${cellChanged ? " algo-animate-scale" : ""}`}
                        key={`${name}-${index}`}
                      >
                        {formatValue(value)}
                      </div>
                    );
                  })}
                  <span className="algo-renderer-queue-indicator">&lt;- Rear</span>
                </div>
              </div>
            );
          })}

          {!hasCanvasItems && (
            <div className="algo-renderer-empty">
              Press play or step forward to start tracing the algorithm state.
            </div>
          )}
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
            <strong>{currentLine}</strong>
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

      <div className="algo-renderer-inspector">
        <div className="algo-renderer-inspector-panel">
          <span className="algo-renderer-card-label">Variables</span>
          <div className="algo-renderer-inspector-list">
            {scene.variableEntries.length > 0 ? scene.variableEntries.map(([name, value]) => (
              <div className={`algo-renderer-inspector-row${scene.changedVariables.has(name) ? " changed" : ""}`} key={name}>
                <span>{name}</span>
                <strong>{formatValue(value)}</strong>
              </div>
            )) : <p>No variables yet.</p>}
          </div>
        </div>

        <div className="algo-renderer-inspector-panel">
          <span className="algo-renderer-card-label">Collections</span>
          <div className="algo-renderer-inspector-list">
            {[...scene.arrayEntries, ...scene.stackEntries, ...scene.queueEntries].length > 0 ? (
              [...scene.arrayEntries, ...scene.stackEntries, ...scene.queueEntries].map(([name, values]) => (
                <div className="algo-renderer-inspector-row" key={name}>
                  <span>{name}</span>
                  <strong>{formatValue(values)}</strong>
                </div>
              ))
            ) : <p>No arrays, stacks, or queues yet.</p>}
          </div>
        </div>

        <div className="algo-renderer-inspector-panel">
          <span className="algo-renderer-card-label">Output</span>
          <div className="algo-renderer-output-list">
            {outputLines.length > 0 ? outputLines.map((line, index) => (
              <code key={`${line}-${index}`}>{line}</code>
            )) : <p>No output yet.</p>}
          </div>
        </div>
      </div>
      
      {frame?.stats && (
        <div className="algo-renderer-dashboard" style={{ marginTop: "16px" }}>
          <div className="algo-renderer-complexity-panel">
             <div className="algo-renderer-complexity-header">Complexity Analysis</div>
             <div className="algo-renderer-complexity-grid">
                 <div className="complexity-item">
                     <span className="complexity-label">Time Complexity</span>
                     <strong className="complexity-value highlight">{frame.stats.timeComplexity}</strong>
                 </div>
                 <div className="complexity-item">
                     <span className="complexity-label">Space Complexity</span>
                     <strong className="complexity-value">{frame.stats.spaceComplexity}</strong>
                 </div>
                 <div className="complexity-item">
                     <span className="complexity-label">Comparisons</span>
                     <strong className="complexity-value">{frame.stats.comparisons}</strong>
                 </div>
                 <div className="complexity-item">
                     <span className="complexity-label">Swaps</span>
                     <strong className="complexity-value">{frame.stats.swaps}</strong>
                 </div>
                 <div className="complexity-item">
                     <span className="complexity-label">Array Accesses</span>
                     <strong className="complexity-value">{frame.stats.arrayAccesses}</strong>
                 </div>
                 <div className="complexity-item">
                     <span className="complexity-label">Iterations</span>
                     <strong className="complexity-value">{frame.stats.iterations}</strong>
                 </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlgorithmRenderer;
