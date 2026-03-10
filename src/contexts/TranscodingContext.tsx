import React, { createContext, useContext, useEffect, useState } from "react";
import { transcodingService } from "../services/TranscodingService";

interface TranscodingState {
  enabled: boolean;
  bitrate: number;
  format: string;
  getCurrentBitrate: () => number | null;
  getCurrentFormat: () => string | null;
  setEnabled: (v: boolean) => void;
  setBitrate: (v: number) => void;
  setFormat: (v: string) => void;
}

const TranscodingContext = createContext<TranscodingState | null>(null);

export function TranscodingProvider({ children }: { children: React.ReactNode }) {
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const unsub = transcodingService.subscribe(() => forceUpdate((n) => n + 1));
    return unsub;
  }, []);

  const value: TranscodingState = {
    enabled: transcodingService.enabled,
    bitrate: transcodingService.bitrate,
    format: transcodingService.format,
    getCurrentBitrate: () => transcodingService.getCurrentBitrate(),
    getCurrentFormat: () => transcodingService.getCurrentFormat(),
    setEnabled: (v) => transcodingService.setEnabled(v),
    setBitrate: (v) => transcodingService.setBitrate(v),
    setFormat: (v) => transcodingService.setFormat(v),
  };

  return (
    <TranscodingContext.Provider value={value}>
      {children}
    </TranscodingContext.Provider>
  );
}

export function useTranscoding(): TranscodingState {
  const ctx = useContext(TranscodingContext);
  if (!ctx) throw new Error("useTranscoding must be used within TranscodingProvider");
  return ctx;
}
