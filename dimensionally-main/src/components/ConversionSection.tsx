import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Upload, Image, Box, Download, X, Loader2, Sparkles, Camera } from "lucide-react";
import { useConversion, type ConversionMode } from "@/hooks/use-conversion";
import { useConversionMode } from "@/hooks/conversion-mode";
import { type OutputFormat } from "@/lib/three-renderer";
import { ModelPreview } from "./ModelPreview";
import { ImagePreviewGrid } from "./ImagePreviewGrid";

const formats2D = ["PNG", "JPG", "WEBP"];
const formats3D = ["FBX", "OBJ", "GLTF", "GLB", "STL", "USDZ", "DAE"];

type ConversionMethod = "auto" | "photogrammetry";

export const ConversionSection = () => {
  const { mode, setMode } = useConversionMode();
  const [conversionMethod, setConversionMethod] = useState<ConversionMethod>("photogrammetry");
  const [dragActive, setDragActive] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<string>(
    "FBX"
  );
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [spriteMode, setSpriteMode] = useState<"single" | "sprite">("single");
  const [spriteAngleCount, setSpriteAngleCount] = useState<number>(16);
  const [spriteResolution, setSpriteResolution] = useState<number>(512);

  const {
    isConverting,
    progress,
    error,
    resultUrl,
    resultFile,
    resultFormat,
    convert3DTo2D,
    convert2DTo3D,
    downloadResult,
    reset,
  } = useConversion();

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const files = Array.from(e.dataTransfer.files);
        if (mode === "2d-to-3d") {
          setUploadedFiles((prev) => [...prev, ...files]);
        } else {
          setUploadedFiles([files[0]]);
        }
        reset();
      }
    },
    [mode, reset]
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      if (mode === "2d-to-3d") {
        setUploadedFiles((prev) => [...prev, ...files]);
      } else {
        setUploadedFiles([files[0]]);
      }
      reset();
    }
  };

  const handleModeChange = (newMode: ConversionMode) => {
    setMode(newMode);
    setSelectedFormat(newMode === "2d-to-3d" ? "FBX" : "PNG");
    setUploadedFiles([]);
    reset();
  };

  // Keep selectedFormat synced when mode changes (in case something else sets mode)
  useEffect(() => {
    setSelectedFormat(mode === "2d-to-3d" ? "FBX" : "PNG");
  }, [mode]);

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
    reset();
  };

  const handleConvert = async () => {
    if (uploadedFiles.length === 0) return;

    if (mode === "3d-to-2d") {
      if (spriteMode === "sprite") {
        await convert3DTo2D(uploadedFiles[0], selectedFormat as OutputFormat, {
          spriteAngleCount: spriteAngleCount,
          resolution: spriteResolution,
        });
      } else {
        await convert3DTo2D(uploadedFiles[0], selectedFormat as OutputFormat);
      }
    } else {
      await convert2DTo3D(uploadedFiles, selectedFormat, conversionMethod);
    }
  };

  const handleDownload = () => {
    // Prefer the generated file name (resultFile) if available
    if (resultFile) {
      downloadResult(resultFile.name);
      return;
    }

    const baseName = uploadedFiles[0]?.name.split(".")[0] || "converted";
    const extension = selectedFormat.toLowerCase();
    downloadResult(`${baseName}.${extension}`);
  };

  const outputFormats = mode === "2d-to-3d" ? formats3D : formats2D;
  const acceptedInputs =
    mode === "2d-to-3d"
      ? ".png,.jpg,.jpeg,.webp,.gif"
      : ".fbx,.obj,.gltf,.glb";

  const minImagesForPhotogrammetry = 8;
  const hasEnoughImages = uploadedFiles.length >= minImagesForPhotogrammetry;

  return (
    <section id="convert" className="py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Start Your <span className="gradient-text">Conversion</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Choose your conversion direction and upload your files to get started.
          </p>
        </motion.div>

        {/* Progress bar (visible during conversion) */}
        {isConverting && (
          <div className="mx-auto max-w-6xl mb-6">
            <div className="h-1 bg-secondary rounded-full overflow-hidden">
              <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
            </div>
            <div className="text-xs text-muted-foreground mt-2 text-right">{progress}%</div>
          </div>
        )}

        {/* Mode Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex justify-center mb-8"
        >
          <div className="inline-flex glass-card rounded-2xl p-2">
            <button
              onClick={() => handleModeChange("2d-to-3d")}
              className={`flex items-center gap-3 px-6 py-4 rounded-xl font-medium transition-all ${
                mode === "2d-to-3d"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Image className="w-5 h-5" />
              <span>2D → 3D</span>
              <Box className="w-5 h-5" />
            </button>
            <button
              onClick={() => handleModeChange("3d-to-2d")}
              className={`flex items-center gap-3 px-6 py-4 rounded-xl font-medium transition-all ${
                mode === "3d-to-2d"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Box className="w-5 h-5" />
              <span>3D → 2D</span>
              <Image className="w-5 h-5" />
            </button>
          </div>
        </motion.div>

        {/* Method Toggle for 2D→3D */}
        {mode === "2d-to-3d" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex justify-center mb-8"
          >
            <div className="inline-flex bg-secondary/50 rounded-xl p-1.5 gap-1">
              <button
                onClick={() => {
                  setConversionMethod("auto");
                  reset();
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  conversionMethod === "auto"
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>Auto Generation</span>
              </button>
              <button
                onClick={() => {
                  setConversionMethod("photogrammetry");
                  reset();
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  conversionMethod === "photogrammetry"
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                <Camera className="w-4 h-4" />
                <span>Photogrammetry</span>
              </button>
            </div>
          </motion.div>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Upload Area */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="glass-card rounded-2xl p-6">
              <h3 className="font-display text-xl font-semibold mb-4 flex items-center gap-2">
                <Upload className="w-5 h-5 text-primary" />
                Upload {mode === "2d-to-3d" ? "Images" : "3D Model"}
              </h3>

              <div
                className={`upload-zone relative rounded-xl p-8 text-center cursor-pointer transition-all ${
                  dragActive ? "border-primary bg-primary/5" : ""
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => document.getElementById("file-input")?.click()}
              >
                {isConverting && (
                  <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm rounded-xl">
                    <div className="flex items-center gap-3">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                      <div className="text-sm font-medium">Converting... {progress}%</div>
                    </div>
                  </div>
                )}
                <input
                  type="file"
                  id="file-input"
                  className="hidden"
                  accept={acceptedInputs}
                  onChange={handleFileInput}
                  multiple={mode === "2d-to-3d"}
                />

                {uploadedFiles.length > 0 ? (
                  <div className="space-y-4" onClick={(e) => e.stopPropagation()}>
                    {mode === "2d-to-3d" ? (
                      <>
                        <ImagePreviewGrid
                          files={uploadedFiles}
                          onRemove={removeFile}
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            document.getElementById("file-input")?.click();
                          }}
                          className="text-sm text-primary hover:underline"
                        >
                          + Add more images
                        </button>
                      </>
                    ) : (
                      <div className="space-y-3">
                        <div className="w-16 h-16 mx-auto rounded-xl bg-primary/20 flex items-center justify-center">
                          <Box className="w-8 h-8 text-primary" />
                        </div>
                        <div className="flex items-center justify-between bg-secondary/50 rounded-lg px-3 py-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-sm font-medium truncate">
                              {uploadedFiles[0].name}
                            </span>
                            <span className="text-xs text-muted-foreground shrink-0">
                              ({(uploadedFiles[0].size / 1024 / 1024).toFixed(2)} MB)
                            </span>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFile(0);
                            }}
                            className="p-1 hover:bg-destructive/20 rounded-md transition-colors shrink-0"
                          >
                            <X className="w-4 h-4 text-destructive" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary flex items-center justify-center">
                      <Upload className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <p className="text-lg font-medium mb-2">
                      Drag & drop your{" "}
                      {mode === "2d-to-3d" ? "images" : "3D model"} here
                    </p>
                    <p className="text-sm text-muted-foreground mb-4">
                      or click to browse files
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Supported:{" "}
                      {mode === "2d-to-3d"
                        ? "PNG, JPG, WEBP, GIF"
                        : "FBX, OBJ, GLTF, GLB"}
                    </p>
                  </>
                )}
              </div>

              {/* Tips based on mode */}
              {mode === "2d-to-3d" && conversionMethod === "auto" && (
                <p className="text-sm text-muted-foreground mt-4">
                  💡 Tip: Upload 1-4 images. Works best with clear, well-lit photos.
                </p>
              )}
              {mode === "2d-to-3d" && conversionMethod === "photogrammetry" && (
                <div className="mt-4 space-y-3">
                  <div className="p-4 rounded-lg bg-secondary/50 space-y-3">
                    <div>
                      <p className="text-sm font-medium mb-2">
                        📸 Photogrammetry Requirements
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Minimum {minImagesForPhotogrammetry} images required for accurate 3D reconstruction. Supports photos, sketches, drawings, and digital designs.
                      </p>
                    </div>
                    
                    <div className="space-y-1.5">
                      <p className="text-xs font-medium text-foreground">Best practices:</p>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        <li>✓ Multiple viewpoints or design variations (360° coverage)</li>
                        <li>✓ Consistent resolution and proportions</li>
                        <li>✓ Good contrast and clear visibility</li>
                        <li>✓ High-resolution images (2MP+ recommended)</li>
                        <li>✓ Clean composition, keep subject centered</li>
                        <li>✓ More images = better detail (12-50 is ideal)</li>
                      </ul>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${
                            hasEnoughImages ? "bg-primary" : "bg-muted-foreground"
                          }`}
                          style={{
                            width: `${Math.min(100, (uploadedFiles.length / minImagesForPhotogrammetry) * 100)}%`,
                          }}
                        />
                      </div>
                      <span className="text-xs font-medium">
                        {uploadedFiles.length}/{minImagesForPhotogrammetry}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 3D Model Preview for 3D→2D mode */}
            {mode === "3d-to-2d" && uploadedFiles.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6"
              >
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Box className="w-4 h-4 text-primary" />
                  Model Preview
                </h4>
                <ModelPreview
                  file={uploadedFiles[0]}
                  className="h-64"
                />
              </motion.div>
            )}
          </motion.div>

          {/* Output Format Selection */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="glass-card rounded-2xl p-6 h-full flex flex-col">
              <h3 className="font-display text-xl font-semibold mb-4 flex items-center gap-2">
                <Download className="w-5 h-5 text-primary" />
                Output Format
              </h3>

              <div className="mb-6">
                <p className="text-sm text-muted-foreground mb-4">
                  Select your preferred export format:
                </p>
                <div className="flex flex-wrap gap-2">
                  {outputFormats.map((format) => (
                    <button
                      key={format}
                      onClick={() => setSelectedFormat(format)}
                      className={`format-chip ${
                        selectedFormat === format ? "active" : ""
                      }`}
                    >
                      {format}
                    </button>
                  ))}
                </div>
              </div>

              {mode === "3d-to-2d" && (
                <div className="mb-6">
                  <p className="text-sm text-muted-foreground mb-2">Output mode:</p>
                  <div className="inline-flex gap-2">
                    <button
                      onClick={() => setSpriteMode("single")}
                      className={`format-chip ${spriteMode === "single" ? "active" : ""}`}
                    >
                      Single Image
                    </button>
                    <button
                      onClick={() => setSpriteMode("sprite")}
                      className={`format-chip ${spriteMode === "sprite" ? "active" : ""}`}
                    >
                      Sprite Sheet
                    </button>
                  </div>

                  {spriteMode === "sprite" && (
                    <div className="mt-3 flex items-center gap-3">
                      <label className="text-xs text-muted-foreground">Angles:</label>
                      <select
                        value={spriteAngleCount}
                        onChange={(e) => setSpriteAngleCount(Number(e.target.value))}
                        className="rounded-md p-2 bg-secondary/50 text-sm"
                      >
                        <option value={4}>4</option>
                        <option value={8}>8</option>
                        <option value={16}>16</option>
                        <option value={32}>32</option>
                      </select>

                      <label className="text-xs text-muted-foreground">Resolution:</label>
                      <select
                        value={spriteResolution}
                        onChange={(e) => setSpriteResolution(Number(e.target.value))}
                        className="rounded-md p-2 bg-secondary/50 text-sm"
                      >
                        <option value={256}>256</option>
                        <option value={512}>512</option>
                        <option value={1024}>1024</option>
                      </select>
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-4 flex-1 flex flex-col">
                <div className="p-4 rounded-xl bg-secondary/50">
                  <h4 className="font-medium mb-2">Format Details</h4>
                  <p className="text-sm text-muted-foreground">
                    {getFormatDescription(selectedFormat)}
                  </p>
                </div>

                {/* Progress bar */}
                {isConverting && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Converting...</span>
                      <span className="font-medium">{progress}%</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-primary"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </div>
                )}

                {/* Error message */}
                {error && (
                  <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                )}

                {/* Result preview */}
                {resultUrl && mode === "3d-to-2d" && (
                  <div className="space-y-3 flex-1">
                    <p className="text-sm font-medium text-primary">
                      ✓ Conversion complete!
                    </p>
                    <div className="relative rounded-lg overflow-hidden bg-secondary/50 flex-1 min-h-[200px]">
                      <img
                        src={resultUrl}
                        alt="Converted result"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>
                )}

                {/* Preview 3D output for 2D→3D */}
                {resultFile && mode === "2d-to-3d" && (
                  <div className="space-y-3 flex-1">
                    <p className="text-sm font-medium text-primary">✓ Conversion complete!</p>
                    <div className="relative rounded-lg overflow-hidden bg-secondary/50 flex-1 min-h-[200px] flex items-center justify-center p-4">
                      <ModelPreview file={resultFile} className="h-64 w-full" />
                    </div>
                    <div className="text-xs text-muted-foreground">{resultFile.name} · {(resultFile.size / 1024 / 1024).toFixed(2)} MB</div>
                  </div>
                )}

                {/* Action buttons */}
                <div className="mt-auto">
                  {resultUrl ? (
                    <button
                      onClick={handleDownload}
                      className="w-full py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 glow-effect"
                    >
                      <Download className="w-5 h-5" />
                      Download {selectedFormat}
                    </button>
                  ) : (
                    <button
                      disabled={
                        uploadedFiles.length === 0 ||
                        isConverting ||
                        (mode === "2d-to-3d" &&
                          conversionMethod === "photogrammetry" &&
                          !hasEnoughImages)
                      }
                      onClick={handleConvert}
                      className={`w-full py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                        uploadedFiles.length > 0 &&
                        !isConverting &&
                        !(
                          mode === "2d-to-3d" &&
                          conversionMethod === "photogrammetry" &&
                          !hasEnoughImages
                        )
                          ? "bg-primary text-primary-foreground hover:bg-primary/90 glow-effect"
                          : "bg-secondary text-muted-foreground cursor-not-allowed"
                      }`}
                    >
                      {isConverting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Converting...
                        </>
                      ) : (
                        <>
                          <Box className="w-5 h-5" />
                          {uploadedFiles.length === 0
                            ? "Upload files to continue"
                            : mode === "2d-to-3d" &&
                              conversionMethod === "photogrammetry" &&
                              !hasEnoughImages
                            ? `Need ${minImagesForPhotogrammetry - uploadedFiles.length} more images`
                            : `Convert to ${selectedFormat}`}
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

function getFormatDescription(format: string): string {
  const descriptions: Record<string, string> = {
    FBX: "Industry standard for game development and animation. Supports rigging, animations, and materials.",
    OBJ: "Universal format supported by most 3D software. Great for static meshes and 3D printing.",
    GLTF: "Modern web-friendly format. Perfect for WebGL, AR/VR, and real-time applications.",
    GLB: "Binary version of GLTF. Compact and efficient for web deployment.",
    STL: "Standard format for 3D printing. Contains geometry only, no color or texture.",
    USDZ: "Apple's format for AR experiences on iOS devices.",
    DAE: "Collada format. Good for cross-platform exchange and game engines.",
    PNG: "Lossless format with transparency support. Best for detailed renders.",
    JPG: "Compressed format ideal for photos and realistic renders.",
    WEBP: "Modern format with excellent compression. Great for web use.",
  };
  return descriptions[format] || "Standard export format.";
}
