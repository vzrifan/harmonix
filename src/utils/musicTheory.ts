import {
  NoteName,
  PitchClass,
  ScaleDefinition,
  ChordDefinition,
  DiatonicChord,
  TuningOption,
  KeySignatureInfo,
} from '../types/music';

export const CHROMATIC_NOTES: NoteName[] = [
  'C',
  'C#',
  'D',
  'D#',
  'E',
  'F',
  'F#',
  'G',
  'G#',
  'A',
  'A#',
  'B',
];

export const ENHARMONIC_MAP: Record<string, NoteName> = {
  Db: 'C#',
  Eb: 'D#',
  Gb: 'F#',
  Ab: 'G#',
  Bb: 'A#',
};

export const REVERSE_ENHARMONIC: Record<NoteName, string> = {
  C: 'C',
  'C#': 'Db',
  D: 'D',
  'D#': 'Eb',
  E: 'E',
  F: 'F',
  'F#': 'Gb',
  G: 'G',
  'G#': 'Ab',
  A: 'A',
  'A#': 'Bb',
  B: 'B',
  Db: 'C#',
  Eb: 'D#',
  Gb: 'F#',
  Ab: 'G#',
  Bb: 'A#',
};

export const INTERVAL_NAMES: Record<number, string> = {
  0: 'Root (P1)',
  1: 'Minor 2nd (m2)',
  2: 'Major 2nd (M2)',
  3: 'Minor 3rd (m3)',
  4: 'Major 3rd (M3)',
  5: 'Perfect 4th (P4)',
  6: 'Tritone (b5 / #4)',
  7: 'Perfect 5th (P5)',
  8: 'Minor 6th (m6)',
  9: 'Major 6th (M6)',
  10: 'Minor 7th (m7)',
  11: 'Major 7th (M7)',
  12: 'Octave (P8)',
  13: 'Minor 9th (b9)',
  14: 'Major 9th (9)',
  15: 'Augmented 9th (#9)',
  17: 'Perfect 11th (11)',
  18: 'Augmented 11th (#11)',
  20: 'Minor 13th (b13)',
  21: 'Major 13th (13)',
};

export function getPitchClass(note: string): PitchClass {
  const normalized = ENHARMONIC_MAP[note] || note;
  const idx = CHROMATIC_NOTES.indexOf(normalized as NoteName);
  return (idx !== -1 ? idx : 0) as PitchClass;
}

export function noteFromPitchClass(pc: number): NoteName {
  const norm = ((pc % 12) + 12) % 12;
  return CHROMATIC_NOTES[norm];
}

export function noteToMidi(note: string, octave: number): number {
  const pc = getPitchClass(note);
  return (octave + 1) * 12 + pc;
}

