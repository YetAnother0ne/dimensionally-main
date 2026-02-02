import React, { createContext, useContext, useState } from "react";
import type { ConversionMode } from "@/hooks/use-conversion";

interface ConversionModeContextValue {
  mode: ConversionMode;
  setMode: (mode: ConversionMode) => void;
}

const ConversionModeContext = createContext<ConversionModeContextValue | undefined>(undefined);

export const ConversionModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<ConversionMode>("2d-to-3d");

  return (
    <ConversionModeContext.Provider value={{ mode, setMode }}>
      {children}
    </ConversionModeContext.Provider>
  );
};

export function useConversionMode() {
  const ctx = useContext(ConversionModeContext);
  if (!ctx) {
    throw new Error("useConversionMode must be used within a ConversionModeProvider");
  }
  return ctx;
}
