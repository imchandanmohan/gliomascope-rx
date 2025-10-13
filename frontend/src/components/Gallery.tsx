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
      <div className="w-full border-t border-slate-800 pt-3 pb-3">
        {/* Center the gallery track and limit its width */}
        <div className="mx-auto max-w-[950px]">
          {/* Scroll only if needed; otherwise keep row centered */}
          <div className="overflow-x-auto">
            {/* This wrapper keeps the row centered when content is narrower than container */}
            <div className="min-w-full flex justify-center">
              {/* Thumbnails row; height a bit larger */}
              <div className="inline-flex items-center gap-4 px-2 h-[132px]">
                {images.map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    alt={`gallery-${i}`}
                    onClick={() => setSelected(img)}
                    className="w-28 h-28 object-cover rounded-lg cursor-pointer snap-start transform hover:scale-110 transition-transform duration-300 shadow-md"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
    
        {/* Popup Enlarged View */}
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