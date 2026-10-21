import React, { useState } from 'react';
import {
  Music,
  Sparkles,
  Volume2,
  VolumeX,
  Bot,
  Image as ImageIcon,
  Layers,
  Search,
  Sliders,
  Play,
  RotateCcw,
} from 'lucide-react';
import { audioSynth } from '../utils/audioSynth';

interface NavbarProps {
  activeTab: 'visualizer' | 'progressions' | 'maestro' | 'artStudio';
  setActiveTab: (tab: 'visualizer' | 'progressions' | 'maestro' | 'artStudio') => void;
  onQuickSearch: (query: string) => void;
  isSearching: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onQuickSearch,
  isSearching,
}) => {
  const [searchInput, setSearchInput] = useState('');
  const [isMuted, setIsMuted] = useState(audioSynth.getIsMuted());
  const [volume, setVolume] = useState(audioSynth.getVolume());

  const handleMuteToggle = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    audioSynth.setMuted(nextMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    audioSynth.setVolume(val);
    if (isMuted && val > 0) {
      setIsMuted(false);
      audioSynth.setMuted(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      onQuickSearch(searchInput.trim());
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800 bg-zinc-950/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-amber-500 shadow-lg shadow-indigo-500/25">
            <Music className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-white">Harmonix</span>
              <span className="rounded-full bg-indigo-500/15 px-2 py-0.5 text-[10px] font-semibold text-indigo-400 border border-indigo-500/30">
                Studio
              </span>
            </div>
            <p className="hidden text-xs text-zinc-400 sm:block">
              Interactive Music Theory & Visualizer
            </p>
          </div>
        </div>

        {/* Quick Search / Natural Language Query */}
        <form
          onSubmit={handleSearchSubmit}
          className="relative flex-1 max-w-md min-w-[240px] order-3 md:order-2"
        >
          <div className="relative flex items-center">
            <Search className="pointer-events-none absolute left-3 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Ask anything (e.g. 'Dorian in D', 'C7#9 chord', 'F# Lydian')..."
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900/90 py-2 pl-9 pr-24 text-sm text-zinc-100 placeholder-zinc-500 shadow-inner focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <button
              type="submit"
              disabled={isSearching || !searchInput.trim()}
              className="absolute right-1.5 flex items-center gap-1 rounded-lg bg-indigo-600 px-2.5 py-1 text-xs font-medium text-white transition hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 cursor-pointer"
            >
              {isSearching ? (
                <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <Sparkles className="h-3.5 w-3.5" />
              )}
              <span>{isSearching ? 'Parsing...' : 'Visualize'}</span>
            </button>
          </div>
        </form>

        {/* Navigation Tabs & Audio Controls */}
        <div className="flex items-center gap-2 sm:gap-4 order-2 md:order-3">
          {/* Navigation Pill Tabs */}
          <nav className="flex items-center rounded-xl bg-zinc-900/90 p-1 border border-zinc-800 text-xs font-medium">
            <button
              onClick={() => setActiveTab('visualizer')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition ${
                activeTab === 'visualizer'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Music className="h-3.5 w-3.5" />
              <span>Visualizer</span>
            </button>

            <button
              onClick={() => setActiveTab('progressions')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition ${
                activeTab === 'progressions'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Progressions</span>
              <span className="sm:hidden">Chords</span>
            </button>

            <button
              onClick={() => setActiveTab('maestro')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition ${
                activeTab === 'maestro'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Bot className="h-3.5 w-3.5 text-amber-400" />
              <span>Maestro AI</span>
            </button>

            <button
              onClick={() => setActiveTab('artStudio')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition ${
                activeTab === 'artStudio'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <ImageIcon className="h-3.5 w-3.5 text-pink-400" />
              <span className="hidden sm:inline">Art & Poster</span>
              <span className="sm:hidden">Art</span>
            </button>
          </nav>

          {/* Audio Sound Controls */}
          <div className="hidden sm:flex items-center gap-2 rounded-xl bg-zinc-900/90 px-3 py-1.5 border border-zinc-800">
            <button
              onClick={handleMuteToggle}
              title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
              className="text-zinc-400 hover:text-white transition"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="h-4 w-4 text-red-400" />
              ) : (
                <Volume2 className="h-4 w-4 text-emerald-400" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              title={`Volume: ${Math.round(volume * 100)}%`}
              className="w-16 accent-indigo-500 cursor-pointer h-1.5 bg-zinc-700 rounded-lg"
            />
          </div>
        </div>
      </div>
    </header>
  );
};
