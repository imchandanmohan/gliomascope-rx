import { useState } from "react";

interface GalleryProps {
  images: string[];
}

export default function Gallery({ images }: GalleryProps) {
  const [selected, setSelected] = useState<string | null>(null);

  if (!images.length)
    return (
      <p className="text-sm text-slate-400 text-center pb-3">
        No cropped images yet.
      </p>
    );

    return (
      <div className="w-full border-t border-slate-800 pt-2 pb-2">
        <div className="mx-auto max-w-[900px]">
          <div className="overflow-x-auto">
            {/* Slimmer row; centered when not overflowing */}
            <div className="mx-auto w-fit flex items-center gap-3 px-2 h-[300px]">
              {images.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt={`gallery-${i}`}
                  onClick={() => setSelected(img)}
                  className="w-46 h-46 object-cover rounded-lg cursor-pointer snap-start transform hover:scale-110 transition-transform duration-300 shadow-md"
                />
              ))}
            </div>
          </div>
        </div>
    
        {selected && (
          <div
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-[1000]"
            onClick={() => setSelected(null)}
          >
            <img
              src={selected}
              alt="enlarged"
              className="max-w-4xl max-h-[85vh] rounded-2xl shadow-2xl transition-transform duration-300 transform hover:scale-105"
            />
          </div>
        )}
      </div>
    );
}