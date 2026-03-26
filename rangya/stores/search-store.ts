import { create } from "zustand";

export type ColorTone = "ALL" | "WARM" | "COOL" | "NEUTRAL" | "DARK" | "LIGHT";

interface SearchState {
  query: string;
  colorTone: ColorTone;
  palette: string | null;
  setQuery: (q: string) => void;
  setColorTone: (tone: ColorTone) => void;
  setPalette: (color: string | null) => void;
  reset: () => void;
}

export const useSearchStore = create<SearchState>((set) => ({
  query: "",
  colorTone: "ALL",
  palette: null,
  setQuery: (q) => set({ query: q }),
  setColorTone: (tone) => set({ colorTone: tone }),
  setPalette: (color) => set({ palette: color }),
  reset: () => set({ query: "", colorTone: "ALL", palette: null }),
}));
