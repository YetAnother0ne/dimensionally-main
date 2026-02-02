import { useState, useEffect } from "react";
import { X, ZoomIn } from "lucide-react";

interface ImagePreviewGridProps {
  files: File[];
  onRemove: (index: number) => void;
  maxVisible?: number;
}

export function ImagePreviewGrid({ files, onRemove, maxVisible = 6 }: ImagePreviewGridProps) {
  const [previews, setPreviews] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    const urls = files.map((file) => URL.createObjectURL(file));
    setPreviews(urls);

    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [files]);

  const visiblePreviews = previews.slice(0, maxVisible);
  const hiddenCount = files.length - maxVisible;

  if (files.length === 0) {
    return null;
  }

  return (
    <>
      <div className="grid grid-cols-3 gap-2">
        {visiblePreviews.map((url, index) => (
          <div
            key={`${files[index].name}-${index}`}
            className="relative aspect-square rounded-lg overflow-hidden group"
          >
            <img
              src={url}
              alt={files[index].name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedImage(url);
                }}
                className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
              >
                <ZoomIn className="w-4 h-4 text-white" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(index);
                }}
                className="p-1.5 rounded-full bg-destructive/80 hover:bg-destructive transition-colors"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
              <p className="text-xs text-white truncate">{files[index].name}</p>
            </div>
          </div>
        ))}
        
        {hiddenCount > 0 && (
          <div className="aspect-square rounded-lg bg-secondary flex items-center justify-center">
            <span className="text-lg font-semibold text-muted-foreground">
              +{hiddenCount}
            </span>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
          <img
            src={selectedImage}
            alt="Preview"
            className="max-w-full max-h-full object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
