import React, { useState } from 'react';
import { Guitar, SlidersHorizontal, Volume2 } from 'lucide-react';
import { NoteName, TuningOption } from '../types/music';
import {
  TUNINGS,
  getPitchClass,
  noteFromPitchClass,
  noteToMidi,
  INTERVAL_NAMES,
} from '../utils/musicTheory';
import { audioSynth } from '../utils/audioSynth';

interface FretboardVisualizerProps {
  rootNote: NoteName;
  activeNotes: { note: NoteName; degree: string; interval: number }[];
  name: string;
}

export const FretboardVisualizer: React.FC<FretboardVisualizerProps> = ({
  rootNote,
  activeNotes,
  name,
}) => {
  const [selectedTuningId, setSelectedTuningId] = useState<string>('guitar_standard');
  const [fretCount, setFretCount] = useState<number>(15);
  const [displayMode, setDisplayMode] = useState<'degrees' | 'notes' | 'intervals'>('degrees');
  const [activeFretKey, setActiveFretKey] = useState<string | null>(null);

  const currentTuning = TUNINGS.find((t) => t.id === selectedTuningId) || TUNINGS[0];

  // Map of active pitch classes
  const activePitchClassMap = new Map<number, { degree: string; interval: number; isRoot: boolean }>();
  activeNotes.forEach((item) => {
    const pc = getPitchClass(item.note);
    activePitchClassMap.set(pc, {
      degree: item.degree,
      interval: item.interval,
      isRoot: item.note === rootNote || item.interval === 0,
    });
  });

  const handleFretClick = (midi: number, stringIdx: number, fret: number) => {
    const key = `${stringIdx}-${fret}`;
    setActiveFretKey(key);
    audioSynth.playNote(midi, 1.2, 0.8);
    setTimeout(() => {
      setActiveFretKey((prev) => (prev === key ? null : prev));
    }, 350);
  };

  // Standard fret markers: 3, 5, 7, 9, 12 (double), 15, 17, 19, 21, 24 (double)
  const isFretMarker = (fret: number) => [3, 5, 7, 9, 15, 17, 19, 21].includes(fret);
  const isDoubleFretMarker = (fret: number) => [12, 24].includes(fret);

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 shadow-xl backdrop-blur-sm">
      {/* Header and Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <Guitar className="h-4 w-4 text-amber-400" />
            <h3 className="text-base font-semibold text-white">Fretboard Visualizer</h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
              {currentTuning.name}
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Full instrument neck view. Click any fret to play sound.
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Tuning Dropdown */}
          <select
            value={selectedTuningId}
            onChange={(e) => setSelectedTuningId(e.target.value)}
            className="rounded-lg bg-zinc-800 px-3 py-1.5 text-xs text-zinc-200 border border-zinc-700 focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            {TUNINGS.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>

          {/* Display Mode */}
          <div className="flex items-center rounded-lg bg-zinc-800/80 p-0.5 border border-zinc-700/60 text-xs">
            <button
              onClick={() => setDisplayMode('degrees')}
              className={`px-2 py-1 rounded-md transition ${
                displayMode === 'degrees' ? 'bg-indigo-600 text-white font-medium' : 'text-zinc-400'
              }`}
            >
              Degrees
            </button>
            <button
              onClick={() => setDisplayMode('notes')}
              className={`px-2 py-1 rounded-md transition ${
                displayMode === 'notes' ? 'bg-indigo-600 text-white font-medium' : 'text-zinc-400'
              }`}
            >
              Notes
            </button>
            <button
              onClick={() => setDisplayMode('intervals')}
              className={`px-2 py-1 rounded-md transition ${
                displayMode === 'intervals' ? 'bg-indigo-600 text-white font-medium' : 'text-zinc-400'
              }`}
            >
              Intervals
            </button>
          </div>

          {/* Fret Count */}
          <div className="flex items-center rounded-lg bg-zinc-800/80 p-0.5 border border-zinc-700/60 text-xs">
            <button
              onClick={() => setFretCount(12)}
              className={`px-2 py-1 rounded-md transition ${
                fretCount === 12 ? 'bg-zinc-700 text-white' : 'text-zinc-400'
              }`}
            >
              12 Frets
            </button>
            <button
              onClick={() => setFretCount(15)}
              className={`px-2 py-1 rounded-md transition ${
                fretCount === 15 ? 'bg-zinc-700 text-white' : 'text-zinc-400'
              }`}
            >
              15 Frets
            </button>
            <button
              onClick={() => setFretCount(24)}
              className={`px-2 py-1 rounded-md transition ${
                fretCount === 24 ? 'bg-zinc-700 text-white' : 'text-zinc-400'
              }`}
            >
              24 Frets
            </button>
          </div>
        </div>
      </div>

      {/* Fretboard SVG / HTML Layout */}
      <div className="mt-4 overflow-x-auto pb-4 pt-1">
        <div
          className="relative mx-auto rounded-xl border border-amber-950/40 bg-gradient-to-r from-amber-950/80 via-zinc-900 to-amber-950/60 shadow-2xl p-3"
          style={{ minWidth: `${(fretCount + 1) * 55}px` }}
        >
          {/* Fret Number Header Row */}
          <div className="flex w-full mb-1">
            <div className="w-14 text-center text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
              Nut (0)
            </div>
            {Array.from({ length: fretCount }).map((_, fIdx) => (
              <div
                key={`fret-num-${fIdx + 1}`}
                className="flex-1 text-center text-[10px] font-semibold text-zinc-400"
              >
                {fIdx + 1}
              </div>
            ))}
          </div>

          {/* Strings & Frets Grid */}
          <div className="relative border-l-4 border-zinc-200 bg-zinc-950/60 rounded-r-md">
            {currentTuning.strings.map((str, stringIdx) => {
              // String thickness based on string index
              const stringThickness = Math.max(1.5, (stringIdx + 1) * 0.7);

              return (
                <div
                  key={`string-${stringIdx}`}
                  className="relative flex items-center h-10 border-b border-zinc-800/70 last:border-b-0"
                >
                  {/* Metal string wire going across */}
                  <div
                    className="absolute left-0 right-0 z-0 bg-gradient-to-b from-zinc-300 via-zinc-400 to-zinc-600 shadow-sm"
                    style={{
                      height: `${stringThickness}px`,
                      top: '50%',
                      transform: 'translateY(-50%)',
                    }}
                  />

                  {/* Nut / Open String (Fret 0) */}
                  <div className="relative z-10 w-14 flex items-center justify-center border-r-4 border-zinc-300 bg-zinc-900/90 h-full">
                    {(() => {
                      const midi = str.midi;
                      const pc = (midi % 12);
                      const note = str.note;
                      const activeInfo = activePitchClassMap.get(pc);
                      const key = `${stringIdx}-0`;
                      const isSounding = activeFretKey === key;

                      let label = '';
                      if (activeInfo) {
                        if (displayMode === 'degrees') label = activeInfo.degree;
                        else if (displayMode === 'notes') label = note;
                        else label = INTERVAL_NAMES[activeInfo.interval]?.split(' ')?.[0] || `${activeInfo.interval}`;
                      }

                      return (
                        <button
                          onClick={() => handleFretClick(midi, stringIdx, 0)}
                          className={`flex items-center justify-center rounded-full transition-transform cursor-pointer ${
                            isSounding
                              ? 'scale-110 ring-4 ring-indigo-400'
                              : 'hover:scale-105'
                          } ${
                            activeInfo
                              ? activeInfo.isRoot
                                ? 'h-7 w-7 bg-amber-500 text-zinc-950 font-bold shadow-lg shadow-amber-500/50 ring-2 ring-amber-300'
                                : 'h-6 w-6 bg-indigo-600 text-white font-medium shadow-md shadow-indigo-600/40 ring-1 ring-indigo-400'
                              : 'h-5 w-5 bg-zinc-800/80 text-zinc-400 text-[10px]'
                          }`}
                          title={`Open ${note}${str.octave} (MIDI ${midi})`}
                        >
                          <span className="text-[10px] leading-none">
                            {activeInfo ? label : note}
                          </span>
                        </button>
                      );
                    })()}
                  </div>

                  {/* Frets 1 to fretCount */}
                  {Array.from({ length: fretCount }).map((_, fretIdx) => {
                    const fret = fretIdx + 1;
                    const midi = str.midi + fret;
                    const pc = (midi % 12);
                    const note = noteFromPitchClass(pc);
                    const activeInfo = activePitchClassMap.get(pc);
                    const key = `${stringIdx}-${fret}`;
                    const isSounding = activeFretKey === key;

                    let label = '';
                    if (activeInfo) {
                      if (displayMode === 'degrees') label = activeInfo.degree;
                      else if (displayMode === 'notes') label = note;
                      else label = INTERVAL_NAMES[activeInfo.interval]?.split(' ')?.[0] || `${activeInfo.interval}`;
                    }

                    return (
                      <div
                        key={`fret-${stringIdx}-${fret}`}
                        className="relative z-10 flex-1 flex items-center justify-center border-r-2 border-zinc-600/80 h-full hover:bg-white/5 transition"
                      >
                        {/* Fret marker dot background inlay */}
                        {stringIdx === Math.floor(currentTuning.strings.length / 2) && (
                          <>
                            {isFretMarker(fret) && (
                              <div className="absolute pointer-events-none h-3 w-3 rounded-full bg-zinc-500/20 shadow-inner" />
                            )}
                            {isDoubleFretMarker(fret) && (
                              <div className="absolute pointer-events-none flex gap-2">
                                <div className="h-2.5 w-2.5 rounded-full bg-zinc-400/30 shadow-inner" />
                                <div className="h-2.5 w-2.5 rounded-full bg-zinc-400/30 shadow-inner" />
                              </div>
                            )}
                          </>
                        )}

                        {/* Interactive Note Button if active, or subtle click target */}
                        {activeInfo ? (
                          <button
                            onClick={() => handleFretClick(midi, stringIdx, fret)}
                            className={`flex flex-col items-center justify-center rounded-full transition-all cursor-pointer z-20 ${
                              isSounding
                                ? 'scale-125 ring-4 ring-indigo-400'
                                : 'hover:scale-110'
                            } ${
                              activeInfo.isRoot
                                ? 'h-7 w-7 bg-amber-500 text-zinc-950 font-bold shadow-lg shadow-amber-500/50 ring-2 ring-amber-300'
                                : 'h-6 w-6 bg-indigo-600 text-white font-medium shadow-md shadow-indigo-600/30 ring-1 ring-indigo-400'
                            }`}
                            title={`Fret ${fret}: ${note} (${activeInfo.degree})`}
                          >
                            <span className="text-[10px] font-bold leading-tight">{label}</span>
                            <span className="text-[7px] opacity-75 leading-none">{note}</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleFretClick(midi, stringIdx, fret)}
                            className="h-full w-full flex items-center justify-center opacity-0 hover:opacity-100 transition cursor-pointer z-10"
                            title={`Fret ${fret}: ${note}`}
                          >
                            <span className="text-[9px] text-zinc-400 bg-zinc-800/90 rounded-full px-1.5 py-0.5">
                              {note}
                            </span>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
