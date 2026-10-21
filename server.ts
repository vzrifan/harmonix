import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '15mb' }));

// Initialize GoogleGenAI client with standard header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const DEFAULT_SYSTEM_INSTRUCTION = `You are Maestro AI, a world-class conservatory music theory professor, jazz composer, and acoustic analyst.
Your mission is to guide musicians, producers, and students through music theory with deep clarity, practical musical examples, and enthusiasm.
You explain scales, modes (Ionian, Dorian, Phrygian, Lydian, Mixolydian, Aeolian, Locrian, Melodic Minor & Harmonic Minor modes, Altered scale, Bebop, Whole Tone, Diminished, Pentatonics), chord construction (triads, 7ths, extensions 9/11/13, alterations b9/#9/#11/b13), voice leading, functional harmony, modal interchange, secondary dominants, tritone substitutions, and negative harmony.

Formatting guidelines:
- Use clear markdown with bold headers, bullet points, and chord charts.
- Whenever you discuss a specific scale or chord, provide concrete note names and interval formulas (e.g. 1 - b3 - 5 - b7 - 9).
- When suggesting a scale or chord to explore on the visualizer, include an interactive tag in this exact format:
  [VISUALIZE: {"type": "scale", "root": "D", "name": "Dorian"}]
  or
  [VISUALIZE: {"type": "chord", "root": "C", "name": "maj7"}]
  or
  [VISUALIZE: {"type": "chord", "root": "G", "name": "7b9"}]
  Available scale names: Major / Ionian, Natural Minor / Aeolian, Dorian, Phrygian, Lydian, Mixolydian, Locrian, Harmonic Minor, Melodic Minor, Phrygian Dominant, Lydian Dominant, Altered / Super Locrian, Major Pentatonic, Minor Pentatonic, Blues, Whole Tone, Half-Whole Diminished, Whole-Half Diminished, Bebop Dominant, Japanese Hirajoshi.
  Available chord names: maj, min, dim, aug, sus2, sus4, maj7, min7, 7, m7b5, dim7, aug7, maj9, min9, 9, 7b9, 7#9, min11, 11, 13, maj13.
- Be concise, practical, and inspiring. Suggest ear-training tips and real song examples (e.g., Miles Davis, Stevie Wonder, Bill Evans, Debussy, Radiohead, Daft Punk).`;

// --- API Endpoints ---

// 1. Multi-turn Chat Endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history = [], model = 'gemini-3.8-flash', customRole } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Supported models as requested:
    // gemini-4-argon (complex tasks), gemini-3.8-flash (general tasks), gemini-3.1-flash-lite (fast tasks)
    const validModels = ['gemini-4-argon', 'gemini-3.8-flash', 'gemini-3.1-flash-lite'];
    const chosenModel = validModels.includes(model) ? model : 'gemini-3.8-flash';

    const systemInstruction = customRole
      ? `${DEFAULT_SYSTEM_INSTRUCTION}\n\nSpecific Focus/Role: ${customRole}`
      : DEFAULT_SYSTEM_INSTRUCTION;

    // Build contents array with conversation history
    const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

    if (Array.isArray(history)) {
      for (const item of history) {
        if (item && item.role && item.parts && Array.isArray(item.parts)) {
          const validRole = item.role === 'model' ? 'model' : 'user';
          contents.push({
            role: validRole,
            parts: item.parts.map((p: { text?: string }) => ({ text: String(p.text || '') })),
          });
        }
      }
    }

    // Append the current user message
    contents.push({
      role: 'user',
      parts: [{ text: message }],
    });

    const response = await ai.models.generateContent({
      model: chosenModel,
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const reply = response.text || 'I could not generate an answer at this time.';

    return res.json({ reply, modelUsed: chosenModel });
  } catch (error: any) {
    console.error('Chat error:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to communicate with Gemini assistant.',
    });
  }
});

// 2. High-Quality Image Generation Endpoint (using gemini-3-pro-image-preview with 1K, 2K, 4K affordance)
app.post('/api/generate-image', async (req, res) => {
  try {
    const {
      prompt,
      imageSize = '1K',
      aspectRatio = '1:1',
    } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Ensure imageSize is valid: 1K, 2K, or 4K
    const validSizes = ['1K', '2K', '4K'];
    const finalSize = validSizes.includes(imageSize) ? imageSize : '1K';

    const validRatios = ['1:1', '16:9', '4:3', '3:4', '9:16'];
    const finalRatio = validRatios.includes(aspectRatio) ? aspectRatio : '1:1';

    // Model requested: gemini-3-pro-image-preview
    // With fallback chain if needed
    const primaryModel = 'gemini-3-pro-image-preview';

    let response;
    try {
      response = await ai.models.generateContent({
        model: primaryModel,
        contents: {
          parts: [{ text: prompt }],
        },
        config: {
          imageConfig: {
            aspectRatio: finalRatio as any,
            imageSize: finalSize as any,
          },
        },
      });
    } catch (primaryErr: any) {
      console.warn(`Primary image model ${primaryModel} failed:`, primaryErr?.message);
      // Fallback to gemini-nano-banana-2.1 or gemini-3.1-flash-lite-image
      try {
        response = await ai.models.generateContent({
          model: 'gemini-nano-banana-2.1',
          contents: {
            parts: [{ text: prompt }],
          },
          config: {
            imageConfig: {
              aspectRatio: finalRatio as any,
              imageSize: finalSize as any,
            },
          },
        });
      } catch (fallbackErr: any) {
        // Last fallback to flash lite image
        response = await ai.models.generateContent({
          model: 'gemini-3.1-flash-lite-image',
          contents: {
            parts: [{ text: prompt }],
          },
        });
      }
    }

    let imageUrl: string | null = null;
    let mimeType = 'image/png';

    if (response?.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          mimeType = part.inlineData.mimeType || 'image/png';
          imageUrl = `data:${mimeType};base64,${part.inlineData.data}`;
          break;
        }
      }
    }

    if (!imageUrl) {
      return res.status(500).json({
        error: 'Model response did not contain image data. Please refine your prompt.',
      });
    }

    return res.json({
      imageUrl,
      mimeType,
      size: finalSize,
      aspectRatio: finalRatio,
      prompt,
    });
  } catch (error: any) {
    console.error('Image generation error:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to generate image.',
    });
  }
});

// 3. Natural Language Music Query Parser (Fast with gemini-3.1-flash-lite)
app.post('/api/parse-request', async (req, res) => {
  try {
    const { query } = req.body;
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Query is required' });
    }

    const prompt = `Analyze this music query: "${query}".
Identify whether the user wants to visualize a SCALE or a CHORD.
Extract:
1. Root note (e.g. "C", "C#", "Db", "D", "Eb", "E", "F", "F#", "Gb", "G", "Ab", "A", "Bb", "B")
2. Type ("scale" or "chord")
3. Best matching standard name:
   For scale: "Major / Ionian", "Natural Minor / Aeolian", "Dorian", "Phrygian", "Lydian", "Mixolydian", "Locrian", "Harmonic Minor", "Melodic Minor", "Phrygian Dominant", "Lydian Dominant", "Altered / Super Locrian", "Major Pentatonic", "Minor Pentatonic", "Blues", "Whole Tone", "Half-Whole Diminished", "Whole-Half Diminished", "Bebop Dominant", "Japanese Hirajoshi".
   For chord: "maj", "min", "dim", "aug", "sus2", "sus4", "maj7", "min7", "7", "m7b5", "dim7", "aug7", "maj9", "min9", "9", "7b9", "7#9", "min11", "11", "13", "maj13".
4. Short explanation (1-2 sentences on sonic mood, usage, or famous song).

Respond in strictly valid JSON without markdown wrapping:
{
  "root": "C",
  "type": "scale",
  "name": "Dorian",
  "explanation": "..."
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Parse request error:', error);
    return res.status(500).json({ error: error?.message || 'Parsing failed' });
  }
});

// 4. Harmonic Progression Reharmonizer & Suggester
app.post('/api/reharmonize', async (req, res) => {
  try {
    const { key, progression, genre = 'jazz' } = req.body;

    const prompt = `You are an expert composer. Provide 3 sophisticated reharmonization variations for this chord progression:
Key: ${key || 'C'}
Original Progression: ${progression || 'ii - V - I'}
Style/Genre: ${genre}

Return JSON with this schema:
{
  "variations": [
    {
      "title": "Tritone Substitution",
      "chords": ["Dm7", "Db7", "Cmaj7"],
      "explanation": "Replaces the dominant V7 with the tritone substitution bII7 to create smooth chromatic bass motion."
    }
  ],
  "theoryTip": "A concise masterclass tip for applying this in performance."
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const data = JSON.parse(response.text || '{}');
    return res.json(data);
  } catch (error: any) {
    console.error('Reharmonize error:', error);
    return res.status(500).json({ error: error?.message || 'Reharmonization failed' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Setup Vite middleware in dev or static files in production
async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Harmonix server running on http://0.0.0.0:${PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start Harmonix server:', err);
  process.exit(1);
});
