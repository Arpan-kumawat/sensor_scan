export const OcrLoader = ({ progress }) => (
  <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/75 backdrop-blur-sm">
    <div className="ocr-spinner h-14 w-14 rounded-full border-4 border-sky-400 border-t-transparent" />
    <p className="mt-4 text-sm font-medium text-white">Running OCR...</p>
    <p className="mt-1 text-xs text-slate-300">{progress}%</p>
    <div className="mt-3 h-1.5 w-48 overflow-hidden rounded-full bg-slate-700">
      <div
        className="h-full rounded-full bg-sky-400 transition-all duration-300"
        style={{ width: `${progress}%` }}
      />
    </div>
  </div>
);
