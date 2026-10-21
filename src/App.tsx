import React, { useState, useMemo } from 'react';
import {
  Music,
  Layers,
  Bot,
  Image as ImageIcon,
  Sliders,
  Sparkles,
  Info,
  Play,
  RotateCcw,
  Check,
  Volume2,
  Guitar,
  Compass,
} from 'lucide-react';
import { NoteName, ScaleDefinition, ChordDefinition } from './types/music';
import {
  CHROMATIC_NOTES,
  SCALES,
  CHORDS,
  getScaleNotes,
  getChordNotes,
  noteToMidi,
  INTERVAL_NAMES,
} from './utils/musicTheory';
import { audioSynth } from './utils/audioSynth';
import { Navbar } from './components/Navbar';
import { PianoVisualizer } from './components/PianoVisualizer';
import { FretboardVisualizer } from './components/FretboardVisualizer';
import { CircleOfFifths } from './components/CircleOfFifths';
import { ChordProgressionPlayer } from './components/ChordProgressionPlayer';
import { MaestroChat } from './components/MaestroChat';
import { ArtStudio } from './components/ArtStudio';

export default function App() {
  const [activeTab, setActiveTab] = useState<'visualizer' | 'progressions' | 'maestro' | 'artStudio'>('visualizer');

  // Core visualizer state
  const [selectedRoot, setSelectedRoot] = useState<NoteName>('C');
  const [visualizerMode, setVisualizerMode] = useState<'scale' | 'chord'>('scale');
  const [selectedScaleId, setSelectedScaleId] = useState<string>('major');
  const [selectedChordId, setSelectedChordId] = useState<string>('maj7');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchNotification, setSearchNotification] = useState<string | null>(null);

  // Active scale and chord definition objects
  const activeScale = useMemo(() => {
    return SCALES.find((s) => s.id === selectedScaleId) || SCALES[0];
  }, [selectedScaleId]);

  const activeChord = useMemo(() => {
    return CHORDS.find((c) => c.id === selectedChordId) || CHORDS[0];
  }, [selectedChordId]);

  // Calculated active notes
  const activeNotes = useMemo(() => {
    if (visualizerMode === 'scale') {
      return getScaleNotes(selectedRoot, activeScale);
    } else {
      return getChordNotes(selectedRoot, activeChord);
    }
  }, [visualizerMode, selectedRoot, activeScale, activeChord]);

  // Categories available
  const scaleCategories = ['all', 'Major Modes', 'Melodic Minor Modes', 'Harmonic Minor Modes', 'Pentatonic & Blues', 'Symmetric & Exotic'];
  const chordCategories = ['all', 'Triads', 'Seventh Chords', 'Extended Chords', 'Altered & Suspended'];

  const filteredScales = useMemo(() => {
    if (selectedCategory === 'all') return SCALES;
    return SCALES.filter((s) => s.category === selectedCategory);
  }, [selectedCategory]);

  const filteredChords = useMemo(() => {
    if (selectedCategory === 'all') return CHORDS;
    return CHORDS.filter((c) => c.category === selectedCategory);
  }, [selectedCategory]);

  // Handle Natural Language query parsing
  const handleQuickSearch = async (query: string) => {
    setIsSearching(true);
    setSearchNotification(null);
    try {
      const res = await fetch('/api/parse-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();

      if (data && data.root) {
        // Set root
        setSelectedRoot(data.root as NoteName);

        if (data.type === 'scale') {
          setVisualizerMode('scale');
          const matchedScale = SCALES.find(
            (s) =>
              s.name.toLowerCase().includes(data.name.toLowerCase()) ||
              data.name.toLowerCase().includes(s.name.toLowerCase())
          );
          if (matchedScale) {
            setSelectedScaleId(matchedScale.id);
          }
        } else {
          setVisualizerMode('chord');
          const matchedChord = CHORDS.find(
            (c) =>
              c.id.toLowerCase() === data.name.toLowerCase() ||
              c.name.toLowerCase().includes(data.name.toLowerCase()) ||
              c.symbol.toLowerCase() === data.name.toLowerCase()
          );
          if (matchedChord) {
            setSelectedChordId(matchedChord.id);
          }
        }

        // Notification and switch to visualizer
        setActiveTab('visualizer');
        setSearchNotification(data.explanation || `Visualizing ${data.root} ${data.name}`);

        // Quick audio preview
        const rootMidi = noteToMidi(data.root as NoteName, 3);
        audioSynth.playChord([rootMidi, rootMidi + 4, rootMidi + 7], 30, 1.5);

        setTimeout(() => setSearchNotification(null), 6000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSearching(false);
    }
  };

  // Callback when Maestro AI chat outputs an interactive visualize tag
  const handleApplyVisualizationFromChat = (
    type: 'scale' | 'chord',
    root: NoteName,
    name: string
  ) => {
    setSelectedRoot(root);
    if (type === 'scale') {
      setVisualizerMode('scale');
      const found = SCALES.find(
        (s) =>
          s.name.toLowerCase().includes(name.toLowerCase()) ||
          name.toLowerCase().includes(s.name.toLowerCase())
      );
      if (found) setSelectedScaleId(found.id);
    } else {
      setVisualizerMode('chord');
      const found = CHORDS.find(
        (c) =>
          c.id.toLowerCase() === name.toLowerCase() ||
          c.name.toLowerCase().includes(name.toLowerCase()) ||
          c.symbol.toLowerCase() === name.toLowerCase()
      );
      if (found) setSelectedChordId(found.id);
    }

    setActiveTab('visualizer');
    setSearchNotification(`Applied ${root} ${name} from Maestro AI recommendation!`);

    // Play preview
    const baseMidi = noteToMidi(root, 3);
    audioSynth.playChord([baseMidi, baseMidi + 4, baseMidi + 7], 30, 1.5);
    setTimeout(() => setSearchNotification(null), 5000);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onQuickSearch={handleQuickSearch}
        isSearching={isSearching}
      />

      {/* Search result toast notification */}
      {searchNotification && (
        <div className="sticky top-16 z-30 mx-auto mt-2 max-w-xl px-4 w-full">
          <div className="flex items-center justify-between rounded-xl bg-indigo-950/95 border border-indigo-500/50 p-3 shadow-2xl backdrop-blur-md">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-400 shrink-0" />
              <span className="text-xs text-indigo-100 font-medium">
                {searchNotification}
              </span>
            </div>
            <button
              onClick={() => setSearchNotification(null)}
              className="text-xs text-indigo-300 hover:text-white px-2 py-0.5 rounded cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 py-6">
        {/* TAB 1: VISUALIZER STUDIO */}
        {activeTab === 'visualizer' && (
          <div className="space-y-6">
            {/* Control Dashboard: Root Note Picker & Scale/Chord Selector */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 shadow-xl backdrop-blur-sm">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-zinc-800">
                {/* Mode Switcher: Scales vs Chords */}
                <div className="flex items-center rounded-xl bg-zinc-950 p-1 border border-zinc-800">
                  <button
                    onClick={() => {
                      setVisualizerMode('scale');
                      setSelectedCategory('all');
                    }}
                    className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition cursor-pointer ${
                      visualizerMode === 'scale'
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <Music className="h-3.5 w-3.5" />
                    <span>Scales & Modes</span>
                  </button>
                  <button
                    onClick={() => {
                      setVisualizerMode('chord');
                      setSelectedCategory('all');
                    }}
                    className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition cursor-pointer ${
                      visualizerMode === 'chord'
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <Layers className="h-3.5 w-3.5" />
                    <span>Chords & Voicings</span>
                  </button>
                </div>

                {/* Current Active Selection Summary */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-400">Current Focus:</span>
                  <div className="flex items-center gap-1.5 rounded-xl bg-zinc-800/90 px-3 py-1.5 border border-zinc-700">
                    <span className="text-sm font-extrabold text-amber-400">{selectedRoot}</span>
                    <span className="text-sm font-bold text-white">
                      {visualizerMode === 'scale' ? activeScale.name : activeChord.name}
                    </span>
                  </div>
                </div>
              </div>

              {/* Root Note Selector (12 Chromatic Pitches) */}
              <div className="mt-4">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-2">
                  Root Key / Tonic:
                </span>
                <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5">
                  {CHROMATIC_NOTES.map((note) => {
                    const isSelected = selectedRoot === note;
                    return (
                      <button
                        key={note}
                        onClick={() => {
                          setSelectedRoot(note);
                          const midi = noteToMidi(note, 3);
                          audioSynth.playNote(midi, 0.8, 0.8);
                        }}
                        className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl border text-xs font-extrabold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-amber-500 border-amber-300 text-zinc-950 shadow-lg shadow-amber-500/25 ring-2 ring-amber-300 scale-105'
                            : 'bg-zinc-800/80 border-zinc-700/80 text-zinc-300 hover:bg-zinc-700 hover:text-white'
                        }`}
                      >
                        <span className="text-sm">{note}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Category Filter Chips */}
              <div className="mt-4 flex flex-wrap items-center gap-1.5">
                <span className="text-xs font-semibold text-zinc-400 mr-1">Category:</span>
                {(visualizerMode === 'scale' ? scaleCategories : chordCategories).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-medium transition cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-zinc-800/80 text-zinc-400 hover:text-zinc-200 border border-zinc-700/60'
                    }`}
                  >
                    {cat === 'all' ? 'All' : cat}
                  </button>
                ))}
              </div>

              {/* Items Grid: Scales or Chords selection */}
              <div className="mt-4 max-h-48 overflow-y-auto pr-1">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                  {visualizerMode === 'scale'
                    ? filteredScales.map((scale) => {
                        const isSelected = selectedScaleId === scale.id;
                        return (
                          <button
                            key={scale.id}
                            onClick={() => setSelectedScaleId(scale.id)}
                            className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                              isSelected
                                ? 'bg-indigo-600/30 border-indigo-400 shadow-md ring-1 ring-indigo-400'
                                : 'bg-zinc-800/50 border-zinc-700/70 hover:bg-zinc-800 text-zinc-300'
                            }`}
                          >
                            <span className="text-xs font-bold text-white truncate">
                              {scale.name}
                            </span>
                            <span className="text-[10px] text-zinc-400 mt-1 line-clamp-1">
                              {scale.mood}
                            </span>
                          </button>
                        );
                      })
                    : filteredChords.map((chord) => {
                        const isSelected = selectedChordId === chord.id;
                        return (
                          <button
                            key={chord.id}
                            onClick={() => setSelectedChordId(chord.id)}
                            className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                              isSelected
                                ? 'bg-indigo-600/30 border-indigo-400 shadow-md ring-1 ring-indigo-400'
                                : 'bg-zinc-800/50 border-zinc-700/70 hover:bg-zinc-800 text-zinc-300'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-white truncate">
                                {chord.name}
                              </span>
                              {chord.symbol && (
                                <span className="text-[10px] font-mono text-amber-400 font-bold ml-1">
                                  {chord.symbol}
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-zinc-400 mt-1 line-clamp-1">
                              {chord.usage}
                            </span>
                          </button>
                        );
                      })}
                </div>
              </div>
            </div>

            {/* Scale / Chord Details Info Banner */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 backdrop-blur-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                  <Info className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-extrabold text-white">
                      {selectedRoot}{' '}
                      {visualizerMode === 'scale' ? activeScale.name : activeChord.name}
                    </h2>
                    <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-zinc-300 border border-zinc-700">
                      {visualizerMode === 'scale' ? activeScale.category : activeChord.category}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-300 mt-0.5 max-w-2xl">
                    {visualizerMode === 'scale' ? activeScale.description : activeChord.description}
                  </p>
                  {visualizerMode === 'scale' && activeScale.famousUse && (
                    <p className="text-[11px] text-amber-400/90 mt-1">
                      <strong>Famous examples:</strong> {activeScale.famousUse}
                    </p>
                  )}
                </div>
              </div>

              {/* Quick Action: Ask Maestro about this */}
              <button
                onClick={() => {
                  setActiveTab('maestro');
                }}
                className="flex items-center gap-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 px-3.5 py-2 text-xs font-medium transition cursor-pointer shrink-0"
              >
                <Bot className="h-4 w-4 text-amber-400" />
                <span>Discuss with Maestro</span>
              </button>
            </div>

            {/* 1. Piano Visualizer */}
            <PianoVisualizer
              rootNote={selectedRoot}
              activeNotes={activeNotes}
              isChordMode={visualizerMode === 'chord'}
              name={visualizerMode === 'scale' ? activeScale.name : activeChord.name}
            />

            {/* 2. Fretboard Visualizer */}
            <FretboardVisualizer
              rootNote={selectedRoot}
              activeNotes={activeNotes}
              name={visualizerMode === 'scale' ? activeScale.name : activeChord.name}
            />

            {/* 3. Bottom Row: Circle of Fifths & Harmonic Intervals Card */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Circle of Fifths */}
              <CircleOfFifths
                currentRoot={selectedRoot}
                onSelectRoot={(r) => setSelectedRoot(r)}
              />

              {/* Scale & Interval Analysis Card */}
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 shadow-xl backdrop-blur-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-4">
                    <div className="flex items-center gap-2">
                      <Music className="h-4 w-4 text-amber-400" />
                      <h3 className="text-base font-semibold text-white">Interval & Formula Analysis</h3>
                    </div>
                    <span className="text-xs font-mono text-zinc-400">
                      {activeNotes.length} Notes Total
                    </span>
                  </div>

                  {/* Note Chips with Intervals */}
                  <div className="space-y-2.5">
                    {activeNotes.map((item, idx) => {
                      const isRoot = item.note === selectedRoot || item.interval === 0;
                      const intervalLabel = INTERVAL_NAMES[item.interval] || `${item.interval} semitones`;
                      return (
                        <div
                          key={idx}
                          className={`flex items-center justify-between p-2.5 rounded-xl border transition ${
                            isRoot
                              ? 'bg-amber-500/10 border-amber-500/40'
                              : 'bg-zinc-800/40 border-zinc-700/60'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-black ${
                                isRoot
                                  ? 'bg-amber-500 text-zinc-950'
                                  : 'bg-indigo-600 text-white'
                              }`}
                            >
                              {item.degree}
                            </span>
                            <div>
                              <span className="text-sm font-bold text-white mr-2">{item.note}</span>
                              <span className="text-xs text-zinc-400">{intervalLabel}</span>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              const midi = noteToMidi(item.note, 3);
                              audioSynth.playNote(midi, 1.0, 0.85);
                            }}
                            className="flex items-center gap-1 rounded-lg bg-zinc-800 px-2.5 py-1 text-xs text-zinc-300 hover:text-white transition cursor-pointer"
                          >
                            <Play className="h-3 w-3 fill-current" />
                            <span>Audition</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Quick Link to Poster Studio */}
                <div className="mt-5 pt-3 border-t border-zinc-800 flex items-center justify-between">
                  <span className="text-xs text-zinc-400">
                    Want an artistic visual diagram of this {visualizerMode}?
                  </span>
                  <button
                    onClick={() => setActiveTab('artStudio')}
                    className="flex items-center gap-1.5 text-xs font-semibold text-pink-400 hover:text-pink-300 transition cursor-pointer"
                  >
                    <ImageIcon className="h-3.5 w-3.5" />
                    <span>Generate Artwork</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PROGRESSIONS SEQUENCER */}
        {activeTab === 'progressions' && (
          <ChordProgressionPlayer
            rootNote={selectedRoot}
            scaleId={selectedScaleId}
          />
        )}

        {/* TAB 3: MAESTRO AI CHAT */}
        {activeTab === 'maestro' && (
          <MaestroChat
            onApplyVisualization={handleApplyVisualizationFromChat}
          />
        )}

        {/* TAB 4: ART & POSTER STUDIO */}
        {activeTab === 'artStudio' && (
          <ArtStudio
            currentRoot={selectedRoot}
            currentScaleOrChordName={
              visualizerMode === 'scale' ? activeScale.name : activeChord.name
            }
            isChordMode={visualizerMode === 'chord'}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950 py-4 text-center text-xs text-zinc-500">
        <p>
          Harmonix Studio • Built with Web Audio API, Gemini 3 & 4 Multimodal Intelligence, and High-Resolution Visualization Engine.
        </p>
      </footer>
    </div>
  );
}
