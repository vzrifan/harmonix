import React from 'react';
import { Compass, Music2 } from 'lucide-react';
import { NoteName } from '../types/music';
import { CIRCLE_OF_FIFTHS, noteToMidi } from '../utils/musicTheory';
import { audioSynth } from '../utils/audioSynth';

interface CircleOfFifthsProps {
  currentRoot: NoteName;
  onSelectRoot: (root: NoteName) => void;
}

export const CircleOfFifths: React.FC<CircleOfFifthsProps> = ({
  currentRoot,
  onSelectRoot,
}) => {
  // Find current index
  const currentIndex = CIRCLE_OF_FIFTHS.findIndex(
    (item) => item.key === currentRoot || (item.key === 'Db' && currentRoot === 'C#') || (item.key === 'F#' && currentRoot === 'Gb')
  );
  const activeKeyInfo = CIRCLE_OF_FIFTHS[currentIndex !== -1 ? currentIndex : 0];

  // Harmonic neighbors on circle
  // Clockwise is Dominant (V), Counterclockwise is Subdominant (IV)
  const dominantIndex = (currentIndex + 1) % 12;
  const subdominantIndex = (currentIndex + 11) % 12;

  const handleKeyClick = (key: NoteName, isMinor: boolean = false) => {
    onSelectRoot(key);
    // Play a preview triad for feedback
    const rootMidi = noteToMidi(key, 3);
    const thirdOffset = isMinor ? 3 : 4;
    const fifthOffset = 7;
    audioSynth.playChord([rootMidi, rootMidi + thirdOffset, rootMidi + fifthOffset], 40, 1.6);
  };

  // SVG Geometry
  const size = 340;
  const center = size / 2;
  const outerRadius = 155;
  const midRadius = 110;
  const innerRadius = 65;

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 shadow-xl backdrop-blur-sm flex flex-col items-center">
      {/* Header */}
      <div className="w-full flex items-center justify-between pb-3 border-b border-zinc-800 mb-3">
        <div className="flex items-center gap-2">
          <Compass className="h-4 w-4 text-indigo-400" />
          <h3 className="text-base font-semibold text-white">Circle of Fifths</h3>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
          Key: <strong className="text-white">{activeKeyInfo.key} Major</strong> / {activeKeyInfo.relativeMinor}m
        </span>
      </div>

      {/* SVG Circular Wheel */}
      <div className="relative flex items-center justify-center">
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="select-none filter drop-shadow-md"
        >
          <defs>
            <radialGradient id="hubGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#27272a" />
              <stop offset="100%" stopColor="#18181b" />
            </radialGradient>
          </defs>

          {/* 12 Outer Segments: Major Keys */}
          {CIRCLE_OF_FIFTHS.map((item, idx) => {
            const angleDeg = idx * 30 - 90; // Start at top for C
            const angleRad = (angleDeg * Math.PI) / 180;
            const nextAngleRad = ((angleDeg + 30) * Math.PI) / 180;

            const isTonic = idx === currentIndex;
            const isDominant = idx === dominantIndex;
            const isSubdominant = idx === subdominantIndex;

            // Coordinates for outer arc wedge
            const x1 = center + outerRadius * Math.cos(angleRad);
            const y1 = center + outerRadius * Math.sin(angleRad);
            const x2 = center + outerRadius * Math.cos(nextAngleRad);
            const y2 = center + outerRadius * Math.sin(nextAngleRad);
            const x3 = center + midRadius * Math.cos(nextAngleRad);
            const y3 = center + midRadius * Math.sin(nextAngleRad);
            const x4 = center + midRadius * Math.cos(angleRad);
            const y4 = center + midRadius * Math.sin(angleRad);

            const pathD = `M ${x1} ${y1} A ${outerRadius} ${outerRadius} 0 0 1 ${x2} ${y2} L ${x3} ${y3} A ${midRadius} ${midRadius} 0 0 0 ${x4} ${y4} Z`;

            // Label coordinate
            const midAngleRad = ((angleDeg + 15) * Math.PI) / 180;
            const labelRadius = (outerRadius + midRadius) / 2;
            const textX = center + labelRadius * Math.cos(midAngleRad);
            const textY = center + labelRadius * Math.sin(midAngleRad);

            return (
              <g
                key={`outer-${item.key}`}
                onClick={() => handleKeyClick(item.key, false)}
                className="cursor-pointer transition-opacity hover:opacity-90 group"
              >
                <path
                  d={pathD}
                  fill={
                    isTonic
                      ? '#6366f1' // Indigo
                      : isDominant
                      ? '#f59e0b' // Amber (V)
                      : isSubdominant
                      ? '#10b981' // Emerald (IV)
                      : '#27272a'
                  }
                  stroke="#18181b"
                  strokeWidth="2"
                  className="transition-colors duration-150"
                />
                <text
                  x={textX}
                  y={textY}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="#ffffff"
                  className={`text-sm font-bold pointer-events-none ${
                    isTonic ? 'text-white scale-110 font-extrabold' : 'text-zinc-200'
                  }`}
                >
                  {item.key}
                </text>
              </g>
            );
          })}

          {/* 12 Inner Segments: Relative Minor Keys */}
          {CIRCLE_OF_FIFTHS.map((item, idx) => {
            const angleDeg = idx * 30 - 90;
            const angleRad = (angleDeg * Math.PI) / 180;
            const nextAngleRad = ((angleDeg + 30) * Math.PI) / 180;

            const isTonic = idx === currentIndex;

            const x1 = center + midRadius * Math.cos(angleRad);
            const y1 = center + midRadius * Math.sin(angleRad);
            const x2 = center + midRadius * Math.cos(nextAngleRad);
            const y2 = center + midRadius * Math.sin(nextAngleRad);
            const x3 = center + innerRadius * Math.cos(nextAngleRad);
            const y3 = center + innerRadius * Math.sin(nextAngleRad);
            const x4 = center + innerRadius * Math.cos(angleRad);
            const y4 = center + innerRadius * Math.sin(angleRad);

            const pathD = `M ${x1} ${y1} A ${midRadius} ${midRadius} 0 0 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 0 0 ${x4} ${y4} Z`;

            const midAngleRad = ((angleDeg + 15) * Math.PI) / 180;
            const labelRadius = (midRadius + innerRadius) / 2;
            const textX = center + labelRadius * Math.cos(midAngleRad);
            const textY = center + labelRadius * Math.sin(midAngleRad);

            return (
              <g
                key={`inner-${item.relativeMinor}`}
                onClick={() => handleKeyClick(item.relativeMinor, true)}
                className="cursor-pointer hover:opacity-90 group"
              >
                <path
                  d={pathD}
                  fill={isTonic ? '#4f46e5' : '#1f2937'}
                  stroke="#18181b"
                  strokeWidth="1.5"
                  className="transition-colors duration-150"
                />
                <text
                  x={textX}
                  y={textY}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="#d1d5db"
                  className="text-[11px] font-medium pointer-events-none"
                >
                  {item.relativeMinor}m
                </text>
              </g>
            );
          })}

          {/* Center Hub: Key Signature details */}
          <circle
            cx={center}
            cy={center}
            r={innerRadius - 4}
            fill="url(#hubGradient)"
            stroke="#3f3f46"
            strokeWidth="2"
          />
          <text
            x={center}
            y={center - 12}
            textAnchor="middle"
            fill="#a1a1aa"
            className="text-[10px] font-bold uppercase tracking-wider pointer-events-none"
          >
            Key Signature
          </text>
          <text
            x={center}
            y={center + 6}
            textAnchor="middle"
            fill="#ffffff"
            className="text-xs font-bold pointer-events-none"
          >
            {activeKeyInfo.accidentals === 0
              ? 'No sharps/flats'
              : activeKeyInfo.accidentals > 0
              ? `${activeKeyInfo.accidentals} Sharp${activeKeyInfo.accidentals > 1 ? 's' : ''}`
              : `${Math.abs(activeKeyInfo.accidentals)} Flat${Math.abs(activeKeyInfo.accidentals) > 1 ? 's' : ''}`}
          </text>
          <text
            x={center}
            y={center + 22}
            textAnchor="middle"
            fill="#818cf8"
            className="text-[10px] pointer-events-none"
          >
            {activeKeyInfo.accidentalSymbols.length > 0
              ? activeKeyInfo.accidentalSymbols.join(' ')
              : 'Natural Key'}
          </text>
        </svg>
      </div>

      {/* Harmonic Function Legend */}
      <div className="mt-3 flex flex-wrap items-center justify-center gap-3 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-indigo-500" />
          <span className="text-zinc-300">Tonic (I / vi)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-emerald-500" />
          <span className="text-zinc-300">Subdominant (IV)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-amber-500" />
          <span className="text-zinc-300">Dominant (V)</span>
        </div>
      </div>
    </div>
  );
};