export function midiToFrequency(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

// ----------------------------------------------------------------------
// Scale Definitions
// ----------------------------------------------------------------------
export const SCALES: ScaleDefinition[] = [
  // Major Modes
  {
    id: 'major',
    name: 'Major / Ionian',
    category: 'Major Modes',
    intervals: [0, 2, 4, 5, 7, 9, 11],
    degreeLabels: ['1', '2', '3', '4', '5', '6', '7'],
    mood: 'Bright, joyful, foundational, resolved',
    description: 'The foundation of Western harmony. Diatonic scale with no altered degrees.',
    famousUse: '"Let It Be" (The Beatles), "Ode to Joy" (Beethoven)',
  },
  {
    id: 'dorian',
    name: 'Dorian',
    category: 'Major Modes',
    intervals: [0, 2, 3, 5, 7, 9, 10],
    degreeLabels: ['1', '2', 'b3', '4', '5', '6', 'b7'],
    mood: 'Soulful, funky, melancholic yet hopeful',
    description: 'Minor scale with a raised natural 6th. Eliminates the darkness of natural minor.',
    famousUse: '"So What" (Miles Davis), "Oye Como Va" (Santana), "Mad World"',
  },
  {
    id: 'phrygian',
    name: 'Phrygian',
    category: 'Major Modes',
    intervals: [0, 1, 3, 5, 7, 8, 10],
    degreeLabels: ['1', 'b2', 'b3', '4', '5', 'b6', 'b7'],
    mood: 'Dark, tense, Spanish flamenco, ancient mystery',
    description: 'Characterized by the intense tension of the half-step minor 2nd (b2).',
    famousUse: 'Flamenco guitar, Metallica ("Wherever I May Roam"), Hip Hop basslines',
  },
  {
    id: 'lydian',
    name: 'Lydian',
    category: 'Major Modes',
    intervals: [0, 2, 4, 6, 7, 9, 11],
    degreeLabels: ['1', '2', '3', '#4', '5', '6', '7'],
    mood: 'Dreamy, ethereal, futuristic, wonder and awe',
    description: 'Major scale with a raised 4th (#4/tritone). Highly favored in film scoring.',
    famousUse: '"The Simpsons" theme, John Williams (E.T., Star Wars), Joe Satriani ("Flying in a Blue Dream")',
  },
  {
    id: 'mixolydian',
    name: 'Mixolydian',
    category: 'Major Modes',
    intervals: [0, 2, 4, 5, 7, 9, 10],
    degreeLabels: ['1', '2', '3', '4', '5', '6', 'b7'],
    mood: 'Bluesy, upbeat rock, swagger, triumphant',
    description: 'Major scale with a flat 7th (b7). The bedrock of rock and roll, blues, and Celtic folk.',
    famousUse: '"Sweet Home Alabama" (Lynyrd Skynyrd), "Norwegian Wood" (Beatles), Grateful Dead',
  },
  {
    id: 'natural_minor',
    name: 'Natural Minor / Aeolian',
    category: 'Major Modes',
    intervals: [0, 2, 3, 5, 7, 8, 10],
    degreeLabels: ['1', '2', 'b3', '4', '5', 'b6', 'b7'],
    mood: 'Sad, dramatic, reflective, gothic',
    description: 'The natural minor scale; relative minor of the major scale.',
    famousUse: '"Stairway to Heaven" (Led Zeppelin), "Losing My Religion" (R.E.M.)',
  },
  {
    id: 'locrian',
    name: 'Locrian',
    category: 'Major Modes',
    intervals: [0, 1, 3, 5, 6, 8, 10],
    degreeLabels: ['1', 'b2', 'b3', '4', 'b5', 'b6', 'b7'],
    mood: 'Unstable, unresolved, eerie, discordant',
    description: 'Built on the 7th degree of major. Features a diminished fifth (b5), denying a stable tonic.',
    famousUse: 'Heavy Metal riffs, Björk ("Army of Me"), Rush ("YYZ" intro)',
  },

  // Harmonic & Melodic Minor Modes
  {
    id: 'harmonic_minor',
    name: 'Harmonic Minor',
    category: 'Harmonic Minor Modes',
    intervals: [0, 2, 3, 5, 7, 8, 11],
    degreeLabels: ['1', '2', 'b3', '4', '5', 'b6', '7'],
    mood: 'Exotic, dramatic, neoclassical, Middle Eastern aura',
    description: 'Features an augmented 2nd interval between b6 and the natural leading tone 7.',
    famousUse: 'Yngwie Malmsteen neoclassical solos, traditional tango, Saint-Saëns "Danse Macabre"',
  },
  {
    id: 'phrygian_dominant',
    name: 'Phrygian Dominant',
    category: 'Harmonic Minor Modes',
    intervals: [0, 1, 4, 5, 7, 8, 10],
    degreeLabels: ['1', 'b2', '3', '4', '5', 'b6', 'b7'],
    mood: 'Flamenco, dramatic Spanish Jewish klezmer tension',
    description: 'The 5th mode of Harmonic Minor. Superb over dominant 7b9 chords.',
    famousUse: '"Misirlou" (Dick Dale / Pulp Fiction), Dream Theater, Flamenco Bulerías',
  },
  {
    id: 'melodic_minor',
    name: 'Melodic Minor',
    category: 'Melodic Minor Modes',
    intervals: [0, 2, 3, 5, 7, 9, 11],
    degreeLabels: ['1', '2', 'b3', '4', '5', '6', '7'],
    mood: 'Sophisticated, modern jazz, luminous and poignant',
    description: 'Minor 3rd with all other degrees major. The holy grail of modern jazz harmony.',
    famousUse: 'Bill Evans, Wayne Shorter, Pat Metheny',
  },
  {
    id: 'lydian_dominant',
    name: 'Lydian Dominant',
    category: 'Melodic Minor Modes',
    intervals: [0, 2, 4, 6, 7, 9, 10],
    degreeLabels: ['1', '2', '3', '#4', '5', '6', 'b7'],
    mood: 'Punchy, sparkling dominant tension, modern fusion',
    description: 'The 4th mode of Melodic Minor. Ideal over 7#11 non-resolving dominant chords.',
    famousUse: '"The Simpsons" theme riffs, Steely Dan, Allan Holdsworth',
  },
  {
    id: 'altered',
    name: 'Altered / Super Locrian',
    category: 'Melodic Minor Modes',
    intervals: [0, 1, 3, 4, 6, 8, 10],
    degreeLabels: ['1', 'b2', '#2/b3', '3/b4', 'b5', '#5', 'b7'],
    mood: 'Maximum chromatic tension, explosive resolution',
    description: 'The 7th mode of Melodic Minor. Every non-root tone is altered (b9, #9, b5, #5).',
    famousUse: 'John Coltrane, Chick Corea, modern post-bop dominant V7 substitutions',
  },

  // Pentatonic & Blues
  {
    id: 'major_pentatonic',
    name: 'Major Pentatonic',
    category: 'Pentatonic & Blues',
    intervals: [0, 2, 4, 7, 9],
    degreeLabels: ['1', '2', '3', '5', '6'],
    mood: 'Pure, uplifting, sweet, universal melody',
    description: 'Five-note scale without half steps. Found in folk music across every continent.',
    famousUse: '"My Girl" (The Temptations), Bobby McFerrin, Eric Clapton solos',
  },
  {
    id: 'minor_pentatonic',
    name: 'Minor Pentatonic',
    category: 'Pentatonic & Blues',
    intervals: [0, 3, 5, 7, 10],
    degreeLabels: ['1', 'b3', '4', '5', 'b7'],
    mood: 'Gritty, iconic, soulful, blues-rock foundation',
    description: 'The definitive rock and blues scale. Impossible to play a bad note.',
    famousUse: 'Led Zeppelin, Jimi Hendrix, Stevie Ray Vaughan, B.B. King',
  },
  {
    id: 'blues',
    name: 'Blues',
    category: 'Pentatonic & Blues',
    intervals: [0, 3, 5, 6, 7, 10],
    degreeLabels: ['1', 'b3', '4', 'b5', '5', 'b7'],
    mood: 'Raw emotion, sorrow and triumph, gut-wrenching',
    description: 'Minor pentatonic plus the expressive chromatic "blue note" (diminished 5th / b5).',
    famousUse: 'Muddy Waters, The Rolling Stones, AC/DC',
  },

  // Symmetric & Exotic
  {
    id: 'whole_tone',
    name: 'Whole Tone',
    category: 'Symmetric & Exotic',
    intervals: [0, 2, 4, 6, 8, 10],
    degreeLabels: ['1', '2', '3', '#4', '#5', 'b7'],
    mood: 'Dreamlike, weightless, floating, Debussy impressionism',
    description: 'Composed entirely of whole steps (2 semitones). Perfectly symmetrical with no tonic center.',
    famousUse: 'Claude Debussy ("Voiles"), Stevie Wonder ("You Are the Sunshine of My Life" intro)',
  },
  {
    id: 'half_whole_dim',
    name: 'Half-Whole Diminished',
    category: 'Symmetric & Exotic',
    intervals: [0, 1, 3, 4, 6, 7, 9, 10],
    degreeLabels: ['1', 'b2', '#2', '3', '#4', '5', '6', 'b7'],
    mood: 'Intricate jazz dominant, dark symmetry',
    description: 'Alternates half-step and whole-step. Great over 7b9 or 13b9 chords.',
    famousUse: 'Thelonious Monk, Herbie Hancock',
  },
  {
    id: 'bebop_dominant',
    name: 'Bebop Dominant',
    category: 'Symmetric & Exotic',
    intervals: [0, 2, 4, 5, 7, 9, 10, 11],
    degreeLabels: ['1', '2', '3', '4', '5', '6', 'b7', '7'],
    mood: 'Fast swing, continuous 8th note jazz motion',
    description: 'Mixolydian with an added passing major 7th between b7 and root for metric alignment.',
    famousUse: 'Charlie Parker, Dizzy Gillespie',
  },
  {
    id: 'hirajoshi',
    name: 'Japanese Hirajoshi',
    category: 'Symmetric & Exotic',
    intervals: [0, 2, 3, 7, 8],
    degreeLabels: ['1', '2', 'b3', '5', 'b6'],
    mood: 'Meditative, koto aesthetic, cinematic Japanese landscape',
    description: 'Traditional pentatonic scale derived from the Shamisen and Koto.',
    famousUse: 'Marty Friedman, anime film soundtracks, Toru Takemitsu',
  },
];

// ----------------------------------------------------------------------
// Chord Definitions
// ----------------------------------------------------------------------
export const CHORDS: ChordDefinition[] = [
  // Triads
  {
    id: 'maj',
    name: 'Major Triad',
    symbol: '',
    category: 'Triads',
    intervals: [0, 4, 7],
    degreeLabels: ['1', '3', '5'],
    description: 'Root, Major 3rd, Perfect 5th. Stable and consonant.',
    usage: 'Tonic in major keys, foundational pop/rock harmony.',
  },
  {
    id: 'min',
    name: 'Minor Triad',
    symbol: 'm',
    category: 'Triads',
    intervals: [0, 3, 7],
    degreeLabels: ['1', 'b3', '5'],
    description: 'Root, Minor 3rd, Perfect 5th. Melancholic and introspective.',
    usage: 'Tonic in minor keys, emotional ballads.',
  },
  {
    id: 'dim',
    name: 'Diminished Triad',
    symbol: '°',
    category: 'Triads',
    intervals: [0, 3, 6],
    degreeLabels: ['1', 'b3', 'b5'],
    description: 'Root, Minor 3rd, Diminished 5th (tritone). Highly unstable.',
    usage: 'vii° leading tone chord, passing chromatic harmony.',
  },
  {
    id: 'aug',
    name: 'Augmented Triad',
    symbol: '+',
    category: 'Triads',
    intervals: [0, 4, 8],
    degreeLabels: ['1', '3', '#5'],
    description: 'Root, Major 3rd, Augmented 5th. Suspended floating tension.',
    usage: 'Dominant expansion, transitional suspense.',
  },
  {
    id: 'sus4',
    name: 'Suspended 4th',
    symbol: 'sus4',
    category: 'Altered & Suspended',
    intervals: [0, 5, 7],
    degreeLabels: ['1', '4', '5'],
    description: 'Replaces the 3rd with a Perfect 4th, yearning for resolution.',
    usage: 'Iconic pop/rock delay before resolving to major triad.',
  },
  {
    id: 'sus2',
    name: 'Suspended 2nd',
    symbol: 'sus2',
    category: 'Altered & Suspended',
    intervals: [0, 2, 7],
    degreeLabels: ['1', '2', '5'],
    description: 'Replaces the 3rd with a Major 2nd. Open and modern ambient sound.',
    usage: 'Acoustic fingerpicking, modern indie/alternative.',
  },

  // 7th Chords
  {
    id: 'maj7',
    name: 'Major 7th',
    symbol: 'maj7',
    category: 'Seventh Chords',
    intervals: [0, 4, 7, 11],
    degreeLabels: ['1', '3', '5', '7'],
    description: 'Lush, warm, velvety, romantic jazz/bossa nova chord.',
    usage: 'Imaj7 and IVmaj7 in major keys, neo-soul, lo-fi hip hop.',
  },
  {
    id: 'min7',
    name: 'Minor 7th',
    symbol: 'm7',
    category: 'Seventh Chords',
    intervals: [0, 3, 7, 10],
    degreeLabels: ['1', 'b3', '5', 'b7'],
    description: 'Smooth, mellow, soulful, cool jazz staple.',
    usage: 'ii7 and vi7 in major keys, i7 in Dorian/Aeolian grooves.',
  },
  {
    id: '7',
    name: 'Dominant 7th',
    symbol: '7',
    category: 'Seventh Chords',
    intervals: [0, 4, 7, 10],
    degreeLabels: ['1', '3', '5', 'b7'],
    description: 'Contains a tritone between 3 and b7, driving dynamic resolution.',
    usage: 'V7 resolving to I, the engine of blues, funk, and classical cadences.',
  },
  {
    id: 'm7b5',
    name: 'Half-Diminished / Minor 7b5',
    symbol: 'm7b5',
    category: 'Seventh Chords',
    intervals: [0, 3, 6, 10],
    degreeLabels: ['1', 'b3', 'b5', 'b7'],
    description: 'Haunting, poignant, tragic and unresolved.',
    usage: 'iiø7 in minor key ii-V-i jazz progressions.',
  },
  {
    id: 'dim7',
    name: 'Full Diminished 7th',
    symbol: '°7',
    category: 'Seventh Chords',
    intervals: [0, 3, 6, 9],
    degreeLabels: ['1', 'b3', 'b5', 'bb7'],
    description: 'Symmetrical stack of minor 3rds. Extreme gothic suspense.',
    usage: 'Passing chromatic diminished chord, classical horror/tension.',
  },

  // Extended & Altered Chords
  {
    id: 'maj9',
    name: 'Major 9th',
    symbol: 'maj9',
    category: 'Extended Chords',
    intervals: [0, 4, 7, 11, 14],
    degreeLabels: ['1', '3', '5', '7', '9'],
    description: 'Shimmering, sparkling, expansive harmonic beauty.',
    usage: 'Modern R&B, jazz ballad openings, dreamy intro chords.',
  },
  {
    id: 'min9',
    name: 'Minor 9th',
    symbol: 'm9',
    category: 'Extended Chords',
    intervals: [0, 3, 7, 10, 14],
    degreeLabels: ['1', 'b3', '5', 'b7', '9'],
    description: 'Deeply emotive, nocturnal, stylish, neo-soul gold standard.',
    usage: 'J Dilla, Erykah Badu, Robert Glasper, modern jazz.',
  },
  {
    id: '9',
    name: 'Dominant 9th',
    symbol: '9',
    category: 'Extended Chords',
    intervals: [0, 4, 7, 10, 14],
    degreeLabels: ['1', '3', '5', 'b7', '9'],
    description: 'Funky, rich, expressive blues and gospel dominant.',
    usage: 'James Brown funk vamps, classic blues solos.',
  },
  {
    id: '7b9',
    name: 'Dominant 7 (b9)',
    symbol: '7(b9)',
    category: 'Altered & Suspended',
    intervals: [0, 4, 7, 10, 13],
    degreeLabels: ['1', '3', '5', 'b7', 'b9'],
    description: 'Dark, classical and flamenco dominant leading into minor tonic.',
    usage: 'V7b9 -> i minor cadence, intense drama.',
  },
  {
    id: '7#9',
    name: 'Hendrix Chord (7#9)',
    symbol: '7(#9)',
    category: 'Altered & Suspended',
    intervals: [0, 4, 7, 10, 15],
    degreeLabels: ['1', '3', '5', 'b7', '#9'],
    description: 'Biting clash between major 3rd and sharp 9 (enharmonic minor 3rd).',
    usage: '"Purple Haze" (Jimi Hendrix), Stevie Ray Vaughan, jazz fusion.',
  },
  {
    id: 'min11',
    name: 'Minor 11th',
    symbol: 'm11',
    category: 'Extended Chords',
    intervals: [0, 3, 7, 10, 14, 17],
    degreeLabels: ['1', 'b3', '5', 'b7', '9', '11'],
    description: 'Spacious, modal, atmospheric chord with open stacked fourths.',
    usage: 'McCoy Tyner modal jazz piano, ambient synthesis.',
  },
  {
    id: '13',
    name: 'Dominant 13th',
    symbol: '13',
    category: 'Extended Chords',
    intervals: [0, 4, 7, 10, 14, 21],
    degreeLabels: ['1', '3', '5', 'b7', '9', '13'],
    description: 'Full-bodied, bright, definitive big band and bebop turnaround.',
    usage: 'Final cadence chord in swing and jazz standards.',
  },
];

// ----------------------------------------------------------------------
// Notes Calculation & Spelling Helpers
// ----------------------------------------------------------------------
export function getScaleNotes(root: NoteName, scale: ScaleDefinition): { note: NoteName; degree: string; interval: number }[] {
  const rootPc = getPitchClass(root);
  return scale.intervals.map((semitones, idx) => {
    const pc = (rootPc + semitones) % 12;
    const note = CHROMATIC_NOTES[pc];
    const degree = scale.degreeLabels[idx] || `${idx + 1}`;
    return { note, degree, interval: semitones };
  });
}

export function getChordNotes(root: NoteName, chord: ChordDefinition): { note: NoteName; degree: string; interval: number }[] {
  const rootPc = getPitchClass(root);
  return chord.intervals.map((semitones, idx) => {
    const pc = (rootPc + semitones) % 12;
    const note = CHROMATIC_NOTES[pc];
    const degree = chord.degreeLabels[idx] || `${idx + 1}`;
    return { note, degree, interval: semitones };
  });
}

// ----------------------------------------------------------------------
// Diatonic Chords of a Scale (Harmonizing Scales)
// ----------------------------------------------------------------------
export function getDiatonicChords(root: NoteName, scaleId: string): DiatonicChord[] {
  const scale = SCALES.find((s) => s.id === scaleId) || SCALES[0];
  const rootPc = getPitchClass(root);

  // If major scale
  if (scaleId === 'major') {
    const degrees = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'];
    const chordTypes = ['maj7', 'min7', 'min7', 'maj7', '7', 'min7', 'm7b5'];
    const roles: DiatonicChord['role'][] = ['Tonic', 'Subdominant', 'Tonic', 'Subdominant', 'Dominant', 'Tonic', 'Dominant'];

    return degrees.map((deg, i) => {
      const cRootPc = (rootPc + scale.intervals[i]) % 12;
      const cRoot = CHROMATIC_NOTES[cRootPc];
      const cType = chordTypes[i];
      const chordDef = CHORDS.find((c) => c.id === cType) || CHORDS[0];
      const chordNotes = getChordNotes(cRoot, chordDef).map((n) => n.note);
      return {
        degree: deg,
        root: cRoot,
        chordName: `${cRoot}${chordDef.symbol}`,
        notes: chordNotes,
        role: roles[i],
      };
    });
  }

  // If natural minor
  if (scaleId === 'natural_minor') {
    const degrees = ['i', 'ii°', 'III', 'iv', 'v', 'VI', 'VII'];
    const chordTypes = ['min7', 'm7b5', 'maj7', 'min7', 'min7', 'maj7', '7'];
    const roles: DiatonicChord['role'][] = ['Tonic', 'Subdominant', 'Tonic', 'Subdominant', 'Dominant', 'Subdominant', 'Subdominant'];

    return degrees.map((deg, i) => {
      const cRootPc = (rootPc + scale.intervals[i]) % 12;
      const cRoot = CHROMATIC_NOTES[cRootPc];
      const cType = chordTypes[i];
      const chordDef = CHORDS.find((c) => c.id === cType) || CHORDS[0];
      const chordNotes = getChordNotes(cRoot, chordDef).map((n) => n.note);
      return {
        degree: deg,
        root: cRoot,
        chordName: `${cRoot}${chordDef.symbol}`,
        notes: chordNotes,
        role: roles[i],
      };
    });
  }

  // Generic diatonic chord generator for any 7-note mode
  if (scale.intervals.length === 7) {
    const romanNumerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];
    return scale.intervals.map((intv, idx) => {
      const cRootPc = (rootPc + intv) % 12;
      const cRoot = CHROMATIC_NOTES[cRootPc];
      // 1, 3, 5, 7 relative to scale
      const thirdInt = (scale.intervals[(idx + 2) % 7] - intv + 12) % 12;
      const fifthInt = (scale.intervals[(idx + 4) % 7] - intv + 12) % 12;
      const seventhInt = (scale.intervals[(idx + 6) % 7] - intv + 12) % 12;

      let chordSymbol = '';
      let isMinor = thirdInt === 3;
      if (isMinor) {
        if (fifthInt === 6) {
          chordSymbol = seventhInt === 10 ? 'm7b5' : '°';
        } else {
          chordSymbol = seventhInt === 11 ? 'm(maj7)' : 'm7';
        }
      } else {
        if (fifthInt === 8) {
          chordSymbol = '+';
        } else if (seventhInt === 10) {
          chordSymbol = '7';
        } else {
          chordSymbol = 'maj7';
        }
      }

      const degLabel = isMinor ? romanNumerals[idx].toLowerCase() : romanNumerals[idx];
      return {
        degree: degLabel,
        root: cRoot,
        chordName: `${cRoot}${chordSymbol}`,
        notes: [
          cRoot,
          CHROMATIC_NOTES[(cRootPc + thirdInt) % 12],
          CHROMATIC_NOTES[(cRootPc + fifthInt) % 12],
          CHROMATIC_NOTES[(cRootPc + seventhInt) % 12],
        ],
        role: idx === 0 ? 'Tonic' : idx === 4 ? 'Dominant' : 'Subdominant',
      };
    });
  }

  return [];
}

