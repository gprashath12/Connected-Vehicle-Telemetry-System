import { useRef, useState, useCallback } from 'react';

const STEPS = 24; // 0..24 inclusive — 25 positions

function fmtHour(h) {
  return `${String(h).padStart(2, '0')}:00`;
}

function clamp(n, lo, hi) {
  return Math.max(lo, Math.min(hi, n));
}

export default function HourlyRangeSlider({ from = 0, to = 24, onChange }) {
  const trackRef = useRef(null);
  const [dragging, setDragging] = useState(null);

  const valueAt = useCallback((clientX) => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect) return 0;
    const ratio = clamp((clientX - rect.left) / rect.width, 0, 1);
    return Math.round(ratio * STEPS);
  }, []);

  const onPointerDown = (which) => (e) => {
    e.stopPropagation();
    setDragging(which);
    e.target.setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e) => {
    if (!dragging) return;
    const v = valueAt(e.clientX);
    if (dragging === 'from') {
      onChange?.({ from: clamp(v, 0, to - 1), to });
    } else {
      onChange?.({ from, to: clamp(v, from + 1, STEPS) });
    }
  };

  const onPointerUp = () => setDragging(null);

  const fromPct = (from / STEPS) * 100;
  const toPct = (to / STEPS) * 100;

  return (
    <div className="w-full select-none">
      <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 mb-2">
        <span className="font-medium">Hour window</span>
        <span className="text-brand-600 dark:text-brand-300 font-mono">
          {fmtHour(from)} – {fmtHour(to)}
        </span>
      </div>
      <div
        ref={trackRef}
        className="relative h-6"
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div className="absolute top-1/2 left-0 right-0 h-1.5 -translate-y-1/2 rounded-full bg-slate-200 dark:bg-slate-700" />
        <div
          className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-brand-500"
          style={{ left: `${fromPct}%`, width: `${toPct - fromPct}%` }}
        />
        <Thumb percent={fromPct} active={dragging === 'from'} onPointerDown={onPointerDown('from')} />
        <Thumb percent={toPct} active={dragging === 'to'} onPointerDown={onPointerDown('to')} />
      </div>
      <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 mt-2 px-0.5">
        {[0, 6, 12, 18, 24].map((h) => (
          <span key={h}>{fmtHour(h)}</span>
        ))}
      </div>
    </div>
  );
}

function Thumb({ percent, active, onPointerDown }) {
  return (
    <div
      onPointerDown={onPointerDown}
      style={{ left: `${percent}%` }}
      className={`absolute top-1/2 -translate-x-1/2 -translate-y-1/2 h-5 w-5 rounded-full bg-white dark:bg-slate-100 border-2 border-brand-600 shadow-md transition-transform touch-none ${
        active ? 'cursor-grabbing scale-110' : 'cursor-grab'
      }`}
    />
  );
}
