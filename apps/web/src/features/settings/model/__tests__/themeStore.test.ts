import { beforeEach, describe, expect, it } from "vitest";
import { useThemeStore } from "../themeStore";

describe("themeStore", () => {
  beforeEach(() => {
    useThemeStore.getState().setTheme("dark");
  });

  it("defaults to dark", () => {
    expect(useThemeStore.getState().theme).toBe("dark");
  });

  it("setTheme switches the theme", () => {
    useThemeStore.getState().setTheme("light");
    expect(useThemeStore.getState().theme).toBe("light");
  });

  it("toggleTheme flips between dark and light", () => {
    const { toggleTheme } = useThemeStore.getState();
    toggleTheme();
    expect(useThemeStore.getState().theme).toBe("light");
    toggleTheme();
    expect(useThemeStore.getState().theme).toBe("dark");
  });
});
