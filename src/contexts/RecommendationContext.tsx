import React, { createContext, useContext, useEffect, useState } from "react";
import { recommendationService } from "../services/RecommendationService";
import type { Song } from "../services/subsonic";

interface RecommendationContextValue {
  enabled: boolean;
  setEnabled: (v: boolean) => void;
  generateMixes: (songs: Song[]) => Record<string, Song[]>;
  getQuickPicks: (songs: Song[], limit?: number) => Song[];
  getPersonalizedFeed: (songs: Song[], limit?: number) => Song[];
  getListeningStats: () => ReturnType<typeof recommendationService.getListeningStats>;
  clearData: () => void;
}

const RecommendationContext = createContext<RecommendationContextValue | null>(null);

export function RecommendationProvider({ children }: { children: React.ReactNode }) {
  const [enabled, setEnabledState] = useState(true);

  useEffect(() => {
    recommendationService.initialize();
    setEnabledState(recommendationService.enabled);
  }, []);

  const setEnabled = (v: boolean) => {
    recommendationService.setEnabled(v);
    setEnabledState(v);
  };

  return (
    <RecommendationContext.Provider value={{
      enabled,
      setEnabled,
      generateMixes: (songs) => recommendationService.generateMixes(songs),
      getQuickPicks: (songs, limit) => recommendationService.getQuickPicks(songs, limit),
      getPersonalizedFeed: (songs, limit) => recommendationService.getPersonalizedFeed(songs, limit),
      getListeningStats: () => recommendationService.getListeningStats(),
      clearData: () => recommendationService.clearData(),
    }}>
      {children}
    </RecommendationContext.Provider>
  );
}

export function useRecommendation() {
  const ctx = useContext(RecommendationContext);
  if (!ctx) throw new Error("useRecommendation must be used within RecommendationProvider");
  return ctx;
}
