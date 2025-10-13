export default function ImageViewer() {
    return (
      <div className="flex items-center justify-center bg-slate-900">
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/8/88/MRI_head_side.jpg"
          alt="MRI"
          className="max-h-[90%] max-w-[90%] object-contain rounded-md border border-slate-700 shadow-lg"
        />
      </div>
    );
  }