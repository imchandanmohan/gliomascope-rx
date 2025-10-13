import { Mail, PlusCircle } from "lucide-react";
import { useState } from "react";

export default function Navbar({
  onSendReport,
  onAbout,
}: {
  onSendReport: () => void;
  onAbout: () => void;
}) {
  const [availableCredits, setAvailableCredits] = useState(120);

  return (
    <header className="h-12 flex items-center justify-between px-6 bg-slate-800 border-b border-slate-700 shadow">
      {/* Left brand name */}
      <div className="font-bold text-teal-400">GliomaScope RX</div>

      {/* Right side buttons */}
      <div className="flex items-center gap-6 text-sm">
        {/* Stats */}
        <div className="flex gap-4 text-slate-400">
          <span>
            AUC <b className="text-slate-100">0.95</b>
          </span>
          <span>
            Sens <b className="text-slate-100">0.91</b>
          </span>
        </div>

        {/* Credits display */}
        <div className="flex items-center gap-3 bg-slate-700 px-3 py-1 rounded-lg text-white text-sm">
          <span>
            Credits:{" "}
            <b className="text-green-400 font-semibold">{availableCredits}</b>
          </span>
          <button
            onClick={() =>
              alert("Payment microservice integration coming soon!")
            }
            className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 px-2 py-1 rounded-md text-xs"
          >
            <PlusCircle size={14} />
            Add
          </button>
        </div>

        {/* Report button */}
        <button
          onClick={onSendReport}
          className="flex items-center gap-1 bg-teal-600 hover:bg-teal-500 text-white px-3 py-1 rounded-md text-sm"
        >
          <Mail size={14} /> Send Report
        </button>

        {/* About button */}
        <button
          onClick={onAbout}
          className="text-slate-400 hover:text-teal-400"
        >
          About
        </button>
      </div>
    </header>
  );
}