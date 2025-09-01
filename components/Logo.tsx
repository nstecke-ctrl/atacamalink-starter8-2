
'use client';
import * as React from 'react';
const ACCENT = '#0F8A8A';
const STROKE = '#111111';

/** Geometry-locked logo: arcs share the dot center, preventing any misalignment. */
export default function Logo({ size = 36, withWordmark = false, title = 'AtacamaLink' }:{
  size?: number; withWordmark?: boolean; title?: string;
}) {
  const mark = (
    <svg viewBox="0 0 64 64" role="img" aria-label={title} width={size} height={size}>
      <g stroke={STROKE} strokeWidth={6} fill="none" strokeLinecap="round">
        <path d="M32 14 A 18 18 0 0 1 50 32"/>
        <path d="M32 6  A 26 26 0 0 1 58 32"/>
        <path d="M32 -2 A 34 34 0 0 1 66 32"/>
      </g>
      <circle cx={32} cy={32} r={10} fill={ACCENT} />
    </svg>
  );
  if (!withWordmark) return mark;
  return (
    <div className="flex items-center gap-2">
      {mark}
      <span style={{ fontWeight: 700, color: STROKE }}>ATACAMALINK</span>
    </div>
  );
}
