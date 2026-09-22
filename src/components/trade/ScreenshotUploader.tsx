import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Eye } from 'lucide-react';
import { TradeScreenshot } from '../../types/trade';

interface ScreenshotUploaderProps {
  screenshots: TradeScreenshot[];
  onChange: (screenshots: TradeScreenshot[]) => void;
  tradeId?: string;
}

export const ScreenshotUploader: React.FC<ScreenshotUploaderProps> = ({
  screenshots,
  onChange,
  tradeId = 'TRD-NEW',
}) => {
  const [dragOver, setDragOver] = useState(false);
  const [previewModalUrl, setPreviewModalUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        const url = e.target?.result as string;
        // Determine default type based on current count
        let defaultType: TradeScreenshot['type'] = 'entry';
        if (screenshots.length === 0) defaultType = 'before';
        else if (screenshots.length === 1) defaultType = 'entry';
        else if (screenshots.length === 2) defaultType = 'after';
        else defaultType = 'other';

        const newScreenshot: TradeScreenshot = {
          id: `sc-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          name: `${tradeId}_${file.name}`,
          url,
          type: defaultType,
        };

        onChange([...screenshots, newScreenshot]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleRemove = (id: string) => {
    onChange(screenshots.filter((s) => s.id !== id));
  };

  const handleTypeChange = (id: string, type: TradeScreenshot['type']) => {
    onChange(
      screenshots.map((s) => (s.id === id ? { ...s, type } : s))
    );
  };

  return (
    <div className="space-y-3">
      {/* Dropzone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-4 text-center cursor-pointer transition ${
          dragOver
            ? 'border-emerald-500 bg-emerald-500/10'
            : 'border-slate-700 bg-slate-900/50 hover:border-slate-600 hover:bg-slate-900'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-emerald-400 mb-2">
          <Upload className="w-5 h-5" />
        </div>
        <p className="text-xs font-semibold text-slate-200">
          Upload Chart Screenshot (Drag & Drop atau Klik)
        </p>
        <p className="text-[11px] text-slate-500 mt-0.5">
          Mendukung multiple screenshot (Before Entry, Entry, After Result). Disimpan ke Google Drive / Journal.
        </p>
      </div>

      {/* Thumbnails list */}
      {screenshots.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {screenshots.map((sc, index) => (
            <div
              key={sc.id}
              className="group relative overflow-hidden rounded-lg border border-slate-800 bg-slate-900/90 p-2 shadow-sm"
            >
              <div className="relative aspect-video w-full overflow-hidden rounded bg-black/40">
                <img
                  src={sc.url}
                  alt={sc.name}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewModalUrl(sc.url);
                    }}
                    className="rounded-full bg-slate-800/90 p-1.5 text-slate-200 hover:text-white"
                    title="Preview Besar"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(sc.id);
                    }}
                    className="rounded-full bg-rose-900/80 p-1.5 text-rose-200 hover:bg-rose-800"
                    title="Hapus Screenshot"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Tag Selector */}
              <div className="mt-2 flex items-center justify-between gap-1">
                <select
                  value={sc.type}
                  onChange={(e) => handleTypeChange(sc.id, e.target.value as any)}
                  className="rounded border border-slate-700 bg-slate-800 px-2 py-0.5 text-[10px] font-medium text-slate-300 focus:border-emerald-500 focus:outline-none"
                >
                  <option value="before">1. Before Entry</option>
                  <option value="entry">2. Entry</option>
                  <option value="after">3. After Result</option>
                  <option value="other">Other / Setup</option>
                </select>
                <span className="text-[10px] text-slate-500 font-mono">#{index + 1}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Large Image Preview Modal */}
      {previewModalUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
          onClick={() => setPreviewModalUrl(null)}
        >
          <div className="relative max-h-[90vh] max-w-[90vw] overflow-hidden rounded-xl border border-slate-700 bg-slate-900 p-2 shadow-2xl">
            <button
              onClick={() => setPreviewModalUrl(null)}
              className="absolute top-4 right-4 z-10 rounded-full bg-slate-800/80 p-2 text-slate-300 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={previewModalUrl}
              alt="Preview"
              className="max-h-[85vh] w-auto rounded object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
};
