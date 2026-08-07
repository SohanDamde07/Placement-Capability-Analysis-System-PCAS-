import { useEffect, useRef } from 'react';

export default function PRSGauge({ score = 0, size = 220 }) {
  const ref = useRef(null);
  const r = (size / 2) - 14;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (score / 100) * circumference;

  const color = score >= 70 ? '#006e2f' : score >= 40 ? '#3525cd' : '#ba1a1a';

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle cx={size/2} cy={size/2} r={r} fill="transparent" stroke="#e5eeff" strokeWidth="12" />
        <circle
          ref={ref}
          cx={size/2} cy={size/2} r={r} fill="transparent"
          stroke={color} strokeWidth="14"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1.2s ease, stroke 0.3s ease' }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="font-black font-headline text-on-surface" style={{ fontSize: size * 0.24 }}>
          {score.toFixed(0)}
        </span>
        <span className="text-on-surface-variant font-bold text-sm tracking-widest">/100</span>
      </div>
    </div>
  );
}
