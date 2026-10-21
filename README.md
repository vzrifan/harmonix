# Harmonix 🎵 — Interactive Music Theory & Scale Visualizer

> **Harmonix** adalah aplikasi teori musik interaktif mutakhir yang memvisualisasikan tangga nada (scales), akor (chords), fingering gitar/bass, tuts piano, dan Lingkaran Nada (Circle of Fifths) secara real-time, dilengkapi dengan asisten teori musik multi-turn **Gemini AI** dan studio pembuat poster musik beresolusi tinggi (1K, 2K, 4K).

---

## 🌟 Fitur Utama (Key Features)

### 🎹 1. Studio Visualisasi Interaktif
- **Piano Keyboard Interaktif**:
  - Pilihan rentang 2 hingga 3 oktaf (C3–B5) dengan audio synthesizer polifonik real-time berbasis **Web Audio API**.
  - Penandaan akurat untuk **Tonic/Root**, derajat tangga nada (*Scale Degrees: 1, b3, 5, b7*), nama nada, dan interval.
  - Fitur pemutaran tangga nada (*Ascending/Descending Arpeggio*) dan penyembunyian/pembunyian akor (*Block Chord & Strum*).
- **Fretboard Gitar & Bass**:
  - Mendukung instrumen gitar 6 senar (Standard EADGBE, Drop D, DADGAD) dan bass 4 senar.
  - Rentang 12, 15, atau 24 fret dengan penanda inlay fret standar.
  - Setiap fret dapat diklik untuk mendengarkan nada secara langsung.
- **Circle of Fifths (Lingkaran Nada Interaktif)**:
  - Roda SVG interaktif dengan 12 tangga nada mayor dan minor relatif.
  - Penanda fungsi harmonik (*Tonic, Subdominant IV, Dominant V*).
  - Informasi tanda kunci (*key signature: jumlah kres/mol*).
- **Pustaka Skala & Akor Terlengkap**:
  - Major Modes (Ionian, Dorian, Phrygian, Lydian, Mixolydian, Aeolian, Locrian).
  - Melodic Minor Modes (Altered Scale, Lydian Dominant).
  - Harmonic Minor Modes (Phrygian Dominant).
  - Pentatonik, Blues, Whole Tone, Diminished, Hirajoshi, dan berbagai akor (*triad, 7th, 9th, 11th, 13th, altered dominants*).

---

### 🎼 2. Harmonization & Progression Sequencer
- **Diatonik Harmonizer**: Menampilkan seluruh akor diatonis yang dihasilkan dari tangga nada aktif beserta perannya (*Tonic, Subdominant, Dominant*).
- **Interactive Progression Player**: Pemutar progresi akor dengan kontrol tempo BPM (*Jazz ii-V-I, Pop 4-Chord, Andalusian Cadence, Blues Turnaround, Neo-Soul 2-5-1*).
- **AI Reharmonization**: Menganalisis progresi akor dan memberikan 3 variasi reharmonisasi jazz/modal (*Tritone substitution, modal interchange*) menggunakan Gemini AI.

---

### 🤖 3. Maestro AI (Multi-Turn Chatbot)
- Percakapan multi-turn yang mengingat konteks riwayat percakapan.
- **Pilihan Model Cerdas**:
  - `gemini-4-argon`: Untuk penalaran teori musik tingkat tinggi, counterpoint, negative harmony, dan voice leading kompleks.
  - `gemini-3.8-flash`: Untuk pemahaman teori musik umum, progresi akor, dan panduan aransemen.
  - `gemini-3.1-flash-lite`: Untuk pencarian cepat formula tangga nada dan interval.
- **Karakter Spesifik**: Conservatory Professor, Jazz Improvisation Coach, atau Songwriting Mentor.
- **Interaksi Langsung ke Visualizer**: Rekomendasi akor/skala dalam percakapan memiliki tombol aksi interaktif untuk langsung memuat dan membunyikan nada pada visualizer.

---

### 🎨 4. Art & Poster Studio (High-Resolution Visualizer)
- Menghasilkan infografis artistik, poster musik klasik/vintage, diagram geometri sakral, dan visualizer synthesizer menggunakan model **`gemini-3-pro-image-preview`**.
- **Pilihan Resolusi Gambar**:
  - **1K** (1024px) — Standar
  - **2K** (2048px) — Definisi tinggi
  - **4K** (4096px) — Resolusi ultra halus untuk cetak poster
- Pilihan Rasio Aspek: `1:1`, `16:9`, `4:3`, `3:4`, `9:16`.
- Dilengkapi galeri hasil render, pratinjau lightbox layar penuh, dan fitur unduh langsung (.png).

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons, Motion.
- **Audio Engine**: Web Audio API (Polyphonic Synthesizer dengan envelope ADSR, filter biquad akustik, dan overtone).
- **Backend**: Node.js, Express, tsx.
- **AI Models**: Google GenAI TypeScript SDK (`@google/genai`)
  - `gemini-3-pro-image-preview` (Generasi gambar & poster resolusi tinggi)
  - `gemini-4-argon` (Penalaran teori musik lanjutan)
  - `gemini-3.8-flash` (Percakapan teori musik umum)
  - `gemini-3.1-flash-lite` (Parser permintaan bahasa alami & respons cepat)

---

## 🚀 Memulai (Getting Started)

### Prasyarat
- Node.js (versi 18 atau lebih baru)
- npm atau pnpm
- Google Gemini API Key

### Instalasi

1. Clone repositori ini:
   ```bash
   git clone https://github.com/username/harmonix-music-visualizer.git
   cd harmonix-music-visualizer
   ```

2. Pasang dependensi:
   ```bash
   npm install
   ```

3. Konfigurasi Environment Variables:
   Buat file `.env` di direktori utama:
   ```env
   GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
   PORT=3000
   ```

4. Jalankan aplikasi di mode pengembangan:
   ```bash
   npm run dev
   ```

5. Buka browser di `http://localhost:3000`.

---

## 📄 Lisensi (License)

Proyek ini dirilis di bawah lisensi Apache-2.0.
