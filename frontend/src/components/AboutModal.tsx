export default function AboutModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-xl w-[580px] p-6 shadow-lg border border-slate-700 space-y-4">
        <h2 className="text-lg font-semibold text-teal-400">About GliomaScope RX</h2>
        <div className="text-sm text-slate-200 space-y-2">
          <p>Scientific radiology console for research and demo purposes.</p>
          <p>Version 1.0.0 — Developed by GliomaScope Lab.</p>
        </div>
        <div className="flex justify-end">
          <button onClick={onClose} className="px-4 py-1.5 rounded-md border border-slate-600 hover:bg-slate-700">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}