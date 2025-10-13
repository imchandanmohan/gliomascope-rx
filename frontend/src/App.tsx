import { useCallback, useEffect, useMemo, useState } from "react";
import Navbar from "./components/Navbar";
import EnhancementConsole from "./components/EnhancementConsole";
import FeatureGrid from "./components/FeatureGrid";
import ParticleBackground from "./components/ParticleBackground";
import ImagePanel from "./components/ImagePanel";
import Gallery from "./components/Gallery";
import LLMConsole from "./components/LLMConsole";
import ReportModal from "./components/ReportModal";
import AboutModal from "./components/AboutModal";
import { DEFAULT_ENH, type EnhancementState } from "./types";
import { useImageProcessor } from "./hooks/useImageProcessor";


export default function App() {
  const [showReport, setShowReport] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [baseImage, setBaseImage] = useState<string | null>(null);
  const [tumorImage, setTumorImage] = useState<string | null>(null);

  const [enh, _setEnh] = useState<EnhancementState>({ ...DEFAULT_ENH });
  const [history, setHistory] = useState<EnhancementState[]>([{ ...DEFAULT_ENH }]);
  const [histIdx, setHistIdx] = useState(0);

  const panelSize = useMemo(() => ({ w: 400, h: 350 }), []);
  const { ready, setBaseImage: workerSetBase, apply, processedUrl } = useImageProcessor(panelSize);

  const setEnh = useCallback(
    (next: EnhancementState, pushHistory = true) => {
      _setEnh(next);
      if (pushHistory) {
        setHistory((h) => {
          const trimmed = h.slice(0, histIdx + 1);
          return [...trimmed, next];
        });
        setHistIdx((i) => i + 1);
      }
    },
    [histIdx]
  );

  const undo = () => {
    if (histIdx > 0) {
      const idx = histIdx - 1;
      setHistIdx(idx);
      _setEnh(history[idx]);
    }
  };

  const redo = () => {
    if (histIdx < history.length - 1) {
      const idx = histIdx + 1;
      setHistIdx(idx);
      _setEnh(history[idx]);
    }
  };

  useEffect(() => {
    if (baseImage) workerSetBase(baseImage);
  }, [baseImage, workerSetBase]);

  useEffect(() => {
    if (baseImage && ready) apply(enh);
  }, [baseImage, ready, enh, apply]);

  const inputProcessed = processedUrl ?? undefined;
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const handleAddCrop = (img: string) => setGalleryImages((prev) => [img, ...prev]);

  const [isScanning, setIsScanning] = useState(false);
  const handleAnalyze = () => {
    if (!baseImage) return alert("Please upload an image first!");
    setIsScanning(true);
    setTimeout(() => setIsScanning(false), 5000);
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-900 text-slate-100 overflow-hidden">
      <Navbar onSendReport={() => setShowReport(true)} onAbout={() => setShowAbout(true)} />

      <div className="flex flex-1 overflow-hidden">
        <EnhancementConsole
          onImageSelected={setBaseImage}
          enh={enh}
          setEnh={setEnh}
          onUndo={undo}
          onRedo={redo}
          canUndo={histIdx > 0}
          canRedo={histIdx < history.length - 1}
          processedUrl={processedUrl}
        />

        {/* Reserve space so fixed Gallery doesn't cover content */}
        <main className="flex-1 relative border-x border-slate-800 overflow-hidden pb-[170px]">
          <div className="relative z-10 flex flex-col h-full">
            <FeatureGrid />
            <div className="relative flex-1">
              <ParticleBackground />

              {/* Panels moved up and tightened at bottom */}
              <div className="relative z-10 h-full flex items-start justify-around px-4 pt-2 pb-0 gap-6">
                <ImagePanel
                  title="Input (Enhanced)"
                  imageSrc={inputProcessed}
                  scanning={isScanning}
                  onCrop={handleAddCrop}
                />
                <ImagePanel title="Output (Tumor)" imageSrc={tumorImage || undefined} />
              </div>
            </div>

            {/* Centered button, lifted above the (taller) gallery */}
            <button
              onClick={handleAnalyze}
              disabled={isScanning}
              className={`fixed bottom-44 left-1/2 -translate-x-1/2 z-[1000]
                bg-teal-600 hover:bg-teal-500 px-8 py-2 rounded-lg font-medium text-sm
                text-white shadow-lg transition-all duration-200 flex items-center justify-center
                ${isScanning ? "opacity-80 scale-95 cursor-not-allowed" : "opacity-100 scale-100"}`}
            >
              {isScanning ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4 text-white mr-2"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Analyzing...
                </>
              ) : (
                "Analyze"
              )}
            </button>

            {/* Gallery renders as fixed bar (updated in its own file) */}
            <Gallery images={galleryImages} />
          </div>
        </main>

        <LLMConsole />
      </div>

      {showReport && (
        <ReportModal onClose={() => setShowReport(false)} inputImage={inputProcessed} tumorImage={tumorImage || undefined} />
      )}
      {showAbout && <AboutModal onClose={() => setShowAbout(false)} />}
    </div>
  );
}