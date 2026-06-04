import { create } from "zustand";

/**
 * UI theme. `dark` is the default SmartPatrol identity (navy + cyan); `light`
 * activates the Flip7-adapted "pertamina-light" palette. The chosen value is
 * persisted so the preference survives reloads, mirroring the original app.
 */
export type Theme = "dark" | "light";

const STORAGE_KEY = "smartpatrol.theme";

function loadPersisted(): Theme {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw === "light" ? "light" : "dark";
  } catch {
    return "dark";
  }
}

function savePersisted(theme: Theme): void {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    /* storage unavailable — ignore */
  }
}

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: loadPersisted(),

  setTheme: (theme) => {
    savePersisted(theme);
    set({ theme });
  },

  toggleTheme: () => {
    const next: Theme = get().theme === "dark" ? "light" : "dark";
    savePersisted(next);
    set({ theme: next });
  },
}));
