import React, { useState } from 'react';
import { Play, Music, Sparkles, Volume2, ArrowUpDown } from 'lucide-react';
import { NoteName } from '../types/music';
import {
  CHROMATIC_NOTES,
  getPitchClass,
  noteToMidi,
  INTERVAL_NAMES,
} from '../utils/musicTheory';
import { audioSynth } from '../utils/audioSynth';

interface PianoVisualizerProps {
  rootNote: NoteName;
  activeNotes: { note: NoteName; degree: string; interval: number }[];
  isChordMode: boolean;
  name: string;
}

export const PianoVisualizer: React.FC<PianoVisualizerProps> = ({
  rootNote,
  activeNotes,
  isChordMode,
  name,
}) => {
  const [octaveCount, setOctaveCount] = useState<2 | 3>(2);
  const [displayMode, setDisplayMode] = useState<'notes' | 'degrees' | 'intervals'>('degrees');
  const [activeMidi, setActiveMidi] = useState<number | null>(null);
  const [isPlayingArpeggio, setIsPlayingArpeggio] = useState(false);

  const startOctave = 3; // Start at C3
  const totalOctaves = octaveCount;

  // Build active pitch class map for rapid lookup
  const activePitchClassMap = new Map<number, { degree: string; interval: number; isRoot: boolean }>();
  activeNotes.forEach((item) => {
    const pc = getPitchClass(item.note);
    activePitchClassMap.set(pc, {
      degree: item.degree,
      interval: item.interval,
      isRoot: item.note === rootNote || item.interval === 0,
    });
  });

  // Generate piano keys for the selected octaves
  interface KeyData {
    note: NoteName;
    octave: number;
    midi: number;
    isBlack: boolean;
    pc: number;
    activeInfo?: { degree: string; interval: number; isRoot: boolean };
  }

  const whiteKeys: KeyData[] = [];
  const blackKeys: { key: KeyData; whiteIndexBefore: number }[] = [];

  let currentWhiteIdx = 0;

  for (let oct = startOctave; oct < startOctave + totalOctaves; oct++) {
    for (let pc = 0; pc < 12; pc++) {
      const noteName = CHROMATIC_NOTES[pc];
      const midi = noteToMidi(noteName, oct);
      const isBlack = [1, 3, 6, 8, 10].includes(pc);
      const activeInfo = activePitchClassMap.get(pc);

      const keyData: KeyData = {
        note: noteName,
        octave: oct,
        midi,
        isBlack,
        pc,
        activeInfo,
      };

      if (!isBlack) {
        whiteKeys.push(keyData);
        currentWhiteIdx++;
      } else {
        // Position relative to preceding white key
        blackKeys.push({
          key: keyData,
          whiteIndexBefore: currentWhiteIdx - 1,
        });
      }
    }
  }

  const handleKeyClick = (midi: number) => {
    setActiveMidi(midi);
    audioSynth.playNote(midi, 1.2, 0.85);
    setTimeout(() => {
      setActiveMidi((prev) => (prev === midi ? null : prev));
    }, 400);
  };

  const handlePlayArpeggio = () => {
    if (isPlayingArpeggio) return;
    setIsPlayingArpeggio(true);

    // Collect active midi notes across the first octave or two
    const midisToPlay: number[] = [];
    // Play root from startOctave up through scale
    activeNotes.forEach((item) => {
      const semitones = item.interval;
      const baseMidi = noteToMidi(rootNote, startOctave);
      midisToPlay.push(baseMidi + semitones);
    });

    // Add octave if scale
    if (!isChordMode && midisToPlay.length > 0) {
      midisToPlay.push(midisToPlay[0] + 12);
    }

    audioSynth.playScaleArpeggio(midisToPlay, 130, (currentMidi) => {
      setActiveMidi(currentMidi);
    });

    const totalDurationMs = midisToPlay.length * 2 * (60 / 130 / 2) * 1000 + 400;
    setTimeout(() => {
      setIsPlayingArpeggio(false);
      setActiveMidi(null);
    }, totalDurationMs);
  };

  const handlePlayChord = (strum: boolean = false) => {
    const chordMidis: number[] = [];
    const baseMidi = noteToMidi(rootNote, startOctave);
    activeNotes.forEach((item) => {
      chordMidis.push(baseMidi + item.interval);
    });

    audioSynth.playChord(chordMidis, strum ? 45 : 0, 2.5);

    // Briefly highlight all active chord notes
    chordMidis.forEach((m) => setActiveMidi(m));
    setTimeout(() => setActiveMidi(null), 1000);
  };

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 shadow-xl backdrop-blur-sm">
      {/* Header and Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-indigo-500 animate-pulse" />
            <h3 className="text-base font-semibold text-white">Piano Keyboard Visualizer</h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
              {rootNote} {name}
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Interactive keys with harmonic labels. Click any key to audition.
          </p>
        </div>

        {/* View mode & Octave toggle */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Label Display Mode */}
          <div className="flex items-center rounded-lg bg-zinc-800/80 p-0.5 border border-zinc-700/60 text-xs">
            <button
              onClick={() => setDisplayMode('degrees')}
              className={`px-2.5 py-1 rounded-md transition ${
                displayMode === 'degrees' ? 'bg-indigo-600 text-white font-medium' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Degrees (1, b3)
            </button>
            <button
              onClick={() => setDisplayMode('notes')}
              className={`px-2.5 py-1 rounded-md transition ${
                displayMode === 'notes' ? 'bg-indigo-600 text-white font-medium' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Notes (C, D#)
            </button>
            <button
              onClick={() => setDisplayMode('intervals')}
              className={`px-2.5 py-1 rounded-md transition ${
                displayMode === 'intervals' ? 'bg-indigo-600 text-white font-medium' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Intervals (m3, P5)
            </button>
          </div>

          {/* Octave Range */}
          <div className="flex items-center rounded-lg bg-zinc-800/80 p-0.5 border border-zinc-700/60 text-xs">
            <button
              onClick={() => setOctaveCount(2)}
              className={`px-2 py-1 rounded-md transition ${
                octaveCount === 2 ? 'bg-zinc-700 text-white font-medium' : 'text-zinc-400'
              }`}
            >
              2 Octaves
            </button>
            <button
              onClick={() => setOctaveCount(3)}
              className={`px-2 py-1 rounded-md transition ${
                octaveCount === 3 ? 'bg-zinc-700 text-white font-medium' : 'text-zinc-400'
              }`}
            >
              3 Octaves
            </button>
          </div>

          {/* Audio Action Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePlayArpeggio}
              disabled={isPlayingArpeggio}
              className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 transition cursor-pointer disabled:opacity-50"
              title="Play scale or arpeggio ascending and descending"
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              <span>{isPlayingArpeggio ? 'Playing...' : 'Arpeggio'}</span>
            </button>

            {isChordMode ? (
              <>
                <button
                  onClick={() => handlePlayChord(false)}
                  className="flex items-center gap-1 rounded-lg bg-zinc-800 px-2.5 py-1.5 text-xs font-medium text-zinc-200 hover:bg-zinc-700 transition border border-zinc-700 cursor-pointer"
                  title="Play block chord simultaneously"
                >
                  <Music className="h-3 w-3 text-amber-400" />
                  <span>Block</span>
                </button>
                <button
                  onClick={() => handlePlayChord(true)}
                  className="flex items-center gap-1 rounded-lg bg-zinc-800 px-2.5 py-1.5 text-xs font-medium text-zinc-200 hover:bg-zinc-700 transition border border-zinc-700 cursor-pointer"
                  title="Play rolled chord strum"
                >
                  <ArrowUpDown className="h-3 w-3 text-violet-400" />
                  <span>Strum</span>
                </button>
              </>
            ) : null}
          </div>
        </div>
      </div>

      {/* Piano Keyboard Graphic */}
      <div className="mt-4 overflow-x-auto pb-2 pt-1">
        <div
          className="relative mx-auto select-none rounded-b-xl border-t-8 border-zinc-950 bg-zinc-950 shadow-2xl p-2"
          style={{ width: `${whiteKeys.length * 42}px`, minWidth: '100%' }}
        >
          {/* White Keys Row */}
          <div className="flex w-full">
            {whiteKeys.map((wk, idx) => {
              const isSounding = activeMidi === wk.midi;
              const hasActive = !!wk.activeInfo;
              const isRoot = wk.activeInfo?.isRoot;

              let label = '';
              if (hasActive && wk.activeInfo) {
                if (displayMode === 'degrees') label = wk.activeInfo.degree;
                else if (displayMode === 'notes') label = wk.note;
                else label = INTERVAL_NAMES[wk.activeInfo.interval]?.split(' ')?.[0] || `${wk.activeInfo.interval}`;
              }

              return (
                <button
                  key={`white-${wk.midi}`}
                  onClick={() => handleKeyClick(wk.midi)}
                  className={`group relative flex h-48 w-full flex-col justify-end items-center rounded-b-lg border-r border-zinc-300 pb-3 transition-all duration-75 cursor-pointer select-none ${
                    isSounding
                      ? 'bg-indigo-300 shadow-inner scale-[0.99] translate-y-0.5'
                      : hasActive
                      ? isRoot
                        ? 'bg-amber-100 hover:bg-amber-200'
                        : 'bg-indigo-50/90 hover:bg-indigo-100'
                      : 'bg-gradient-to-b from-zinc-100 to-white hover:bg-zinc-100'
                  }`}
                  style={{ minWidth: '40px' }}
                >
                  {/* Note marker badge */}
                  {hasActive && (
                    <div
                      className={`flex flex-col items-center justify-center rounded-full px-1.5 py-1 shadow-md transition ${
                        isRoot
                          ? 'bg-amber-500 text-zinc-950 font-bold ring-2 ring-amber-300'
                          : 'bg-indigo-600 text-white font-medium ring-1 ring-indigo-400'
                      }`}
                    >
                      <span className="text-[11px] leading-tight">{label}</span>
                      <span className="text-[9px] opacity-75 font-normal">{wk.note}</span>
                    </div>
                  )}

                  {/* Octave indicator on C keys */}
                  {wk.pc === 0 && (
                    <span className="absolute bottom-1 text-[9px] font-bold text-zinc-400">
                      C{wk.octave}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Black Keys Layer */}
          <div className="pointer-events-none absolute left-2 top-2 h-32 w-full">
            {blackKeys.map(({ key: bk, whiteIndexBefore }) => {
              const whiteKeyWidthPercent = 100 / whiteKeys.length;
              // Center the black key right on the seam between white keys
              const leftOffsetPercent = (whiteIndexBefore + 1) * whiteKeyWidthPercent;
              const isSounding = activeMidi === bk.midi;
              const hasActive = !!bk.activeInfo;
              const isRoot = bk.activeInfo?.isRoot;

              let label = '';
              if (hasActive && bk.activeInfo) {
                if (displayMode === 'degrees') label = bk.activeInfo.degree;
                else if (displayMode === 'notes') label = bk.note;
                else label = INTERVAL_NAMES[bk.activeInfo.interval]?.split(' ')?.[0] || `${bk.activeInfo.interval}`;
              }

              return (
                <button
                  key={`black-${bk.midi}`}
                  onClick={() => handleKeyClick(bk.midi)}
                  className={`pointer-events-auto absolute flex h-28 -translate-x-1/2 flex-col justify-end items-center rounded-b-md border-x border-b pb-2 shadow-xl transition-all duration-75 cursor-pointer ${
                    isSounding
                      ? 'bg-indigo-700 border-indigo-400 scale-[0.99] translate-y-0.5'
                      : hasActive
                      ? isRoot
                        ? 'bg-amber-600 border-amber-400 text-zinc-950 ring-2 ring-amber-400/80'
                        : 'bg-indigo-800 border-indigo-500 text-white ring-1 ring-indigo-400'
                      : 'bg-gradient-to-b from-zinc-800 to-zinc-950 border-zinc-700 hover:bg-zinc-800'
                  }`}
                  style={{
                    left: `${leftOffsetPercent}%`,
                    width: '26px',
                  }}
                >
                  {hasActive && (
                    <div
                      className={`flex flex-col items-center justify-center rounded-full px-1 py-0.5 text-center shadow-md ${
                        isRoot
                          ? 'bg-amber-400 text-zinc-950 font-bold ring-1 ring-white'
                          : 'bg-indigo-500 text-white font-medium'
                      }`}
                    >
                      <span className="text-[10px] leading-tight">{label}</span>
                      <span className="text-[8px] opacity-80">{bk.note}</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Active Formula Bar / Interval Breakdown */}
      <div className="mt-4 flex flex-wrap items-center gap-2 pt-3 border-t border-zinc-800/80">
        <span className="text-xs font-semibold text-zinc-400">Formula Tones:</span>
        <div className="flex flex-wrap items-center gap-1.5">
          {activeNotes.map((item, idx) => (
            <div
              key={idx}
              className={`flex items-center gap-1 rounded-lg px-2 py-0.5 text-xs ${
                item.note === rootNote
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold'
                  : 'bg-zinc-800/80 text-zinc-200 border border-zinc-700'
              }`}
            >
              <span className="font-bold text-white">{item.note}</span>
              <span className="text-[10px] text-zinc-400">({item.degree})</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
