"use client";
import { createContext, useContext, useState, ReactNode } from "react";
import { Player } from "./types";

interface AppStore {
  players: Player[];
  setPlayers: (p: Player[]) => void;
  fileName: string;
  setFileName: (n: string) => void;
}

const StoreContext = createContext<AppStore | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [fileName, setFileName] = useState("");

  return (
    <StoreContext.Provider value={{ players, setPlayers, fileName, setFileName }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