// ----------------------------------------------------------------------
// Tuning & Fretboard Setup
// ----------------------------------------------------------------------
export const TUNINGS: TuningOption[] = [
  {
    id: 'guitar_standard',
    name: 'Guitar (Standard EADGBE)',
    instrument: 'guitar',
    strings: [
      { note: 'E', octave: 4, midi: 64 }, // String 1 (high E)
      { note: 'B', octave: 3, midi: 59 }, // String 2
      { note: 'G', octave: 3, midi: 55 }, // String 3
      { note: 'D', octave: 3, midi: 50 }, // String 4
      { note: 'A', octave: 2, midi: 45 }, // String 5
      { note: 'E', octave: 2, midi: 40 }, // String 6 (low E)
    ],
  },
  {
    id: 'guitar_drop_d',
    name: 'Guitar (Drop D)',
    instrument: 'guitar',
    strings: [
      { note: 'E', octave: 4, midi: 64 },
      { note: 'B', octave: 3, midi: 59 },
      { note: 'G', octave: 3, midi: 55 },
      { note: 'D', octave: 3, midi: 50 },
      { note: 'A', octave: 2, midi: 45 },
      { note: 'D', octave: 2, midi: 38 },
    ],
  },
  {
    id: 'guitar_dadgad',
    name: 'Guitar (DADGAD - Celtic / Modal)',
    instrument: 'guitar',
    strings: [
      { note: 'D', octave: 4, midi: 62 },
      { note: 'A', octave: 3, midi: 57 },
      { note: 'G', octave: 3, midi: 55 },
      { note: 'D', octave: 3, midi: 50 },
      { note: 'A', octave: 2, midi: 45 },
      { note: 'D', octave: 2, midi: 38 },
    ],
  },
  {
    id: 'bass_standard',
    name: 'Bass (Standard 4-String EADG)',
    instrument: 'bass',
    strings: [
      { note: 'G', octave: 2, midi: 43 },
      { note: 'D', octave: 2, midi: 38 },
      { note: 'A', octave: 1, midi: 33 },
      { note: 'E', octave: 1, midi: 28 },
    ],
  },
];

