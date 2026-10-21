import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Square,
  Sparkles,
  RefreshCw,
  Sliders,
  Volume2,
  BookOpen,
  ArrowRight,
  Lightbulb,
} from 'lucide-react';
import { NoteName, DiatonicChord } from '../types/music';
import { getDiatonicChords, noteToMidi } from '../utils/musicTheory';
import { audioSynth } from '../utils/audioSynth';

interface ChordProgressionPlayerProps {
  rootNote: NoteName;
  scaleId: string;
}

interface ProgressionPreset {
  id: string;
  name: string;
  genre: string;
  chords: string[]; // e.g. ["Dm7", "G7", "Cmaj7"]
  roman: string;
  explanation: string;
}

export const ChordProgressionPlayer: React.FC<ChordProgressionPlayerProps> = ({
  rootNote,
  scaleId,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(-1);
  const [bpm, setBpm] = useState<number>(100);
  const [selectedPresetId, setSelectedPresetId] = useState<string>('ii_V_I');
  const [reharmonizationData, setReharmonizationData] = useState<any | null>(null);
  const [isReharmonizing, setIsReharmonizing] = useState(false);

  const diatonicChords = getDiatonicChords(rootNote, scaleId);

  // Dynamic presets adapted to root
  const presets: ProgressionPreset[] = [
    {
      id: 'ii_V_I',
      name: 'Jazz ii - V - I Cadence',
      genre: 'Jazz / Bossa',
      chords: ['ii7', 'V7', 'Imaj7'],
      roman: 'ii7 → V7 → Imaj7',
      explanation: 'The holy grail of jazz voice leading. Tension created by tritone in V7 resolves into Imaj7.',
    },
    {
      id: 'I_V_vi_IV',
      name: 'Pop 4-Chord Progression',
      genre: 'Pop / Anthem',
      chords: ['I', 'V', 'vi', 'IV'],
      roman: 'I → V → vi → IV',
      explanation: 'The most famous chord progression in modern music history ("Don\'t Stop Believin\'", "Let It Be").',
    },
    {
      id: 'I_IV_V',
      name: 'Classic Blues & Rock Turnaround',
      genre: 'Blues / Rock',
      chords: ['I7', 'IV7', 'V7'],
      roman: 'I7 → IV7 → V7',
      explanation: 'The raw foundation of 12-bar blues and rock & roll with dominant 7th colors.',
    },
    {
      id: 'andalusian',
      name: 'Andalusian Flamenco Cadence',
      genre: 'Flamenco / Latin',
      chords: ['i', 'bVII', 'bVI', 'V'],
      roman: 'i → bVII → bVI → V',
      explanation: 'Iconic descending chromatic bassline used in flamenco, rock ("Hit the Road Jack"), and cinema.',
    },
    {
      id: 'neo_soul',
      name: 'Neo-Soul Extended 2-5-1',
      genre: 'Neo-Soul / R&B',
      chords: ['min9', '13', 'maj9'],
      roman: 'ii9 → V13 → Imaj9',
      explanation: 'Smooth cluster extensions (9ths and 13ths) favored by J Dilla, Robert Glasper, and D\'Angelo.',
    },
  ];

  const currentPreset = presets.find((p) => p.id === selectedPresetId) || presets[0];

  // Helper to map chord symbols to MIDI notes
  const resolveChordToMidis = (chordLabel: string): number[] => {
    // Basic root calculation based on diatonic index or roman
    const baseRootMidi = noteToMidi(rootNote, 3);

    if (chordLabel.includes('ii')) {
      const root = baseRootMidi + 2;
      return [root, root + 3, root + 7, root + 10]; // m7
    }
    if (chordLabel.includes('V') && !chordLabel.includes('IV') && !chordLabel.includes('VI') && !chordLabel.includes('bVII')) {
      const root = baseRootMidi + 7;
      return [root, root + 4, root + 7, root + 10]; // 7
    }
    if (chordLabel.includes('IV')) {
      const root = baseRootMidi + 5;
      return [root, root + 4, root + 7, root + 11]; // maj7
    }
    if (chordLabel.includes('vi')) {
      const root = baseRootMidi + 9;
      return [root, root + 3, root + 7, root + 10]; // m7
    }
    if (chordLabel.includes('bVII')) {
      const root = baseRootMidi + 10;
      return [root, root + 4, root + 7, root + 10];
    }
    if (chordLabel.includes('bVI')) {
      const root = baseRootMidi + 8;
      return [root, root + 4, root + 7, root + 11];
    }
    // Default I / tonic
    return [baseRootMidi, baseRootMidi + 4, baseRootMidi + 7, baseRootMidi + 11];
  };

  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (isPlaying) {
      const stepDurationMs = (60 / bpm) * 1000 * 2; // 2 beats per chord
      let step = 0;

      const runStep = () => {
        setCurrentStep(step);
        const chordName = currentPreset.chords[step];
        const midis = resolveChordToMidis(chordName);
        audioSynth.playChord(midis, 30, stepDurationMs / 1000);

        step = (step + 1) % currentPreset.chords.length;
      };

      runStep();
      timerRef.current = setInterval(runStep, stepDurationMs);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setCurrentStep(-1);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, selectedPresetId, bpm, rootNote]);

  const handlePlayPad = (chordLabel: string, index: number) => {
    setCurrentStep(index);
    const midis = resolveChordToMidis(chordLabel);
    audioSynth.playChord(midis, 35, 2.0);
    setTimeout(() => setCurrentStep(-1), 1000);
  };

  const handleRequestReharmonization = async () => {
    setIsReharmonizing(true);
    try {
      const res = await fetch('/api/reharmonize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: rootNote,
          progression: currentPreset.roman,
          genre: currentPreset.genre,
        }),
      });
      const data = await res.json();
      setReharmonizationData(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsReharmonizing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Diatonic Chords of Current Key/Scale */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 shadow-xl backdrop-blur-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-zinc-800">
          <div>
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-emerald-400" />
              <h3 className="text-base font-semibold text-white">Diatonic Harmonization</h3>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                {rootNote} Scale Chords
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Every chord naturally generated by stacking 3rds on the scale degrees.
            </p>
          </div>
        </div>

        {/* Diatonic Chord Grid Cards */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
          {diatonicChords.map((chord, idx) => (
            <button
              key={`diatonic-${idx}`}
              onClick={() => {
                const midis = chord.notes.map((n, i) => noteToMidi(n as NoteName, i === 0 ? 3 : 3));
                audioSynth.playChord(midis, 40, 2.0);
              }}
              className="flex flex-col items-center justify-between p-3 rounded-xl bg-zinc-800/80 hover:bg-zinc-700/80 border border-zinc-700/70 hover:border-indigo-500/60 transition shadow-md cursor-pointer group text-center"
            >
              <span className="text-xs font-bold text-indigo-400">{chord.degree}</span>
              <span className="text-lg font-extrabold text-white my-1 group-hover:scale-110 transition-transform">
                {chord.chordName}
              </span>
              <span className="text-[10px] text-zinc-400">
                {chord.notes.join(' - ')}
              </span>
              <span className={`text-[9px] mt-2 px-1.5 py-0.5 rounded-full ${
                chord.role === 'Tonic'
                  ? 'bg-indigo-500/20 text-indigo-300'
                  : chord.role === 'Dominant'
                  ? 'bg-amber-500/20 text-amber-300'
                  : 'bg-emerald-500/20 text-emerald-300'
              }`}>
                {chord.role}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Interactive Progression Sequencer */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 shadow-xl backdrop-blur-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-zinc-800">
          <div>
            <div className="flex items-center gap-2">
              <Sliders className="h-4 w-4 text-indigo-400" />
              <h3 className="text-base font-semibold text-white">Harmonic Progression Sequencer</h3>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Select presets, audition chord pads, or loop playback with dynamic tempo.
            </p>
          </div>

          {/* Controls: Preset, BPM, Play/Stop */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Preset Selector */}
            <select
              value={selectedPresetId}
              onChange={(e) => {
                setSelectedPresetId(e.target.value);
                setIsPlaying(false);
              }}
              className="rounded-lg bg-zinc-800 px-3 py-1.5 text-xs text-zinc-200 border border-zinc-700 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              {presets.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>

            {/* Tempo BPM slider */}
            <div className="flex items-center gap-2 rounded-lg bg-zinc-800/80 px-2.5 py-1 text-xs text-zinc-300 border border-zinc-700">
              <span>{bpm} BPM</span>
              <input
                type="range"
                min="60"
                max="180"
                value={bpm}
                onChange={(e) => setBpm(Number(e.target.value))}
                className="w-16 accent-indigo-500 cursor-pointer"
              />
            </div>

            {/* Play/Stop Loop Button */}
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-xs font-semibold shadow-md transition cursor-pointer ${
                isPlaying
                  ? 'bg-red-600 text-white hover:bg-red-500'
                  : 'bg-indigo-600 text-white hover:bg-indigo-500'
              }`}
            >
              {isPlaying ? (
                <>
                  <Square className="h-3.5 w-3.5 fill-current" />
                  <span>Stop Loop</span>
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5 fill-current" />
                  <span>Play Progression</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Preset Description & Theory Note */}
        <div className="mt-4 p-3 rounded-xl bg-zinc-800/40 border border-zinc-700/50 flex items-start gap-3">
          <Lightbulb className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-semibold text-white">{currentPreset.name}: </span>
            <span className="text-zinc-300">{currentPreset.explanation}</span>
          </div>
        </div>

        {/* Interactive Chord Sequencer Pads */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {currentPreset.chords.map((chordLabel, idx) => {
            const isStepActive = currentStep === idx;
            return (
              <button
                key={`pad-${idx}`}
                onClick={() => handlePlayPad(chordLabel, idx)}
                className={`relative flex flex-col items-center justify-center p-6 rounded-2xl border transition-all duration-150 cursor-pointer shadow-lg ${
                  isStepActive
                    ? 'bg-gradient-to-br from-indigo-600 to-violet-700 border-indigo-400 scale-105 shadow-indigo-500/30'
                    : 'bg-zinc-800/80 hover:bg-zinc-800 border-zinc-700 hover:border-zinc-500'
                }`}
              >
                <span className="text-[10px] font-semibold tracking-wider text-zinc-400 uppercase">
                  Step {idx + 1}
                </span>
                <span className="text-2xl font-black text-white mt-1">
                  {chordLabel}
                </span>
                <span className="text-xs text-zinc-300 mt-1 opacity-80">
                  {rootNote} Key
                </span>

                {isStepActive && (
                  <span className="absolute top-2 right-2 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* AI Reharmonization Section */}
        <div className="mt-6 pt-4 border-t border-zinc-800">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-400" />
              <span className="text-sm font-semibold text-white">
                Maestro AI Reharmonizer
              </span>
            </div>
            <button
              onClick={handleRequestReharmonization}
              disabled={isReharmonizing}
              className="flex items-center gap-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-1.5 text-xs font-medium transition cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isReharmonizing ? 'animate-spin' : ''}`} />
              <span>{isReharmonizing ? 'Analyzing Harmony...' : 'Generate 3 Jazz Reharmonizations'}</span>
            </button>
          </div>

          {/* Reharmonization Results */}
          {reharmonizationData && reharmonizationData.variations && (
            <div className="mt-4 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {reharmonizationData.variations.map((v: any, vIdx: number) => (
                  <div
                    key={`var-${vIdx}`}
                    className="p-3.5 rounded-xl bg-zinc-800/70 border border-zinc-700 flex flex-col justify-between"
                  >
                    <div>
                      <span className="text-xs font-bold text-amber-400">
                        {v.title}
                      </span>
                      <div className="flex flex-wrap items-center gap-1.5 my-2">
                        {v.chords?.map((c: string, ci: number) => (
                          <span
                            key={ci}
                            className="rounded-md bg-zinc-900 px-2 py-0.5 text-xs font-mono font-bold text-white border border-zinc-700"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                      <p className="text-xs text-zinc-300 leading-relaxed">
                        {v.explanation}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {reharmonizationData.theoryTip && (
                <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-800/40 text-xs text-indigo-200 flex items-start gap-2">
                  <Lightbulb className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                  <span><strong>Maestro Tip:</strong> {reharmonizationData.theoryTip}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
