export default function FeatureGrid() {
    const features = Array.from({ length: 12 }, (_, i) => ({
      name: `Feature ${i + 1}`,
      value: (Math.random() * 10).toFixed(2),
    }));
  
    return (
      <div className="grid grid-cols-6 gap-2 p-3 bg-slate-800 border-b border-slate-700">
        {features.map((f) => (
          <div key={f.name} className="rounded-md bg-slate-700/60 p-2 text-center">
            <div className="text-xs text-slate-400">{f.name}</div>
            <div className="font-semibold text-teal-400">{f.value}</div>
          </div>
        ))}
      </div>
    );
  }