// ----------------------------------------------------------------------
// Circle of Fifths Data
// ----------------------------------------------------------------------
export const CIRCLE_OF_FIFTHS: KeySignatureInfo[] = [
  { key: 'C', relativeMinor: 'A', accidentals: 0, accidentalSymbols: [], angle: 0 },
  { key: 'G', relativeMinor: 'E', accidentals: 1, accidentalSymbols: ['F#'], angle: 30 },
  { key: 'D', relativeMinor: 'B', accidentals: 2, accidentalSymbols: ['F#', 'C#'], angle: 60 },
  { key: 'A', relativeMinor: 'F#', accidentals: 3, accidentalSymbols: ['F#', 'C#', 'G#'], angle: 90 },
  { key: 'E', relativeMinor: 'C#', accidentals: 4, accidentalSymbols: ['F#', 'C#', 'G#', 'D#'], angle: 120 },
  { key: 'B', relativeMinor: 'G#', accidentals: 5, accidentalSymbols: ['F#', 'C#', 'G#', 'D#', 'A#'], angle: 150 },
  { key: 'F#', relativeMinor: 'D#', accidentals: 6, accidentalSymbols: ['F#', 'C#', 'G#', 'D#', 'A#', 'E#'], angle: 180 },
  { key: 'Db', relativeMinor: 'Bb', accidentals: -5, accidentalSymbols: ['Bb', 'Eb', 'Ab', 'Db', 'Gb'], angle: 210 },
  { key: 'Ab', relativeMinor: 'F', accidentals: -4, accidentalSymbols: ['Bb', 'Eb', 'Ab', 'Db'], angle: 240 },
  { key: 'Eb', relativeMinor: 'C', accidentals: -3, accidentalSymbols: ['Bb', 'Eb', 'Ab'], angle: 270 },
  { key: 'Bb', relativeMinor: 'G', accidentals: -2, accidentalSymbols: ['Bb', 'Eb'], angle: 300 },
  { key: 'F', relativeMinor: 'D', accidentals: -1, accidentalSymbols: ['Bb'], angle: 330 },
];
