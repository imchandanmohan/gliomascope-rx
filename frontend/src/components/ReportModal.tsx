export default function ReportModal({
    onClose,
    inputImage,
    tumorImage,
  }: {
    onClose: () => void;
    inputImage?: string;
    tumorImage?: string;
  }) {
    return (
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center">
        {/* Modal container constrained to viewport */}
        <div className="w-[min(820px,95vw)] max-h-[92vh] bg-white text-slate-900 rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
          {/* Header (fixed height) */}
          <div className="px-6 py-4 border-b">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xl font-semibold text-teal-700">GliomaScope RX — Radiology Report</div>
                <div className="text-sm text-slate-600">Research Use Only</div>
              </div>
              <div className="text-right text-sm text-slate-600">
                Date: {new Date().toLocaleDateString()}<br />
                Study ID: #2025-001
              </div>
            </div>
          </div>
  
          {/* Scrollable content */}
          <div className="flex-1 overflow-auto px-6 py-5">
            {/* Patient / Study meta */}
            <div className="grid grid-cols-2 gap-6 text-sm mb-5">
              <div>
                <div><b>Patient:</b> ______________________</div>
                <div><b>DOB:</b> ____ / ____ / ______</div>
                <div><b>MRN:</b> ______________________</div>
              </div>
              <div>
                <div><b>Modality:</b> MRI Brain</div>
                <div><b>Referring:</b> __________________</div>
                <div><b>Radiologist:</b> ________________</div>
              </div>
            </div>
  
            {/* Images row */}
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <div className="text-sm font-medium mb-1">Input Image</div>
                <div className="border rounded-md h-56 flex items-center justify-center bg-slate-100 overflow-hidden">
                  {inputImage ? (
                    <img src={inputImage} className="max-h-full max-w-full object-contain" />
                  ) : (
                    <span className="text-slate-400">No image</span>
                  )}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium mb-1">Tumor Visualization</div>
                <div className="border rounded-md h-56 flex items-center justify-center bg-slate-100 overflow-hidden">
                  {tumorImage ? (
                    <img src={tumorImage} className="max-h-full max-w-full object-contain" />
                  ) : (
                    <span className="text-slate-400">No tumor overlay</span>
                  )}
                </div>
              </div>
            </div>
  
            {/* Findings */}
            <div className="mb-6">
              <div className="text-sm font-medium mb-1">Findings (editable)</div>
              <textarea
                defaultValue={
                  "Normal brain MRI appearance. No midline shift. No acute intracranial hemorrhage.\n\nAI Summary: Possible low-grade glioma features; correlate clinically."
                }
                className="w-full h-40 border rounded-md p-3 text-sm"
              />
            </div>
  
            {/* Metrics */}
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="border rounded-md p-3">
                <div className="text-slate-500">AUC</div>
                <div className="text-lg font-semibold">0.95</div>
              </div>
              <div className="border rounded-md p-3">
                <div className="text-slate-500">Sensitivity</div>
                <div className="text-lg font-semibold">0.91</div>
              </div>
              <div className="border rounded-md p-3">
                <div className="text-slate-500">Confidence</div>
                <div className="text-lg font-semibold">92%</div>
              </div>
            </div>
          </div>
  
          {/* Footer (always visible at bottom of modal) */}
          <div className="px-6 py-3 border-t bg-white flex justify-end gap-3">
            <button onClick={onClose} className="px-4 py-2 rounded-md border">
              Close
            </button>
            <button
              onClick={() => alert("Report sent!")}
              className="px-4 py-2 rounded-md bg-teal-600 text-white hover:bg-teal-500"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    );
  }