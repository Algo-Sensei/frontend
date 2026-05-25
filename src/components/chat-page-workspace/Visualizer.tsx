import { useEffect, useMemo, useState } from 'react';
import './Visualizer.css';
import { traceDynamicJava as traceProgram, ExecutionFrame } from './dynamicTracer';
import AlgorithmRenderer from './AlgorithmRenderer';

const SPEED_OPTIONS = [
  { label: "Slow", value: 1200 },
  { label: "Normal", value: 800 },
  { label: "Fast", value: 300 },
];

const extractEditableArray = (code: string) => {
  const match = code.match(/((?:int|double|float|String|boolean|char)\[\]\s+(\w+)\s*=\s*\{)(.*?)(\};)/s);
  if (!match) return null;

  return {
    fullMatch: match[0],
    prefix: match[1],
    name: match[2],
    value: match[3].trim(),
    suffix: match[4],
  };
};

const applyArrayInput = (code: string, arrayInput: string | null) => {
  if (arrayInput === null) return code;
  const editableArray = extractEditableArray(code);
  if (!editableArray) return code;
  return code.replace(editableArray.fullMatch, `${editableArray.prefix}${arrayInput}${editableArray.suffix}`);
};

const Visualizer = ({
  code,
  onActiveLineChange,
  onFrameChange,
}: {
  code: string;
  onActiveLineChange?: (line: number) => void;
  onFrameChange?: (frame?: ExecutionFrame) => void;
}) => {
  const [frames, setFrames] = useState<ExecutionFrame[]>([]);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(800);
  const [traceError, setTraceError] = useState<string | null>(null);
  const editableArray = useMemo(() => extractEditableArray(code), [code]);
  const [arrayInput, setArrayInput] = useState<string | null>(editableArray?.value ?? null);
  const tracedCode = useMemo(() => applyArrayInput(code, arrayInput), [code, arrayInput]);
  
  useEffect(() => {
    setArrayInput(editableArray?.value ?? null);
  }, [editableArray?.value]);

  useEffect(() => {
    try {
      const nextFrames = traceProgram(tracedCode);
      setFrames(nextFrames);
      setTraceError(nextFrames.length === 0 ? "I can visualize arrays, stacks, queues, loops, assignments, and simple conditions best. Try a Java snippet with executable statements inside a method." : null);
    } catch (error) {
      setFrames([]);
      setTraceError(error instanceof Error ? error.message : "The visualizer could not trace this code.");
    }
    setIndex(-1);
    setPlaying(false);
  }, [tracedCode]);

  useEffect(() => {
    if (!playing || frames.length === 0) return;

    const id = setInterval(() => {
      setIndex(prev => {
        if (prev >= frames.length - 1) {
          setPlaying(false);
          return prev;
        }
        return prev + 1;
      })
    }, speed);

    return () => clearInterval(id);
  }, [playing, speed, frames.length]);

  const frame = index >= 0 ? frames[index] : undefined;
  const atStart = index <= -1;
  const atEnd = frames.length === 0 || index >= frames.length - 1;
  const currentStep = index >= 0 ? index + 1 : 0;

  useEffect(() => {
    if (frame && onActiveLineChange) {
      onActiveLineChange(frame.line);
    }
  }, [frame, onActiveLineChange]);

  useEffect(() => {
    if (onFrameChange) {
      onFrameChange(frame);
    }
  }, [frame, onFrameChange]);

  return (
    <div className='visualizer'>
      <div className='visualizer-controls'>
        <button onClick={() => setIndex(i => Math.max(-1, i - 1))} disabled={atStart}>
          Step Back
        </button>
        <button onClick={() => setPlaying(v => !v)} disabled={frames.length === 0 || atEnd}>
          {playing ? "Pause" : "Play"}
        </button>
        <button onClick={() => setIndex(i => Math.min(frames.length - 1, i + 1))} disabled={atEnd}>
          Step Forward
        </button>
        <button onClick={() => {
          setIndex(-1);
          setPlaying(frames.length > 0);
        }} disabled={frames.length === 0}>Restart</button>

        <select value={speed}
        onChange={e => setSpeed(Number(e.target.value))}
        >
          {SPEED_OPTIONS.map(option => (
            <option value={option.value} key={option.value}>{option.label}</option>
          ))}
        </select>

        <div className="visualizer-scrubber">
          <input 
            type="range" 
            min={-1} 
            max={Math.max(0, frames.length - 1)} 
            value={index} 
            onChange={(e) => {
              setIndex(Number(e.target.value));
              setPlaying(false);
            }} 
            style={{ flex: 1, cursor: 'pointer', accentColor: '#e24e40' }}
          />
          <span className="visualizer-frame-count">
            Step {currentStep} / {frames.length}
          </span>
        </div>
      </div>

      {editableArray && (
        <div className="visualizer-input-panel">
          <label htmlFor="visualizer-array-input">Sample input: {editableArray.name}</label>
          <input
            id="visualizer-array-input"
            value={arrayInput ?? ""}
            onChange={(event) => setArrayInput(event.target.value)}
            placeholder="Example: 5, 2, 9, 1"
          />
        </div>
      )}

      {frames.length > 0 && (
        <div className="visualizer-timeline" aria-label="Execution timeline">
          {frames.map((timelineFrame, frameNumber) => (
            <button
              key={`${timelineFrame.line}-${frameNumber}`}
              className={`visualizer-timeline-dot${frameNumber === index ? " active" : ""}${frameNumber < index ? " complete" : ""}`}
              onClick={() => {
                setIndex(frameNumber);
                setPlaying(false);
              }}
              title={`Step ${frameNumber + 1}, line ${timelineFrame.line}`}
              aria-label={`Go to step ${frameNumber + 1}`}
            />
          ))}
        </div>
      )}

      <div className='visualizer-state'>
        {traceError ? (
          <div className="visualizer-empty-state">
            <strong>Visualizer needs a traceable snippet</strong>
            <p>{traceError}</p>
          </div>
        ) : (
          <AlgorithmRenderer
            frame={frame}
            previousFrame={frames[index - 1]}
            frameIndex={index}
            totalFrames={frames.length}
          />
        )}
      </div>
    </div>
  );

};

export default Visualizer;
