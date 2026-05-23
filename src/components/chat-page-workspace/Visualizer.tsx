import { useEffect, useState } from 'react';
import './Visualizer.css';
import { traceDynamicJava as traceProgram, ExecutionFrame } from './dynamicTracer';
import AlgorithmRenderer from './AlgorithmRenderer';

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
  
  useEffect(() => {
    setFrames(traceProgram(code));
    setIndex(-1);
  }, [code]);

  useEffect(() => {
    if (!playing) return;

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
        <button onClick={() => setIndex(i => Math.max(-1, i - 1))}>Prev</button>
        <button onClick={() => setPlaying(v => !v)}>
          {playing ? "Pause" : "Play"}
        </button>
        <button onClick={() => setIndex(i => Math.min(frames.length - 1, i + 1))}>Next</button>
        <button onClick={() => {
          setIndex(-1);
          setPlaying(true);
        }}>Restart</button>

        <select value={speed}
        onChange={e => setSpeed(Number(e.target.value))}
        >
          <option value={1200}>Slow</option>
          <option value={800}>Normal</option>
          <option value={300}>Fast</option>
        </select>

        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '12px', marginLeft: '10px' }}>
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
          <span style={{ fontSize: '13px', color: '#f4eee9', whiteSpace: 'nowrap', minWidth: '80px' }}>
            Frame {Math.min(Math.max(0, index + 1), frames.length)} / {frames.length}
          </span>
        </div>
      </div>

      <div className='visualizer-state'>
        <AlgorithmRenderer
          frame={frame}
          previousFrame={frames[index - 1]}
          frameIndex={index}
          totalFrames={frames.length}
        />
      </div>
    </div>
  );

};

export default Visualizer;
