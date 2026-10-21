export type NoteName =
  | 'C'
  | 'C#'
  | 'Db'
  | 'D'
  | 'D#'
  | 'Eb'
  | 'E'
  | 'F'
  | 'F#'
  | 'Gb'
  | 'G'
  | 'G#'
  | 'Ab'
  | 'A'
  | 'A#'
  | 'Bb'
  | 'B';

export type PitchClass = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;

export interface ScaleDefinition {
  id: string;
  name: string;
  category: 'Major Modes' | 'Melodic Minor Modes' | 'Harmonic Minor Modes' | 'Pentatonic & Blues' | 'Symmetric & Exotic';
  intervals: number[]; // semitone offsets from root
  degreeLabels: string[]; // e.g. ["1", "2", "3", "4", "5", "6", "7"]
  mood: string;
  description: string;
  famousUse: string;
}

export interface ChordDefinition {
  id: string;
  name: string;
  symbol: string;
  category: 'Triads' | 'Seventh Chords' | 'Extended Chords' | 'Altered & Suspended';
  intervals: number[];
  degreeLabels: string[];
  description: string;
  usage: string;
}

export interface DiatonicChord {
  degree: string; // Roman numeral, e.g. "I", "ii", "V7"
  root: string;
  chordName: string;
  notes: string[];
  role: 'Tonic' | 'Subdominant' | 'Dominant' | 'Leading Tone';
}

export interface FretboardPosition {
  stringIndex: number;
  fret: number;
  note: string;
  pitchClass: PitchClass;
  octave: number;
  isRoot: boolean;
  degreeLabel: string;
  intervalName: string;
}

export interface TuningOption {
  id: string;
  name: string;
  instrument: 'guitar' | 'bass';
  strings: { note: NoteName; octave: number; midi: number }[];
}

export interface KeySignatureInfo {
  key: NoteName;
  relativeMinor: NoteName;
  accidentals: number; // positive for sharps, negative for flats
  accidentalSymbols: string[];
  angle: number; // in degrees for circular SVG (0 at top for C)
}
