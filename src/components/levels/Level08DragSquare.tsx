import React, { useRef, useState } from 'react';
import { Grip } from 'lucide-react';
import type { LevelComponentProps } from '../../game/types';
import { sound } from '../../utils/sound';

const TARGET_SPOTS = [
  { x: 78, y: 50, size: 72, note: 'Drag the cube into the dashed socket.' },
  { x: 22, y: 24, size: 58, note: 'TOO SLOW! The socket panicked and relocated.' },
  { x: 78, y: 78, size: 50, note: 'It shrunk out of pure anxiety. Try again!' },
  { x: 52, y: 28, size: 64, note: 'Okay, the socket is exhausted. Drop it in now.' },
];

export const Level08DragSquare: React.FC<LevelComponentProps> = ({
  onSuccess,
  onChaosSpike,
}) => {
  const arenaRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const [boxPos, setBoxPos] = useState({ x: 20, y: 55 });
  const [phase, setPhase] = useState(0);
  const [completed, setCompleted] = useState(false);
  const lastTeleportRef = useRef(0);

  const currentTarget = TARGET_SPOTS[phase];

  const updatePointer = (clientX: number, clientY: number) => {
    const rect = arenaRef.current?.getBoundingClientRect();
    if (!rect || completed) return;
    const x = Math.max(8, Math.min(92, ((clientX - rect.left) / rect.width) * 100));
    const y = Math.max(12, Math.min(88, ((clientY - rect.top) / rect.height) * 100));
    setBoxPos({ x, y });

    const dist = Math.hypot(x - currentTarget.x, y - currentTarget.y);
    if (dist < 15) {
      if (phase < TARGET_SPOTS.length - 1) {
        const now = Date.now();
        if (now - lastTeleportRef.current > 350) {
          lastTeleportRef.current = now;
          sound.glitch();
          onChaosSpike?.(3);
          setPhase((p) => Math.min(TARGET_SPOTS.length - 1, p + 1));
        }
      } else {
        setCompleted(true);
        setDragging(false);
        setBoxPos({ x: currentTarget.x, y: currentTarget.y });
        onSuccess('Fine motor skills verified. The socket has filed a restraining order.');
      }
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (completed) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    sound.click();
    setDragging(true);
    updatePointer(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!dragging) return;
    updatePointer(e.clientX, e.clientY);
  };

  const handlePointerUp = () => {
    setDragging(false);
  };

  // Keyboard accessibility support so users can also nudge with arrow keys
  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (completed) return;
    const step = 7;
    let nx = boxPos.x;
    let ny = boxPos.y;
    if (e.key === 'ArrowRight') nx = Math.min(92, nx + step);
    else if (e.key === 'ArrowLeft') nx = Math.max(8, nx - step);
    else if (e.key === 'ArrowDown') ny = Math.min(88, ny + step);
    else if (e.key === 'ArrowUp') ny = Math.max(12, ny - step);
    else return;
    e.preventDefault();
    setBoxPos({ x: nx, y: ny });
    const dist = Math.hypot(nx - currentTarget.x, ny - currentTarget.y);
    if (dist < 15) {
      if (phase < TARGET_SPOTS.length - 1) {
        sound.glitch();
        setPhase((p) => p + 1);
      } else {
        setCompleted(true);
        onSuccess('Keyboard-driven cube smuggling accepted.');
      }
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs text-[#9BA1AE]">
        <span>{currentTarget.note}</span>
        <span className="font-mono-tabular text-[#F2F0EB]">
          Dodges: {phase}/{TARGET_SPOTS.length - 1}
        </span>
      </div>

      <div
        ref={arenaRef}
        className="relative h-64 w-full touch-none select-none overflow-hidden rounded-md border border-[#2C313C] bg-[#0F1116] sm:h-72"
      >
        {/* Target socket */}
        <div
          style={{
            left: `${currentTarget.x}%`,
            top: `${currentTarget.y}%`,
            width: `${currentTarget.size}px`,
            height: `${currentTarget.size}px`,
            transform: 'translate(-50%, -50%)',
          }}
          className={`pointer-events-none absolute flex items-center justify-center rounded-md border-2 border-dashed transition-all duration-200 ${
            completed
              ? 'border-[#22C55E] bg-[#22C55E]/20'
              : 'border-[#EF4444] bg-[#DC2626]/10'
          }`}
        >
          <span className="font-mono text-[10px] font-semibold tracking-wider text-[#FCA5A5]">
            {completed ? 'LOCKED' : 'DROP'}
          </span>
        </div>

        {/* Draggable cube */}
        <button
          type="button"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onKeyDown={handleKeyDown}
          aria-label="Draggable verification cube. Drag or use arrow keys to place inside the target socket."
          style={{
            left: `${boxPos.x}%`,
            top: `${boxPos.y}%`,
            transform: `translate(-50%, -50%) scale(${dragging ? 1.08 : 1})`,
          }}
          className={`absolute flex h-12 w-12 items-center justify-center rounded-md border-2 bg-[#F2F0EB] text-[#0B0C0E] shadow-lg transition-transform duration-75 focus-visible:outline-2 focus-visible:outline-[#EF4444] ${
            dragging ? 'cursor-grabbing border-[#EF4444]' : 'cursor-grab border-[#9BA1AE]'
          }`}
        >
          <Grip className="h-5 w-5" />
        </button>
      </div>

      <p className="text-xs text-[#9BA1AE]">
        Drag with mouse/touch (or focus the cube and press Arrow keys).
      </p>
    </div>
  );
};
