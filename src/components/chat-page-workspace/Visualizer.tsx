import { useEffect, useState } from 'react';
import './Visualizer.css';
import traceProgram, { ExecutionFrame } from './traceProgram';

const Visualizer = ({ code }: { code: string }) => {
  const [frames, setFrames] = useState<ExecutionFrame[]>([]);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(800);
  
  useEffect(() => {
    setFrames(traceProgram(code));
    setIndex(0);
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

  const frame = frames[index];

  return (
    <div className='visualizer'>
      <div className='visualizer-controls'>
        <button onClick={() => setIndex(i => Math.max(0, i - 1))}>Prev</button>
        <button onClick={() => setPlaying(v => !v)}>
          {playing ? "Pause" : "Play"}
        </button>
        <button onClick={() => setIndex(i => Math.min(frames.length - 1, i + 1))}>Next</button>

        <select value={speed}
        onChange={e => setSpeed(Number(e.target.value))}
        >
          <option value={1200}>Slow</option>
          <option value={800}>Normal</option>
          <option value={300}>Fast</option>
        </select>
      </div>

      <div className='visualizer-state'>
        <pre>{JSON.stringify(frame, null, 2)}</pre>
      </div>
    </div>
  );

};

export default Visualizer;