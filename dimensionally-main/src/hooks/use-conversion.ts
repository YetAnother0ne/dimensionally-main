import { useState, useCallback } from "react";
import { render3DTo2D, render3DToSpriteSheet, downloadBlob, type OutputFormat } from "@/lib/three-renderer";
import { convertImage2DTo3D, convertPhotogrammetry } from "@/lib/image-to-3d-service";

export type ConversionMode = "2d-to-3d" | "3d-to-2d";

interface ConversionState {
  isConverting: boolean;
  progress: number;
  error: string | null;
  result: Blob | null;
  resultUrl: string | null;
  // New: file wrapper and format for previewing 3D outputs
  resultFile: File | null;
  resultFormat: string | null;
}

export function useConversion() {
  const [state, setState] = useState<ConversionState>({
    isConverting: false,
    progress: 0,
    error: null,
    result: null,
    resultUrl: null,
    resultFile: null,
    resultFormat: null,
  });

  const convert3DTo2D = useCallback(
    async (
      file: File,
      format: OutputFormat,
      renderOptions?: { spriteAngleCount?: number; resolution?: number }
    ) => {
      setState({
        isConverting: true,
        progress: 0,
        error: null,
        result: null,
        resultUrl: null,
      });

      try {
        let blob: Blob;

        if (renderOptions?.spriteAngleCount) {
          // Render sprite sheet
          blob = await render3DToSpriteSheet(file, {
            angleCount: renderOptions.spriteAngleCount,
            resolution: renderOptions.resolution,
            onProgress: (p) => setState((prev) => ({ ...prev, progress: p })),
          });
        } else {
          setState((prev) => ({ ...prev, progress: 20 }));
          blob = await render3DTo2D(file, {
            width: 1024,
            height: 1024,
            format,
          });
          setState((prev) => ({ ...prev, progress: 80 }));
        }

        const url = URL.createObjectURL(blob);
        const fileName = `converted.${format.toString().toLowerCase()}`;
        const file = new File([blob], fileName, { type: blob.type });

        setState({
          isConverting: false,
          progress: 100,
          error: null,
          result: blob,
          resultUrl: url,
          resultFile: file,
          resultFormat: format.toString(),
        });

        return { blob, url, file };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Conversion failed";
        setState({
          isConverting: false,
          progress: 0,
          error: errorMessage,
          result: null,
          resultUrl: null,
        });
        throw err;
      }
    },
    []
  );

  const convert2DTo3D = useCallback(
    async (files: File[], format: string, method: "auto" | "photogrammetry" = "auto") => {
      if (files.length === 0) {
        setState({
          isConverting: false,
          progress: 0,
          error: "Please select an image file",
          result: null,
          resultUrl: null,
        });
        return null;
      }

      setState({
        isConverting: true,
        progress: 0,
        error: null,
        result: null,
        resultUrl: null,
      });

      try {
        let blob: Blob;

        if (method === "photogrammetry") {
          // Use photogrammetry with all provided images
          blob = await convertPhotogrammetry(files, format, {
            onProgress: (progress) => {
              setState((prev) => ({ ...prev, progress }));
            },
          });
        } else {
          // Use automated conversion with first image
          const file = files[0];
          blob = await convertImage2DTo3D(file, format, {
            onProgress: (progress) => {
              setState((prev) => ({ ...prev, progress }));
            },
          });
        }

        const url = URL.createObjectURL(blob);
        const fileName = `converted.${format?.toString().toLowerCase() ?? "bin"}`;
        const file = new File([blob], fileName, { type: blob.type });

        setState({
          isConverting: false,
          progress: 100,
          error: null,
          result: blob,
          resultUrl: url,
          resultFile: file,
          resultFormat: format || null,
        });

        return { blob, url, file };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Conversion failed";
        setState({
          isConverting: false,
          progress: 0,
          error: errorMessage,
          result: null,
          resultUrl: null,
        });
        return null;
      }
    },
    []
  );

  const downloadResult = useCallback(
    (filename: string) => {
      if (state.result) {
        downloadBlob(state.result, filename);
      }
    },
    [state.result]
  );

  const reset = useCallback(() => {
    if (state.resultUrl) {
      URL.revokeObjectURL(state.resultUrl);
    }
    setState({
      isConverting: false,
      progress: 0,
      error: null,
      result: null,
      resultUrl: null,
      resultFile: null,
      resultFormat: null,
    });
  }, [state.resultUrl]);

  return {
    ...state,
    convert3DTo2D,
    convert2DTo3D,
    downloadResult,
    reset,
  };
}
