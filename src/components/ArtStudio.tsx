import React, { useState } from 'react';
import {
  Image as ImageIcon,
  Sparkles,
  Download,
  Maximize2,
  Minimize2,
  RefreshCw,
  Sliders,
  Palette,
  Eye,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { NoteName } from '../types/music';

interface ArtStudioProps {
  currentRoot: NoteName;
  currentScaleOrChordName: string;
  isChordMode: boolean;
}

interface GeneratedImageItem {
  id: string;
  url: string;
  prompt: string;
  size: '1K' | '2K' | '4K';
  aspectRatio: string;
  timestamp: string;
  model: string;
}

export const ArtStudio: React.FC<ArtStudioProps> = ({
  currentRoot,
  currentScaleOrChordName,
  isChordMode,
}) => {
  // Model specification: gemini-3-pro-image-preview
  const modelName = 'gemini-3-pro-image-preview';

  // Affordance for image size: 1K, 2K, 4K as requested
  const [selectedSize, setSelectedSize] = useState<'1K' | '2K' | '4K'>('1K');
  const [selectedAspectRatio, setSelectedAspectRatio] = useState<string>('1:1');
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [lightboxImage, setLightboxImage] = useState<GeneratedImageItem | null>(null);

  // Gallery of generated images
  const [gallery, setGallery] = useState<GeneratedImageItem[]>([]);

  // Pre-crafted creative prompt suggestions tailored to active scale/chord
  const promptPresets = [
    {
      title: 'Vintage Botanical Theory Chart',
      desc: '19th-century engraved parchment with acoustic harmonic resonance spirals',
      prompt: `A museum-quality vintage Victorian copperplate engraving of a music theory poster illustrating the ${currentRoot} ${currentScaleOrChordName} ${
        isChordMode ? 'chord' : 'scale'
      }, botanical flora intertwining with acoustic soundwave harmonics and golden ratio spirals, intricate sepia ink, antique parchment background, high definition.`,
    },
    {
      title: 'Cyberpunk Holographic Synthesizer',
      desc: 'Luminous neon keyboard and spectral audio frequencies in dark studio',
      prompt: `Futuristic cyberpunk synthesizer visualizer displaying glowing neon holographic keys of the ${currentRoot} ${currentScaleOrChordName}, radiant purple and cyan laser audio waves, floating floating musical notations, cinematic moody volumetric lighting, 8k render.`,
    },
    {
      title: 'Sacred Geometry Circle of Fifths',
      desc: 'Celestial star map with astronomical harmonic geometry',
      prompt: `Sacred geometry mandala of the Circle of Fifths centered on the key of ${currentRoot}, glowing celestial star charts, golden concentric circles, crystalline harmonic intervals, deep indigo astronomical nebula background, divine proportion.`,
    },
    {
      title: 'Minimalist Bauhaus Poster',
      desc: 'Bold Swiss typography and geometric piano keys',
      prompt: `Minimalist Swiss style graphic design poster celebrating the ${currentRoot} ${currentScaleOrChordName}, bold abstract geometric piano keys, clean Bauhaus typography, primary color palette on textured matte paper, art gallery print.`,
    },
  ];

  const handleGenerate = async (promptToUse?: string) => {
    const finalPrompt = promptToUse || customPrompt;
    if (!finalPrompt.trim() || isGenerating) return;

    setIsGenerating(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: finalPrompt,
          imageSize: selectedSize, // 1K, 2K, or 4K
          aspectRatio: selectedAspectRatio,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP error ${res.status}`);
      }

      const data = await res.json();

      const newItem: GeneratedImageItem = {
        id: `img-${Date.now()}`,
        url: data.imageUrl,
        prompt: finalPrompt,
        size: data.size || selectedSize,
        aspectRatio: data.aspectRatio || selectedAspectRatio,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        model: modelName,
      };

      setGallery((prev) => [newItem, ...prev]);
      setCustomPrompt('');
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err?.message || 'Failed to generate visual. Please try refining your prompt.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = (item: GeneratedImageItem) => {
    const link = document.createElement('a');
    link.href = item.url;
    link.download = `Harmonix-${currentRoot}-${currentScaleOrChordName.replace(/\s+/g, '_')}-${item.size}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Studio Header */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 shadow-xl backdrop-blur-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-zinc-800">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-pink-500/20 text-pink-400 border border-pink-500/30">
                <ImageIcon className="h-4 w-4" />
              </div>
              <h3 className="text-base font-semibold text-white">Music Theory Art & Poster Studio</h3>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-pink-500/15 text-pink-300 border border-pink-500/30 font-mono">
                {modelName}
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Generate fine-art infographics, vintage sheet music posters, and sacred geometry diagrams for{' '}
              <strong className="text-white">{currentRoot} {currentScaleOrChordName}</strong>.
            </p>
          </div>
        </div>

        {/* Configuration Bar: Image Size Affordance (1K, 2K, 4K) & Aspect Ratio */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-zinc-950/70 border border-zinc-800">
          {/* AFFORDANCE FOR IMAGE SIZE: 1K, 2K, 4K */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
                <Sliders className="h-3.5 w-3.5 text-indigo-400" />
                <span>Image Resolution Affordance:</span>
              </label>
              <span className="text-[11px] font-mono text-indigo-400 font-bold bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                {selectedSize} Resolution
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(['1K', '2K', '4K'] as const).map((sizeOption) => {
                const isSelected = selectedSize === sizeOption;
                return (
                  <button
                    key={sizeOption}
                    type="button"
                    onClick={() => setSelectedSize(sizeOption)}
                    className={`flex flex-col items-center justify-center py-2 px-3 rounded-xl border text-xs transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-gradient-to-tr from-indigo-600 to-pink-600 border-pink-400 text-white font-bold shadow-lg shadow-pink-500/25 ring-2 ring-pink-400/50'
                        : 'bg-zinc-900 border-zinc-700/80 text-zinc-300 hover:border-zinc-500 hover:bg-zinc-800'
                    }`}
                  >
                    <span className="text-sm font-extrabold">{sizeOption}</span>
                    <span className="text-[10px] opacity-75 mt-0.5">
                      {sizeOption === '1K'
                        ? '1024px Standard'
                        : sizeOption === '2K'
                        ? '2048px High-Def'
                        : '4096px Ultra Fine'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Aspect Ratio Selector */}
          <div>
            <label className="text-xs font-bold text-zinc-200 flex items-center gap-1.5 mb-2">
              <Palette className="h-3.5 w-3.5 text-pink-400" />
              <span>Aspect Ratio:</span>
            </label>
            <div className="grid grid-cols-5 gap-1.5 text-xs">
              {[
                { label: '1:1', name: 'Square Cover' },
                { label: '16:9', name: 'Banner' },
                { label: '4:3', name: 'Poster' },
                { label: '3:4', name: 'Portrait' },
                { label: '9:16', name: 'Phone' },
              ].map((ratio) => (
                <button
                  key={ratio.label}
                  type="button"
                  onClick={() => setSelectedAspectRatio(ratio.label)}
                  className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl border transition-all cursor-pointer ${
                    selectedAspectRatio === ratio.label
                      ? 'bg-indigo-600 border-indigo-400 text-white font-bold shadow-md'
                      : 'bg-zinc-900 border-zinc-700/80 text-zinc-300 hover:border-zinc-500'
                  }`}
                >
                  <span className="font-bold">{ratio.label}</span>
                  <span className="text-[9px] opacity-70 truncate max-w-full">{ratio.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Custom Prompt Input */}
        <div className="mt-4">
          <label className="text-xs font-bold text-zinc-300 mb-1.5 block">
            Custom Musical Visualization Prompt:
          </label>
          <div className="flex gap-2">
            <textarea
              rows={2}
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder={`Describe your visual idea (e.g., 'A vintage gold-foil acoustic chart of ${currentRoot} ${currentScaleOrChordName} with illuminated manuscript borders...')...`}
              className="flex-1 rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none shadow-inner"
            />
            <button
              onClick={() => handleGenerate()}
              disabled={isGenerating || !customPrompt.trim()}
              className="flex flex-col items-center justify-center gap-1 rounded-xl bg-gradient-to-tr from-indigo-600 to-pink-600 px-6 py-2 text-xs font-bold text-white shadow-lg shadow-pink-600/30 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0 transition"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Rendering...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Generate</span>
                </>
              )}
            </button>
          </div>

          {errorMsg && (
            <div className="mt-2.5 flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/30 p-2.5 text-xs text-red-300">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Preset Prompt Cards */}
        <div className="mt-5 pt-4 border-t border-zinc-800/80">
          <span className="text-xs font-bold text-zinc-400 block mb-2.5">
            Or Click a Curated Art Concept:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {promptPresets.map((preset, pIdx) => (
              <button
                key={pIdx}
                onClick={() => {
                  setCustomPrompt(preset.prompt);
                  handleGenerate(preset.prompt);
                }}
                disabled={isGenerating}
                className="flex flex-col justify-between p-3 rounded-xl bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/60 hover:border-pink-500/50 transition cursor-pointer text-left group"
              >
                <div>
                  <span className="text-xs font-bold text-white group-hover:text-pink-300 transition-colors">
                    {preset.title}
                  </span>
                  <p className="text-[11px] text-zinc-400 mt-1 leading-snug line-clamp-2">
                    {preset.desc}
                  </p>
                </div>
                <div className="mt-2 flex items-center gap-1 text-[10px] font-semibold text-pink-400">
                  <Sparkles className="h-3 w-3" />
                  <span>Click to Generate ({selectedSize})</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Generated Gallery Showcase */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 shadow-xl backdrop-blur-sm">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-4">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-indigo-400" />
            <h4 className="text-base font-semibold text-white">Generated Gallery</h4>
            <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
              {gallery.length} Artwork{gallery.length === 1 ? '' : 's'}
            </span>
          </div>
        </div>

        {gallery.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-800 text-zinc-500 mb-3">
              <ImageIcon className="h-6 w-6" />
            </div>
            <p className="text-sm font-medium text-zinc-300">No artwork generated yet</p>
            <p className="text-xs text-zinc-500 mt-1 max-w-sm">
              Select 1K, 2K, or 4K resolution and pick a curated concept above to create your first visual poster.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {gallery.map((item) => (
              <div
                key={item.id}
                className="group relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 shadow-xl transition hover:border-pink-500/50"
              >
                {/* Image */}
                <div className="relative aspect-square overflow-hidden bg-zinc-900">
                  <img
                    src={item.url}
                    alt={item.prompt}
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                  {/* Badge tags overlay */}
                  <div className="absolute top-2 left-2 flex gap-1">
                    <span className="rounded-md bg-black/70 px-2 py-0.5 text-[10px] font-bold text-pink-300 backdrop-blur-sm border border-pink-500/30">
                      {item.size}
                    </span>
                    <span className="rounded-md bg-black/70 px-1.5 py-0.5 text-[10px] font-mono text-zinc-300 backdrop-blur-sm">
                      {item.aspectRatio}
                    </span>
                  </div>

                  {/* Hover Actions */}
                  <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100 backdrop-blur-[2px]">
                    <button
                      onClick={() => setLightboxImage(item)}
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-zinc-900 shadow-lg hover:scale-110 transition cursor-pointer"
                      title="View Fullscreen"
                    >
                      <Maximize2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDownload(item)}
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-pink-600 text-white shadow-lg hover:scale-110 transition cursor-pointer"
                      title="Download Image"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Footer details */}
                <div className="p-3">
                  <p className="text-xs text-zinc-300 line-clamp-2 leading-relaxed">
                    {item.prompt}
                  </p>
                  <div className="mt-2 flex items-center justify-between text-[10px] text-zinc-500 border-t border-zinc-800 pt-2 font-mono">
                    <span>{item.model}</span>
                    <span>{item.timestamp}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md"
          onClick={() => setLightboxImage(null)}
        >
          <div
            className="relative max-h-[90vh] max-w-4xl overflow-hidden rounded-2xl border border-zinc-700 bg-zinc-950 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative">
              <img
                src={lightboxImage.url}
                alt={lightboxImage.prompt}
                referrerPolicy="no-referrer"
                className="max-h-[75vh] w-auto object-contain mx-auto"
              />
              <button
                onClick={() => setLightboxImage(null)}
                className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-white hover:bg-black transition cursor-pointer"
              >
                <Minimize2 className="h-4 w-4" />
              </button>
            </div>
            <div className="p-4 bg-zinc-900/95 flex flex-wrap items-center justify-between gap-3 border-t border-zinc-800">
              <div className="max-w-xl">
                <p className="text-xs text-zinc-200">{lightboxImage.prompt}</p>
                <div className="mt-1 flex gap-2 text-[10px] text-zinc-400 font-mono">
                  <span>Size: {lightboxImage.size}</span>
                  <span>•</span>
                  <span>Model: {lightboxImage.model}</span>
                  <span>•</span>
                  <span>Ratio: {lightboxImage.aspectRatio}</span>
                </div>
              </div>
              <button
                onClick={() => handleDownload(lightboxImage)}
                className="flex items-center gap-1.5 rounded-xl bg-pink-600 hover:bg-pink-500 px-4 py-2 text-xs font-semibold text-white shadow-lg transition cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download {lightboxImage.size} Poster</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
